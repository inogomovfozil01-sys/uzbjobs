import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";
import { VacancyCard } from "@/components/jobs/VacancyCard";
import { Building2, MapPin, Globe, ShieldCheck, ArrowLeft } from "lucide-react";

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps) {
  const { slug } = await params;
  const company = await prisma.company.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
  });

  if (!company) return { title: "Компания не найдена" };

  return {
    title: `Работа и вакансии в ${company.name}`,
    description: company.description || `Актуальные вакансии компании ${company.name} в Узбекистане.`,
  };
}

export default async function CompanyDetailPage({ params }: CompanyPageProps) {
  const { slug } = await params;

  const company = await prisma.company.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      vacancies: {
        where: { status: VacancyStatus.ACTIVE },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Все компании
      </Link>

      {/* Company Header Card */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 font-black text-primary text-2xl">
              {company.name[0]}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
                {company.name}
                {company.isVerified && (
                  <span title="Проверенный работодатель">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </span>
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {company.city || "Узбекистан"}
                </span>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> {company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-secondary/80 px-4 py-2 text-center self-start sm:self-auto">
            <div className="text-xl font-bold text-foreground">{company.vacancies.length}</div>
            <div className="text-[11px] text-muted-foreground">Открытых вакансий</div>
          </div>
        </div>

        {company.description && (
          <div className="border-t pt-4 text-xs sm:text-sm text-foreground/80 leading-relaxed">
            {company.description}
          </div>
        )}
      </div>

      {/* Vacancies List */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          Открытые вакансии в {company.name} ({company.vacancies.length})
        </h2>

        {company.vacancies.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-xs text-muted-foreground">
            В данный момент у компании нет открытых вакансий в каталоге.
          </div>
        ) : (
          <div className="space-y-3">
            {company.vacancies.map((vacancy) => (
              <VacancyCard
                key={vacancy.id}
                vacancy={{ ...vacancy, company: { name: company.name, slug: company.slug } }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
