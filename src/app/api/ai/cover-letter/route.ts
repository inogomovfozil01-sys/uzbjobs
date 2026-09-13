import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import aiCoverLetterService from "@/services/ai/cover-letter";
import { AICoverLetterRequestSchema } from "@/validators/ai";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limiter";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const session = await getAuthSession();
  const userId = (session?.user as any)?.id || `guest-${ip}`;

  const rateConfig = session?.user ? RATE_LIMITS.AI_USER : RATE_LIMITS.AI_GUEST;
  const rateLimit = checkRateLimit(userId, "ai_cover_letter", rateConfig);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Слишком много запросов генерации письма. Подождите немного." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = AICoverLetterRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные параметры запроса", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { vacancyId, language, customNotes } = parsed.data;

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return NextResponse.json({ error: "Вакансия не найдена" }, { status: 404 });
    }

    let userName = session?.user?.name || body.guestName || "Соискатель";
    let userEmail = session?.user?.email || null;
    let profileData = {
      headline: "Специалист",
      bio: "",
      skills: [] as string[],
      experienceLevel: "Mid",
      experienceYears: 2,
      city: "Ташкент",
      resumeText: "",
    };

    if (session?.user) {
      const dbProfile = await prisma.profile.findUnique({
        where: { userId: (session.user as any).id },
      });
      if (dbProfile) {
        profileData = {
          headline: dbProfile.headline || profileData.headline,
          bio: dbProfile.bio || "",
          skills: dbProfile.skills,
          experienceLevel: dbProfile.experienceLevel || "Mid",
          experienceYears: dbProfile.experienceYears || 2,
          city: dbProfile.city || "Ташкент",
          resumeText: dbProfile.resumeText || "",
        };
      }
    } else if (body.guestSkills) {
      profileData.skills = body.guestSkills;
    }

    const letter = await aiCoverLetterService.generateCoverLetter({
      userName,
      userEmail,
      profile: profileData,
      vacancy: {
        title: vacancy.title,
        companyName: vacancy.companyName,
        skills: vacancy.skills,
        description: vacancy.description,
      },
      language,
      customNotes,
    });

    return NextResponse.json({ success: true, coverLetter: letter, language });
  } catch (err: any) {
    console.error("Cover letter error:", err);
    return NextResponse.json(
      { error: "Не удалось сгенерировать сопроводительное письмо" },
      { status: 500 }
    );
  }
}
