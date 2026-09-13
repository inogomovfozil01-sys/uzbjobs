import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ModerationDecision, ModerationCategory, VacancyStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const decisionFilter = searchParams.get("decision") as ModerationDecision | null;
  const categoryFilter = searchParams.get("category") as ModerationCategory | null;
  const contentTypeFilter = searchParams.get("contentType");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {};
    if (decisionFilter && Object.values(ModerationDecision).includes(decisionFilter)) {
      whereClause.decision = decisionFilter;
    }
    if (categoryFilter && Object.values(ModerationCategory).includes(categoryFilter)) {
      whereClause.category = categoryFilter;
    }
    if (contentTypeFilter) {
      whereClause.contentType = contentTypeFilter;
    }

    const [logs, totalLogs, statsCounts, pendingVacancies] = await Promise.all([
      prisma.moderationLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.moderationLog.count({ where: whereClause }),
      Promise.all([
        prisma.moderationLog.count(),
        prisma.moderationLog.count({ where: { decision: ModerationDecision.BLOCKED } }),
        prisma.moderationLog.count({ where: { decision: ModerationDecision.REVIEW } }),
        prisma.moderationLog.count({ where: { decision: ModerationDecision.SAFE } }),
        prisma.moderationLog.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
      ]),
      prisma.vacancy.findMany({
        where: { status: VacancyStatus.PENDING_REVIEW },
        include: {
          company: true,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    const [totalChecked, blockedCount, reviewCount, safeCount, last24HoursCount] = statsCounts;

    return NextResponse.json({
      logs,
      pendingVacancies,
      stats: {
        totalChecked,
        blockedCount,
        reviewCount,
        safeCount,
        last24HoursCount,
        pendingReviewVacancies: pendingVacancies.length,
      },
      pagination: {
        page,
        limit,
        total: totalLogs,
        totalPages: Math.ceil(totalLogs / limit),
      },
    });
  } catch (err: any) {
    console.error("Admin moderation API GET error:", err);
    return NextResponse.json({ error: "Ошибка при получении данных модерации" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const adminId = (session.user as any).id;

  try {
    const body = await req.json();
    const { action, vacancyId, reason } = body;

    if (!action) {
      return NextResponse.json({ error: "Действие не указано" }, { status: 400 });
    }

    if (action === "approve_vacancy" && vacancyId) {
      const vacancy = await prisma.vacancy.update({
        where: { id: vacancyId },
        data: {
          status: VacancyStatus.ACTIVE,
          isPromoted: false,
        },
      });

      await prisma.adminAction.create({
        data: {
          adminId,
          action: "APPROVE_VACANCY_MODERATION",
          targetType: "VACANCY",
          targetId: vacancyId,
          details: `Одобрена модератором: ${vacancy.title}`,
        },
      });

      return NextResponse.json({ success: true, message: "Вакансия успешно одобрена и опубликована" });
    }

    if (action === "reject_vacancy" && vacancyId) {
      const vacancy = await prisma.vacancy.update({
        where: { id: vacancyId },
        data: {
          status: VacancyStatus.REJECTED,
        },
      });

      await prisma.adminAction.create({
        data: {
          adminId,
          action: "REJECT_VACANCY_MODERATION",
          targetType: "VACANCY",
          targetId: vacancyId,
          details: `Отклонена модератором: ${reason || "18+ / не соответствует правилам"}`,
        },
      });

      return NextResponse.json({ success: true, message: "Вакансия отклонена и заблокирована" });
    }

    if (action === "delete_vacancy" && vacancyId) {
      await prisma.vacancy.delete({
        where: { id: vacancyId },
      });

      await prisma.adminAction.create({
        data: {
          adminId,
          action: "DELETE_VACANCY_MODERATION",
          targetType: "VACANCY",
          targetId: vacancyId,
          details: "Удалена безвозвратно из-за нарушения правил безопасности",
        },
      });

      return NextResponse.json({ success: true, message: "Вакансия полностью удалена" });
    }

    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin moderation API POST error:", err);
    return NextResponse.json({ error: "Не удалось выполнить действие модератора" }, { status: 500 });
  }
}
