import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SavedClient } from "@/components/saved/SavedClient";
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

  return <SavedClient initialVacancies={vacancies} />;
}
