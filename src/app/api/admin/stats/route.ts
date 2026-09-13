import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { VacancyStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ error: "Доступ запрещен: требуются права администратора" }, { status: 403 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalVacancies,
      activeVacancies,
      pendingVacancies,
      newToday,
      totalCompanies,
      totalUsers,
      totalAIAnalyses,
      totalSearches,
      errorCount,
      recentScans,
    ] = await Promise.all([
      prisma.vacancy.count(),
      prisma.vacancy.count({ where: { status: VacancyStatus.ACTIVE } }),
      prisma.vacancy.count({ where: { status: VacancyStatus.PENDING_REVIEW } }),
      prisma.vacancy.count({ where: { createdAt: { gte: today } } }),
      prisma.company.count(),
      prisma.user.count(),
      prisma.aIAnalysisLog.count(),
      prisma.searchLog.count(),
      prisma.errorLog.count(),
      prisma.scan.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Vacancies grouped by city
    const cityGroups = await prisma.vacancy.groupBy({
      by: ["city"],
      where: { status: VacancyStatus.ACTIVE },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    });

    // Vacancies grouped by category
    const categoryGroups = await prisma.vacancy.groupBy({
      by: ["category"],
      where: { status: VacancyStatus.ACTIVE },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    });

    return NextResponse.json({
      metrics: {
        totalVacancies,
        activeVacancies,
        pendingVacancies,
        newToday,
        totalCompanies,
        totalUsers,
        totalAIAnalyses,
        totalSearches,
        errorCount,
      },
      charts: {
        cities: cityGroups.map((c) => ({ name: c.city || "Другие", count: c._count.id })),
        categories: categoryGroups.map((c) => ({ name: c.category || "IT", count: c._count.id })),
      },
      recentScans,
    });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    return NextResponse.json({
      metrics: {
        totalVacancies: 0,
        activeVacancies: 0,
        pendingVacancies: 0,
        newToday: 0,
        totalCompanies: 0,
        totalUsers: 1,
        totalAIAnalyses: 0,
        totalSearches: 0,
        errorCount: 0,
      },
      charts: {
        cities: [],
        categories: [],
      },
      recentScans: [],
      warning: "База данных PostgreSQL еще не подключена или недоступна. Настройте DATABASE_URL в Vercel.",
    });
  }
}
