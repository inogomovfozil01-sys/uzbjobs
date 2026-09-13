import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatSalary, formatDate } from "@/lib/utils";
import { VacancyDetailClient } from "./VacancyDetailClient";
import {
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  Layers,
  ArrowLeft,
} from "lucide-react";

interface VacancyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VacancyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await prisma.vacancy.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: { company: true },
  });

  if (!vacancy) {
    return { title: "Вакансия не найдена" };
  }

  const company = vacancy.companyName || vacancy.company?.name || "Компания";
  const title = `${vacancy.title} — ${company}`;
  const description =
    vacancy.shortDescription ||
    vacancy.description.slice(0, 160).replace(/[\r\n]+/g, " ");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: vacancy.publishedAt?.toISOString(),
      url: `/jobs/${vacancy.slug}`,
    },
  };
}

export default async function VacancyDetailPage({ params }: VacancyPageProps) {
  const { slug } = await params;

  const vacancy = await prisma.vacancy.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      company: true,
    },
  });

  if (!vacancy) {
    notFound();
  }

  // Schema.org JobPosting structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title,
    description: vacancy.description,
    datePosted: vacancy.publishedAt?.toISOString() || vacancy.createdAt.toISOString(),
    validThrough: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: vacancy.employmentType?.toUpperCase() || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: vacancy.companyName || vacancy.company?.name || "Работодатель",
      sameAs: vacancy.company?.website || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: vacancy.city || "Ташкент",
        addressCountry: "UZ",
      },
    },
    baseSalary:
      vacancy.salaryMin || vacancy.salaryMax
        ? {
            "@type": "MonetaryAmount",
            currency: vacancy.salaryCurrency || "UZS",
            value: {
              "@type": "QuantitativeValue",
              minValue: vacancy.salaryMin || undefined,
              maxValue: vacancy.salaryMax || undefined,
              unitText: "MONTH",
            },
          }
        : undefined,
  };

  const salaryDisplay = formatSalary(
    vacancy.salaryMin,
    vacancy.salaryMax,
    vacancy.salaryCurrency || "UZS",
    vacancy.salaryText
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Structured data injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Ко всем вакансиям
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {vacancy.company?.slug ? (
                  <Link
                    href={`/companies/${vacancy.company.slug}`}
                    className="font-bold text-foreground hover:text-primary transition"
                  >
                    {vacancy.companyName || vacancy.company.name}
                  </Link>
                ) : (
                  <span className="font-bold text-foreground">
                    {vacancy.companyName || "Компания"}
                  </span>
                )}
              </span>

              {vacancy.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Проверено
                </span>
              )}

              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Опубликовано: {formatDate(vacancy.publishedAt)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {vacancy.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-block text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {salaryDisplay}
              </span>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2 pt-2 border-t text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {vacancy.location || vacancy.city || "Ташкент"}
              </span>

              {vacancy.isRemote && (
                <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 font-medium text-blue-600 dark:text-blue-400">
                  Удаленный формат
                </span>
              )}

              {vacancy.experienceLevel && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  {vacancy.experienceLevel}
                </span>
              )}

              {vacancy.employmentType && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" />
                  {vacancy.employmentType}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-foreground">Описание позиции</h2>
            <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
              {vacancy.description}
            </div>
          </div>

          {/* Requirements */}
          {vacancy.requirements && vacancy.requirements.length > 0 && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-foreground">Требования к кандидату</h2>
              <ul className="space-y-2 text-sm text-foreground/90 list-disc list-inside">
                {vacancy.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-foreground">Обязанности</h2>
              <ul className="space-y-2 text-sm text-foreground/90 list-disc list-inside">
                {vacancy.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {vacancy.benefits && vacancy.benefits.length > 0 && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-foreground">Условия и бонусы</h2>
              <ul className="space-y-2 text-sm text-foreground/90 list-disc list-inside">
                {vacancy.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {vacancy.skills && vacancy.skills.length > 0 && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-foreground">Ключевые навыки</h2>
              <div className="flex flex-wrap gap-2">
                {vacancy.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Attribution Notice */}
          <div className="rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">Первоисточник вакансии</p>
              <p>
                Опубликовано на: <span className="text-foreground">{vacancy.sourceName || "Внешний сайт"}</span>
              </p>
            </div>
            <a
              href={vacancy.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 font-medium text-primary hover:underline shrink-0"
            >
              Открыть источник <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Sidebar Actions Client Component */}
        <div className="space-y-6">
          <VacancyDetailClient vacancy={vacancy as any} />
        </div>
      </div>
    </div>
  );
}
