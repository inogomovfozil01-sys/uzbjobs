import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { Vacancy, VacancyStatus } from "@prisma/client";
import { VacancyAnalysis } from "@/validators/ai";

export interface DeduplicationCheckResult {
  isDuplicate: boolean;
  matchType?: "NORMALIZED_URL" | "SOURCE_URL" | "TITLE_COMPANY" | "CONTENT_HASH";
  existingVacancy?: Vacancy;
  confidence: number;
}

export class DeduplicationService {
  /**
   * Normalizes URLs by removing tracking parameters, fragments, trailing slashes,
   * and converting host to lowercase.
   */
  public normalizeUrl(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl);
      parsed.hostname = parsed.hostname.toLowerCase();
      parsed.hash = "";

      // List of tracking query parameters to drop
      const dropParams = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "fbclid",
        "gclid",
        "ref",
        "source",
        "from",
        "yclid",
      ];

      for (const param of dropParams) {
        parsed.searchParams.delete(param);
      }

      // Standardize trailing slashes
      let normalized = parsed.toString();
      if (normalized.endsWith("/")) {
        normalized = normalized.slice(0, -1);
      }
      return normalized;
    } catch {
      return rawUrl.trim().toLowerCase();
    }
  }

  /**
   * Generates a SHA-256 hash of normalized text.
   */
  public hashContent(text: string): string {
    const cleaned = text
      .toLowerCase()
      .replace(/[\s\W]+/g, " ")
      .trim();
    return crypto.createHash("sha256").update(cleaned).digest("hex");
  }

  /**
   * Cleans title and company name for comparison.
   */
  private cleanString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-zа-я0-9]/gi, "")
      .trim();
  }

  /**
   * Multi-layered deduplication check against the database.
   */
  public async checkForDuplicate(
    analysis: VacancyAnalysis,
    rawBodyText?: string
  ): Promise<DeduplicationCheckResult> {
    const normalizedUrl = this.normalizeUrl(analysis.sourceUrl);
    const contentHash = rawBodyText ? this.hashContent(rawBodyText) : this.hashContent(analysis.description);

    try {
      // Level 1: Normalized URL check
      const byNormalizedUrl = await prisma.vacancy.findFirst({
        where: { sourceNormalizedUrl: normalizedUrl },
      });
      if (byNormalizedUrl) {
        return {
          isDuplicate: true,
          matchType: "NORMALIZED_URL",
          existingVacancy: byNormalizedUrl,
          confidence: 1.0,
        };
      }

      // Level 2: Exact source URL check
      const bySourceUrl = await prisma.vacancy.findFirst({
        where: { sourceUrl: analysis.sourceUrl },
      });
      if (bySourceUrl) {
        return {
          isDuplicate: true,
          matchType: "SOURCE_URL",
          existingVacancy: bySourceUrl,
          confidence: 1.0,
        };
      }

      // Level 3: Content Hash check (for identical job descriptions cross-posted)
      if (contentHash) {
        const byHash = await prisma.vacancy.findFirst({
          where: { contentHash },
        });
        if (byHash) {
          return {
            isDuplicate: true,
            matchType: "CONTENT_HASH",
            existingVacancy: byHash,
            confidence: 0.95,
          };
        }
      }

      // Level 4: Title + Company match in active vacancies
      if (analysis.title && analysis.company) {
        const cleanTitle = this.cleanString(analysis.title);
        const cleanCompany = this.cleanString(analysis.company);

        // Fetch recent active vacancies with similar company name
        const candidates = await prisma.vacancy.findMany({
          where: {
            status: { in: [VacancyStatus.ACTIVE, VacancyStatus.PENDING_REVIEW] },
            OR: [
              { companyName: { contains: analysis.company, mode: "insensitive" } },
              { title: { contains: analysis.title, mode: "insensitive" } },
            ],
          },
          take: 20,
        });

        for (const cand of candidates) {
          const candTitle = this.cleanString(cand.title);
          const candCompany = this.cleanString(cand.companyName || "");

          if (
            (candTitle === cleanTitle || candTitle.includes(cleanTitle) || cleanTitle.includes(candTitle)) &&
            (candCompany === cleanCompany || candCompany.includes(cleanCompany) || cleanCompany.includes(candCompany))
          ) {
            return {
              isDuplicate: true,
              matchType: "TITLE_COMPANY",
              existingVacancy: cand,
              confidence: 0.9,
            };
          }
        }
      }

      return {
        isDuplicate: false,
        confidence: 0.0,
      };
    } catch (err) {
      console.error("Error during deduplication check:", err);
      // Fail safely to avoid blocking
      return { isDuplicate: false, confidence: 0 };
    }
  }

  /**
   * Updates an existing duplicate vacancy if details changed (e.g. salary, lastCheckedAt).
   */
  public async updateExistingVacancy(
    existing: Vacancy,
    analysis: VacancyAnalysis
  ): Promise<Vacancy> {
    return prisma.vacancy.update({
      where: { id: existing.id },
      data: {
        lastCheckedAt: new Date(),
        salaryMin: analysis.salaryMin ?? existing.salaryMin,
        salaryMax: analysis.salaryMax ?? existing.salaryMax,
        salaryCurrency: analysis.salaryCurrency ?? existing.salaryCurrency,
        salaryText: analysis.salaryText ?? existing.salaryText,
        status: analysis.isExpired ? VacancyStatus.EXPIRED : existing.status,
      },
    });
  }
}

export const deduplicationService = new DeduplicationService();
export default deduplicationService;
