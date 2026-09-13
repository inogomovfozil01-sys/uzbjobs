import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { ReportSubmissionSchema } from "@/validators/job";
import { VacancyStatus } from "@prisma/client";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limiter";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const session = await getAuthSession();
  const userId = (session?.user as any)?.id;

  const rateLimit = checkRateLimit(userId || ip, "report_vacancy", RATE_LIMITS.REPORTS);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Слишком много жалоб. Попробуйте позже." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = ReportSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные жалобы", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { vacancyId, reason, details } = parsed.data;

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return NextResponse.json({ error: "Вакансия не найдена" }, { status: 404 });
    }

    // Save report
    const report = await prisma.report.create({
      data: {
        vacancyId,
        userId: userId || null,
        reason,
        details,
      },
    });

    // Check count of pending reports for this vacancy
    const reportCount = await prisma.report.count({
      where: { vacancyId, status: "PENDING" },
    });

    // If 3 or more reports, automatically flag for review
    if (reportCount >= 3 && vacancy.status === VacancyStatus.ACTIVE) {
      await prisma.vacancy.update({
        where: { id: vacancyId },
        data: { status: VacancyStatus.PENDING_REVIEW },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Спасибо! Ваша жалоба принята и будет рассмотрена модератором.",
        reportId: report.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Report submission error:", err);
    return NextResponse.json(
      { error: "Не удалось отправить жалобу" },
      { status: 500 }
    );
  }
}
