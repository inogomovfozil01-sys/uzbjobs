import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";
import { Building2, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Компании Узбекистана",
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

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="h-7 w-7 text-primary" />
          Работодатели Узбекистана
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Каталог компаний, активно нанимающих специалистов в Ташкенте и других регионах
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.slug}`}
            className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-black text-primary text-xl">
                  {company.name[0]}
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {company._count.vacancies} вакансий
                </span>
              </div>

              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition flex items-center gap-1.5 text-base">
                  {company.name}
                  {company.isVerified && (
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  )}
                </h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {company.city || "Узбекистан"}
                </span>
              </div>

              {company.description && (
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {company.description}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t text-xs font-semibold text-primary flex items-center gap-1">
              Смотреть вакансии компании <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
