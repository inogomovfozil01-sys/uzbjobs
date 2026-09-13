import { prisma } from "@/lib/prisma";
import { ScanStatus, ScanResultStatus, VacancyStatus } from "@prisma/client";
import googleSearchService from "@/services/search/google-search";
import vacancyAnalyzer from "@/services/ai/vacancy-analyzer";
import deduplicationService from "@/services/jobs/deduplicator";
import { safeFetchHtml } from "@/lib/security/ssrf";
import { slugify } from "@/lib/utils";
import contentModerationService from "@/services/moderation/content-moderator";

export interface ScannerLogMessage {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  text: string;
}

class JobScannerEngine {
  private isRunning: boolean = false;
  private shouldAbort: boolean = false;
  private currentScanId: string | null = null;
  private logs: ScannerLogMessage[] = [];
  private maxLogs = 200;

  public getStatus() {
    return {
      isRunning: this.isRunning,
      currentScanId: this.currentScanId,
      logs: this.logs.slice(-50),
    };
  }

  public getLogs() {
    return this.logs;
  }

  public addLog(text: string, level: "info" | "warn" | "error" | "success" = "info") {
    const time = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const logItem: ScannerLogMessage = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: time,
      level,
      text,
    };
    this.logs.push(logItem);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  public clearLogs() {
    this.logs = [];
  }

  public stopScan() {
    if (this.isRunning) {
      this.shouldAbort = true;
      this.addLog("Запрос на остановку сканера получен. Завершаем текущие задачи...", "warn");
    }
  }

  public async startScan(triggerType: string = "MANUAL", triggeredBy?: string): Promise<string> {
    if (this.isRunning) {
      throw new Error("Сканирование уже выполняется");
    }

    this.isRunning = true;
    this.shouldAbort = false;

    // Create Scan record in DB
    let scanRecord;
    try {
      scanRecord = await prisma.scan.create({
        data: {
          status: ScanStatus.RUNNING,
          triggerType,
          triggeredBy: triggeredBy || "admin",
        },
      });
      this.currentScanId = scanRecord.id;
    } catch (err: any) {
      this.isRunning = false;
      throw new Error(`Не удалось создать запись сканирования: ${err.message}`);
    }

    // Run async execution loop
    this.runPipeline(scanRecord.id).catch((err) => {
      console.error("Scanner pipeline unhandled error:", err);
      this.addLog(`Критическая ошибка пайплайна: ${err.message}`, "error");
    });

    return scanRecord.id;
  }

  private async runPipeline(scanId: string) {
    this.addLog(`Запуск AI-сканера UzbJobs (Scan ID: ${scanId.slice(0, 8)})...`, "info");

    let totalFound = 0;
    let accepted = 0;
    let rejected = 0;
    let duplicates = 0;
    let expired = 0;
    let errors = 0;

    // Read auto-approve threshold from system settings or default 85
    let autoApproveThreshold = 85;
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: "AUTO_APPROVE_THRESHOLD" },
      });
      if (setting && !isNaN(Number(setting.value))) {
        autoApproveThreshold = Number(setting.value);
      }
    } catch {}

    try {
      // 1. Fetch active search queries
      const queries = await prisma.searchQuery.findMany({
        where: { isActive: true },
        orderBy: { priority: "desc" },
      });

      if (queries.length === 0) {
        this.addLog("Нет активных поисковых запросов в базе данных.", "warn");
        await this.finishScan(scanId, ScanStatus.COMPLETED, { totalFound, accepted, rejected, duplicates, expired, errors });
        return;
      }

      this.addLog(`Загружено ${queries.length} активных поисковых запросов`, "info");

      // Check Google Search API configuration
      if (!googleSearchService.isConfigured()) {
        this.addLog("Google Search API не сконфигурирован. Проверьте GOOGLE_SEARCH_API_KEY и GOOGLE_SEARCH_ENGINE_ID в настройках.", "warn");
      }

      for (const queryItem of queries) {
        if (this.shouldAbort) {
          this.addLog("Сканирование остановлено пользователем.", "warn");
          break;
        }

        this.addLog(`Поиск по запросу: "${queryItem.query}"...`, "info");

        let searchItems = [];
        try {
          searchItems = await googleSearchService.searchJobs(queryItem.query, 10);
        } catch (err: any) {
          this.addLog(`Ошибка поиска "${queryItem.query}": ${err.message}`, "error");
          errors++;
          continue;
        }

        // Update query run info
        try {
          await prisma.searchQuery.update({
            where: { id: queryItem.id },
            data: {
              lastRunAt: new Date(),
              totalFound: { increment: searchItems.length },
            },
          });
        } catch {}

        this.addLog(`Найдено ${searchItems.length} результатов по "${queryItem.query}"`, "info");
        totalFound += searchItems.length;

        // Process each search result
        for (const item of searchItems) {
          if (this.shouldAbort) break;

          const url = item.link;
          const normalizedUrl = deduplicationService.normalizeUrl(url);

          // 2. Fast check if normalized URL is already processed in this scan or DB
          const existing = await prisma.vacancy.findFirst({
            where: { sourceNormalizedUrl: normalizedUrl },
          });

          if (existing) {
            this.addLog(`Дубликат обнаружен по URL: ${item.title.slice(0, 40)}`, "warn");
            duplicates++;
            await prisma.scanResult.create({
              data: {
                scanId,
                url,
                title: item.title,
                status: ScanResultStatus.DUPLICATE,
                reason: "URL already indexed in database",
              },
            });
            continue;
          }

          // 3. Fetch webpage content safely (SSRF protected)
          this.addLog(`Загрузка страницы: ${item.displayLink}...`, "info");
          let htmlContent = "";
          try {
            const fetchResult = await safeFetchHtml(url, 7000);
            if (fetchResult.status === 404 || fetchResult.status === 410) {
              this.addLog(`Страница недоступна (${fetchResult.status}): ${url}`, "warn");
              expired++;
              await prisma.scanResult.create({
                data: {
                  scanId,
                  url,
                  title: item.title,
                  status: ScanResultStatus.EXPIRED,
                  reason: `HTTP ${fetchResult.status}`,
                },
              });
              continue;
            }
            htmlContent = fetchResult.html;
          } catch (err: any) {
            this.addLog(`SSRF или ошибка загрузки (${err.message}): ${url.slice(0, 40)}`, "warn");
            // Still attempt analysis using snippet if available
          }

          // 4. Pass content to Gemini Vacancy Analyzer
          this.addLog(`Анализ вакансии через Gemini: "${item.title.slice(0, 40)}"...`, "info");

          try {
            const analysisResult = await vacancyAnalyzer.analyzePage({
              url,
              title: item.title,
              snippet: item.snippet,
              rawHtml: htmlContent,
            });

            const { analysis, qualityScore, isVacancy } = analysisResult;

            if (!analysis || !isVacancy) {
              this.addLog(`Страница не является вакансией: ${url.slice(0, 40)}`, "warn");
              rejected++;
              await prisma.scanResult.create({
                data: {
                  scanId,
                  url,
                  title: item.title,
                  status: ScanResultStatus.REJECTED,
                  reason: "Not a real vacancy according to AI analysis",
                  qualityScore,
                },
              });
              continue;
            }

            // 4.5. AI Safety & 18+ Content Moderation
            const textToModerate = `${analysis.title} ${analysis.company || ""} ${analysis.description} ${(analysis.requirements || []).join(" ")} ${(analysis.responsibilities || []).join(" ")}`;
            const moderation = await contentModerationService.moderateContent({
              content: textToModerate,
              url,
              contentType: "VACANCY",
              source: "AI_SCANNER",
            });

            if (moderation.decision === "BLOCKED") {
              this.addLog(
                `🚨 18+ контент заблокирован: "${analysis.title.slice(0, 40)}" [${moderation.category}: ${moderation.reason}]`,
                "error"
              );
              rejected++;
              await prisma.scanResult.create({
                data: {
                  scanId,
                  url,
                  title: analysis.title,
                  company: analysis.company || undefined,
                  status: ScanResultStatus.REJECTED,
                  reason: "ADULT_CONTENT",
                  qualityScore: 0,
                },
              });
              continue;
            }

            if (moderation.decision === "REVIEW") {
              this.addLog(
                `⚠️ Сомнительный контент направлен на ручную модерацию: "${analysis.title.slice(0, 40)}" [${moderation.reason}]`,
                "warn"
              );
            }

            if (analysis.isExpired) {
              this.addLog(`Вакансия устарела / закрыта: ${analysis.title}`, "warn");
              expired++;
              await prisma.scanResult.create({
                data: {
                  scanId,
                  url,
                  title: analysis.title,
                  company: analysis.company || undefined,
                  status: ScanResultStatus.EXPIRED,
                  reason: "AI detected expired/closed vacancy",
                  qualityScore,
                },
              });
              continue;
            }

            // 5. Check multi-level deduplication
            const dedupResult = await deduplicationService.checkForDuplicate(analysis, htmlContent);
            if (dedupResult.isDuplicate && dedupResult.existingVacancy) {
              this.addLog(`Дубликат обнаружен (${dedupResult.matchType}): ${analysis.title}`, "warn");
              duplicates++;
              await deduplicationService.updateExistingVacancy(dedupResult.existingVacancy, analysis);
              await prisma.scanResult.create({
                data: {
                  scanId,
                  url,
                  title: analysis.title,
                  company: analysis.company || undefined,
                  status: ScanResultStatus.DUPLICATE,
                  reason: `Matched via ${dedupResult.matchType}`,
                  qualityScore,
                },
              });
              continue;
            }

            // 6. Connect or create Company
            let companyId: string | undefined = undefined;
            if (analysis.company && analysis.company.trim().length > 0) {
              const compSlug = slugify(analysis.company);
              try {
                const comp = await prisma.company.upsert({
                  where: { slug: compSlug },
                  update: {},
                  create: {
                    name: analysis.company,
                    slug: compSlug,
                    city: analysis.city || "Ташкент",
                    country: analysis.country || "Uzbekistan",
                  },
                });
                companyId = comp.id;
              } catch {}
            }

            // 7. Determine Vacancy Status (Auto-approve vs Pending Review)
            const vacancyStatus =
              moderation.decision === "REVIEW"
                ? VacancyStatus.PENDING_REVIEW
                : qualityScore >= autoApproveThreshold
                ? VacancyStatus.ACTIVE
                : VacancyStatus.PENDING_REVIEW;

            // Generate unique slug
            const baseSlug = slugify(`${analysis.title}-${analysis.company || "job"}`);
            const randomSuffix = Math.random().toString(36).substring(2, 7);
            const uniqueSlug = `${baseSlug}-${randomSuffix}`;

            // Save vacancy to DB
            const contentHash = deduplicationService.hashContent(analysis.description);

            await prisma.vacancy.create({
              data: {
                title: analysis.title,
                slug: uniqueSlug,
                companyId: companyId,
                companyName: analysis.company || "Компания",
                description: analysis.description,
                shortDescription: analysis.shortDescription,
                salaryMin: analysis.salaryMin,
                salaryMax: analysis.salaryMax,
                salaryCurrency: analysis.salaryCurrency || "UZS",
                salaryText: analysis.salaryText,
                location: analysis.location || analysis.city || "Узбекистан",
                city: analysis.city || "Ташкент",
                country: analysis.country || "Uzbekistan",
                employmentType: analysis.employmentType,
                experienceLevel: analysis.experienceLevel,
                isRemote: analysis.isRemote,
                skills: analysis.skills,
                requirements: analysis.requirements,
                responsibilities: analysis.responsibilities,
                benefits: analysis.benefits,
                sourceUrl: url,
                sourceNormalizedUrl: normalizedUrl,
                applicationUrl: analysis.applicationUrl || url,
                sourceName: analysis.sourceName || item.displayLink,
                contactEmail: analysis.contactEmail,
                contactPhone: analysis.contactPhone,
                publishedAt: analysis.publishedAt ? new Date(analysis.publishedAt) : new Date(),
                status: vacancyStatus,
                qualityScore: qualityScore,
                relevanceScore: analysis.relevanceScore,
                contentHash: contentHash,
                category: analysis.category || "IT / Software",
              },
            });

            accepted++;
            this.addLog(
              `Вакансия добавлена (${vacancyStatus}): ${analysis.title} [Score: ${qualityScore}]`,
              "success"
            );

            await prisma.scanResult.create({
              data: {
                scanId,
                url,
                title: analysis.title,
                company: analysis.company || undefined,
                status: ScanResultStatus.ACCEPTED,
                qualityScore,
              },
            });
          } catch (err: any) {
            this.addLog(`Ошибка обработки вакансии: ${err.message}`, "error");
            errors++;
            await prisma.scanResult.create({
              data: {
                scanId,
                url,
                title: item.title,
                status: ScanResultStatus.ERROR,
                reason: err.message,
              },
            });
          }

          // Gentle delay between analysis calls
          await new Promise((r) => setTimeout(r, 1500));
        }
      }

      await this.finishScan(
        scanId,
        this.shouldAbort ? ScanStatus.CANCELLED : ScanStatus.COMPLETED,
        { totalFound, accepted, rejected, duplicates, expired, errors }
      );
    } catch (err: any) {
      this.addLog(`Сбой сканирования: ${err.message}`, "error");
      await this.finishScan(scanId, ScanStatus.FAILED, {
        totalFound,
        accepted,
        rejected,
        duplicates,
        expired,
        errors: errors + 1,
      });
    }
  }

  private async finishScan(
    scanId: string,
    status: ScanStatus,
    metrics: {
      totalFound: number;
      accepted: number;
      rejected: number;
      duplicates: number;
      expired: number;
      errors: number;
    }
  ) {
    this.isRunning = false;
    this.currentScanId = null;

    try {
      await prisma.scan.update({
        where: { id: scanId },
        data: {
          status,
          completedAt: new Date(),
          totalFound: metrics.totalFound,
          accepted: metrics.accepted,
          rejected: metrics.rejected,
          duplicates: metrics.duplicates,
          expired: metrics.expired,
          errors: metrics.errors,
        },
      });
    } catch (err) {
      console.error("Failed to update final scan record:", err);
    }

    this.addLog(
      `Сканирование завершено со статусом ${status}. Принято: ${metrics.accepted}, дубликатов: ${metrics.duplicates}, отклонено: ${metrics.rejected}, ошибок: ${metrics.errors}`,
      status === ScanStatus.COMPLETED ? "success" : "warn"
    );
  }
}

export const jobScanner = new JobScannerEngine();
export default jobScanner;
