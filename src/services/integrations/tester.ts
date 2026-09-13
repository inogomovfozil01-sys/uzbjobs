import { prisma } from "@/lib/prisma";
import { IntegrationService, IntegrationStatus } from "@prisma/client";
import geminiService from "@/services/ai/gemini-service";
import googleSearchService from "@/services/search/google-search";
import emailService from "@/services/email/email-service";

export interface IntegrationStatusDetail {
  service: IntegrationService;
  status: IntegrationStatus;
  message: string;
  latencyMs?: number;
  lastTestedAt?: Date;
  metadata?: Record<string, any>;
}

export class IntegrationsTester {
  public async testDatabase(): Promise<IntegrationStatusDetail> {
    const start = Date.now();
    try {
      // Check connection by performing simple count
      await prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - start;
      const detail: IntegrationStatusDetail = {
        service: IntegrationService.DATABASE,
        status: IntegrationStatus.CONNECTED,
        latencyMs,
        message: `База данных PostgreSQL подключена (${latencyMs}ms)`,
      };
      await this.saveStatus(detail);
      return detail;
    } catch (err: any) {
      const isNotConfigured = !process.env.DATABASE_URL;
      const detail: IntegrationStatusDetail = {
        service: IntegrationService.DATABASE,
        status: isNotConfigured ? IntegrationStatus.NOT_CONFIGURED : IntegrationStatus.ERROR,
        message: isNotConfigured
          ? "DATABASE_URL не указан в .env файле"
          : `Ошибка подключения к PostgreSQL: ${err.message}`,
      };
      await this.saveStatus(detail);
      return detail;
    }
  }

  public async testGemini(): Promise<IntegrationStatusDetail> {
    if (!geminiService.isConfigured()) {
      const detail: IntegrationStatusDetail = {
        service: IntegrationService.GEMINI,
        status: IntegrationStatus.NOT_CONFIGURED,
        message: "GEMINI_API_KEY отсутствует в переменных окружения",
      };
      await this.saveStatus(detail);
      return detail;
    }

    const testRes = await geminiService.testConnection();
    const detail: IntegrationStatusDetail = {
      service: IntegrationService.GEMINI,
      status: testRes.success ? IntegrationStatus.CONNECTED : IntegrationStatus.ERROR,
      latencyMs: testRes.latencyMs,
      message: testRes.message,
    };
    await this.saveStatus(detail);
    return detail;
  }

  public async testGoogleSearch(): Promise<IntegrationStatusDetail> {
    if (!googleSearchService.isConfigured()) {
      const detail: IntegrationStatusDetail = {
        service: IntegrationService.GOOGLE_SEARCH,
        status: IntegrationStatus.NOT_CONFIGURED,
        message: "GOOGLE_SEARCH_API_KEY или GOOGLE_SEARCH_ENGINE_ID не заданы",
      };
      await this.saveStatus(detail);
      return detail;
    }

    const start = Date.now();
    try {
      const items = await googleSearchService.searchJobs("IT jobs Uzbekistan", 1);
      const latencyMs = Date.now() - start;
      const detail: IntegrationStatusDetail = {
        service: IntegrationService.GOOGLE_SEARCH,
        status: IntegrationStatus.CONNECTED,
        latencyMs,
        message: `Google Programmable Search работает (найдено ${items.length} результатов, ${latencyMs}ms)`,
      };
      await this.saveStatus(detail);
      return detail;
    } catch (err: any) {
      const detail: IntegrationStatusDetail = {
        service: IntegrationService.GOOGLE_SEARCH,
        status: IntegrationStatus.ERROR,
        latencyMs: Date.now() - start,
        message: `Ошибка запроса к Google Search API: ${err.message}`,
      };
      await this.saveStatus(detail);
      return detail;
    }
  }

  public async testEmail(): Promise<IntegrationStatusDetail> {
    if (!emailService.isConfigured()) {
      const detail: IntegrationStatusDetail = {
        service: IntegrationService.EMAIL,
        status: IntegrationStatus.NOT_CONFIGURED,
        message: "SMTP учетные данные не настроены (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)",
      };
      await this.saveStatus(detail);
      return detail;
    }

    const res = await emailService.testConnection();
    const detail: IntegrationStatusDetail = {
      service: IntegrationService.EMAIL,
      status: res.success ? IntegrationStatus.CONNECTED : IntegrationStatus.ERROR,
      latencyMs: res.latencyMs,
      message: res.message,
    };
    await this.saveStatus(detail);
    return detail;
  }

  public async testAuth(): Promise<IntegrationStatusDetail> {
    const hasSecret = Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
    const hasGoogleOauth = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

    if (!hasGoogleOauth) {
      const detail: IntegrationStatusDetail = {
        service: IntegrationService.AUTH,
        status: IntegrationStatus.NOT_CONFIGURED,
        message: "Google OAuth не настроен: GOOGLE_CLIENT_ID или GOOGLE_CLIENT_SECRET отсутствуют в .env (Email/Password активен)",
      };
      await this.saveStatus(detail);
      return detail;
    }

    const detail: IntegrationStatusDetail = {
      service: IntegrationService.AUTH,
      status: IntegrationStatus.CONNECTED,
      message: "Google OAuth подключен и готов к работе (Client ID настроен) + Email/Password",
    };
    await this.saveStatus(detail);
    return detail;
  }

  public async testCron(): Promise<IntegrationStatusDetail> {
    const hasCronSecret = Boolean(process.env.CRON_SECRET);
    if (!hasCronSecret) {
      const detail: IntegrationStatusDetail = {
        service: IntegrationService.CRON,
        status: IntegrationStatus.NOT_CONFIGURED,
        message: "CRON_SECRET не задан",
      };
      await this.saveStatus(detail);
      return detail;
    }

    const detail: IntegrationStatusDetail = {
      service: IntegrationService.CRON,
      status: IntegrationStatus.CONNECTED,
      message: "Cron фоновый запуск защищен CRON_SECRET токеном",
    };
    await this.saveStatus(detail);
    return detail;
  }

  public async testAll(): Promise<Record<string, IntegrationStatusDetail>> {
    const [db, gemini, search, email, auth, cron] = await Promise.all([
      this.testDatabase(),
      this.testGemini(),
      this.testGoogleSearch(),
      this.testEmail(),
      this.testAuth(),
      this.testCron(),
    ]);

    return {
      database: db,
      gemini,
      googleSearch: search,
      email,
      auth,
      cron,
    };
  }

  public async getStatuses(): Promise<Record<string, IntegrationStatusDetail>> {
    // Check saved in DB or run quick probes
    try {
      const records = await prisma.apiIntegration.findMany();
      const map: Record<string, IntegrationStatusDetail> = {};
      for (const r of records) {
        map[r.service.toLowerCase()] = {
          service: r.service,
          status: r.status,
          message: r.lastError || "Настроено",
          lastTestedAt: r.lastTestedAt || undefined,
        };
      }
      return map;
    } catch {
      return {};
    }
  }

  private async saveStatus(detail: IntegrationStatusDetail) {
    try {
      await prisma.apiIntegration.upsert({
        where: { service: detail.service },
        update: {
          status: detail.status,
          lastTestedAt: new Date(),
          lastError: detail.status === IntegrationStatus.CONNECTED ? null : detail.message,
          metadata: detail.latencyMs ? JSON.stringify({ latencyMs: detail.latencyMs }) : null,
        },
        create: {
          service: detail.service,
          status: detail.status,
          lastTestedAt: new Date(),
          lastError: detail.status === IntegrationStatus.CONNECTED ? null : detail.message,
          metadata: detail.latencyMs ? JSON.stringify({ latencyMs: detail.latencyMs }) : null,
        },
      });
    } catch {}
  }
}

export const integrationsTester = new IntegrationsTester();
export default integrationsTester;
