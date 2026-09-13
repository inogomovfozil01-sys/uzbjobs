import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";
import { Metadata } from "next";
import { HomeClient } from "@/components/home/HomeClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "UzbJobs — AI-платформа поиска работы в Узбекистане",
  description: "Главная страница поиска работы в Узбекистане с AI-подбором. Тысячи проверенных вакансий от ведущих IT-компаний и работодателей.",
};

export default async function HomePage() {
  // Fetch real data from PostgreSQL
  let latestVacancies: any[] = [];
  let remoteVacancies: any[] = [];
  let featuredCompanies: any[] = [];
  let totalVacanciesCount = 0;
  let activeCompaniesCount = 0;

  try {
    [
      latestVacancies,
      remoteVacancies,
      featuredCompanies,
      totalVacanciesCount,
      activeCompaniesCount,
    ] = await Promise.all([
      prisma.vacancy.findMany({
        where: { status: VacancyStatus.ACTIVE },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { company: true },
      }),
      prisma.vacancy.findMany({
        where: { status: VacancyStatus.ACTIVE, isRemote: true },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { company: true },
      }),
      prisma.company.findMany({
        take: 6,
        orderBy: { vacancies: { _count: "desc" } },
        include: {
          _count: {
            select: { vacancies: { where: { status: VacancyStatus.ACTIVE } } },
          },
        },
      }),
      prisma.vacancy.count({ where: { status: VacancyStatus.ACTIVE } }),
      prisma.company.count(),
    ]);
  } catch (err) {
    console.error("Home page DB load error:", err);
  }

  return (
    <HomeClient
      latestVacancies={latestVacancies}
      remoteVacancies={remoteVacancies}
      featuredCompanies={featuredCompanies}
      totalVacanciesCount={totalVacanciesCount}
      activeCompaniesCount={activeCompaniesCount}
    />
  );
}
