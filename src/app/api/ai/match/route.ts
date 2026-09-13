import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import aiMatcherService from "@/services/ai/matcher";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limiter";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const session = await getAuthSession();
  const userId = (session?.user as any)?.id || `guest-${ip}`;

  const rateConfig = session?.user ? RATE_LIMITS.AI_USER : RATE_LIMITS.AI_GUEST;
  const rateLimit = checkRateLimit(userId, "ai_match", rateConfig);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Слишком много запросов к AI Match. Пожалуйста, подождите минуту." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { vacancyId, guestSkills, guestExperience } = body;

    if (!vacancyId) {
      return NextResponse.json({ error: "Не указан vacancyId" }, { status: 400 });
    }

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return NextResponse.json({ error: "Вакансия не найдена" }, { status: 404 });
    }

    // Determine user profile (from DB if authenticated, or guest parameters)
    let userProfile = {
      skills: [] as string[],
      experienceLevel: null as string | null,
      experienceYears: null as number | null,
      desiredSalaryMin: null as number | null,
      desiredSalaryCurrency: "USD" as string | null,
      city: null as string | null,
      headline: null as string | null,
      bio: null as string | null,
    };

    if (session?.user) {
      const dbProfile = await prisma.profile.findUnique({
        where: { userId: (session.user as any).id },
      });
      if (dbProfile) {
        userProfile = {
          skills: dbProfile.skills,
          experienceLevel: dbProfile.experienceLevel,
          experienceYears: dbProfile.experienceYears,
          desiredSalaryMin: dbProfile.desiredSalaryMin,
          desiredSalaryCurrency: dbProfile.desiredSalaryCurrency || "USD",
          city: dbProfile.city,
          headline: dbProfile.headline,
          bio: dbProfile.bio,
        };
      }
    } else if (Array.isArray(guestSkills) && guestSkills.length > 0) {
      userProfile.skills = guestSkills;
      userProfile.experienceLevel = guestExperience || "Mid";
    } else {
      return NextResponse.json(
        {
          error: "Заполните навыки в профиле или укажите их для анализа",
          requiresProfile: true,
        },
        { status: 400 }
      );
    }

    const matchResult = await aiMatcherService.matchProfileWithVacancy(userId, {
      userProfile,
      vacancy: {
        id: vacancy.id,
        title: vacancy.title,
        skills: vacancy.skills,
        experienceLevel: vacancy.experienceLevel,
        salaryMin: vacancy.salaryMin,
        salaryMax: vacancy.salaryMax,
        salaryCurrency: vacancy.salaryCurrency,
        city: vacancy.city,
        description: vacancy.description,
      },
    });

    return NextResponse.json({ success: true, match: matchResult });
  } catch (err: any) {
    console.error("AI Match error:", err);
    return NextResponse.json(
      { error: "Не удалось выполнить AI анализ совместимости" },
      { status: 500 }
    );
  }
}
