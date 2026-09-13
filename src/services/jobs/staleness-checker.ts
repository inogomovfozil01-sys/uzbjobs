import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";
import { safeFetchHtml } from "@/lib/security/ssrf";

const CLOSED_KEYWORDS = [
  "вакансия закрыта",
  "вакансия в архиве",
  "объявление снято",
  "позиция закрыта",
  "ish o'rni yopildi",
  "vakansiya yopilgan",
  "job closed",
  "position filled",
  "no longer accepting applications",
  "page not found",
  "404 not found",
];

export class StalenessChecker {
  /**
   * Checks a single vacancy URL for 404, redirects to archived pages, or closed markers.
   */
  public async checkVacancyActuality(vacancyId: string): Promise<{
    status: VacancyStatus;
    reason?: string;
  }> {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return { status: VacancyStatus.EXPIRED, reason: "Vacancy not found in DB" };
    }

    try {
      const { html, status } = await safeFetchHtml(vacancy.sourceUrl, 7000);

      // 404 or 410 -> Expired
      if (status === 404 || status === 410) {
        await prisma.vacancy.update({
          where: { id: vacancyId },
          data: {
            status: VacancyStatus.EXPIRED,
            lastCheckedAt: new Date(),
          },
        });
        return { status: VacancyStatus.EXPIRED, reason: `HTTP status ${status}` };
      }

      if (status >= 400) {
        return { status: vacancy.status, reason: `HTTP status ${status}, preserving current status` };
      }

      // Check text for closed phrases
      const lower = html.toLowerCase();
      for (const keyword of CLOSED_KEYWORDS) {
        if (lower.includes(keyword)) {
          await prisma.vacancy.update({
            where: { id: vacancyId },
            data: {
              status: VacancyStatus.EXPIRED,
              lastCheckedAt: new Date(),
            },
          });
          return { status: VacancyStatus.EXPIRED, reason: `Detected keyword: "${keyword}"` };
        }
      }

      // Still active
      await prisma.vacancy.update({
        where: { id: vacancyId },
        data: {
          lastCheckedAt: new Date(),
        },
      });

      return { status: VacancyStatus.ACTIVE };
    } catch (err: any) {
      return { status: vacancy.status, reason: `Fetch error: ${err.message}` };
    }
  }

  /**
   * Re-checks active vacancies that haven't been verified recently.
   */
  public async checkStaleVacancies(batchSize: number = 20): Promise<{
    checked: number;
    expired: number;
  }> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago

    const vacancies = await prisma.vacancy.findMany({
      where: {
        status: VacancyStatus.ACTIVE,
        lastCheckedAt: { lt: cutoff },
      },
      take: batchSize,
      orderBy: { lastCheckedAt: "asc" },
    });

    let expired = 0;

    for (const v of vacancies) {
      const result = await this.checkVacancyActuality(v.id);
      if (result.status === VacancyStatus.EXPIRED) {
        expired++;
      }
      // Be polite to targets
      await new Promise((r) => setTimeout(r, 1000));
    }

    return { checked: vacancies.length, expired };
  }
}

export const stalenessChecker = new StalenessChecker();
export default stalenessChecker;
