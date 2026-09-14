import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";
import { CompaniesClient } from "@/components/companies/CompaniesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Компании Узбекистана — UzbJobs",
  description: "Каталог проверенных работодателей и IT-компаний в Узбекистане.",
};

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { vacancies: { _count: "desc" } },
    include: {
      _count: {
        select: {
          vacancies: {
            where: { status: VacancyStatus.ACTIVE },
          },
        },
      },
    },
  });

  return <CompaniesClient companies={companies} />;
}
