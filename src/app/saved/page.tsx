import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VacancyCard } from "@/components/jobs/VacancyCard";
import { Bookmark, Search } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Сохранённые вакансии — UzbJobs",
  description: "Список ваших сохранённых вакансий и закладок на UzbJobs",
};

export default async function SavedJobsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/saved");
  }

  const userId = (session.user as any).id;

  const savedItems = await prisma.savedVacancy.findMany({
    where: { userId },
    include: {
      vacancy: {
        include: {
          company: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const vacancies = savedItems.map((s) => ({
    id: s.vacancy.id,
    slug: s.vacancy.slug,
    title: s.vacancy.title,
    companyName: s.vacancy.companyName,
    companyLogo: s.vacancy.company?.logo || null,
    city: s.vacancy.city,
    isRemote: s.vacancy.isRemote,
    salaryMin: s.vacancy.salaryMin,
    salaryMax: s.vacancy.salaryMax,
    salaryCurrency: s.vacancy.salaryCurrency,
    employmentType: s.vacancy.employmentType,
    experienceLevel: s.vacancy.experienceLevel,
    skills: s.vacancy.skills,
    publishedAt: s.vacancy.publishedAt?.toISOString() || s.vacancy.createdAt.toISOString(),
    qualityScore: s.vacancy.qualityScore,
    isSaved: true,
  }));

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Bookmark className="h-7 w-7 text-primary fill-primary" />
            Сохранённые вакансии
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {vacancies.length > 0
              ? `У вас сохранено вакансий: ${vacancies.length}`
              : "Вы пока не сохранили ни одной вакансии"}
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:opacity-90 transition"
        >
          <Search className="h-3.5 w-3.5" />
          Искать новые вакансии
        </Link>
      </div>

      {vacancies.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-xs text-muted-foreground space-y-3">
          <Bookmark className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="font-semibold text-foreground text-sm">Список пуст</p>
          <p className="max-w-md mx-auto">
            Нажимайте иконку закладки на любой понравившейся вакансии в каталоге, чтобы быстро вернуться к ней позже.
          </p>
          <div className="pt-2">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold text-xs"
            >
              Перейти к каталогу вакансий →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {vacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      )}
    </div>
  );
}
