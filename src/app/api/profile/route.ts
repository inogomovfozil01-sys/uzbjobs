import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { ProfileUpdateSchema } from "@/validators/job";
import { contentModerationService } from "@/services/moderation/content-moderator";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        profile: true,
        savedVacancies: {
          include: {
            vacancy: {
              include: {
                company: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные профиля", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Safety & 18+ Content Moderation check
    const textToModerate = [data.headline, data.bio, data.resumeText]
      .filter(Boolean)
      .join("\n\n");

    if (textToModerate.trim()) {
      const modResult = await contentModerationService.moderateContent({
        content: textToModerate,
        contentType: "PROFILE",
        userId,
        source: "USER_PROFILE",
      });

      if (modResult.decision === "BLOCKED") {
        return NextResponse.json(
          { error: "Этот контент нельзя разместить на UzbJobs." },
          { status: 400 }
        );
      }
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        headline: data.headline,
        bio: data.bio,
        city: data.city,
        experienceYears: data.experienceYears,
        experienceLevel: data.experienceLevel,
        education: data.education,
        desiredSalaryMin: data.desiredSalaryMin,
        desiredSalaryCurrency: data.desiredSalaryCurrency,
        employmentType: data.employmentType,
        desiredCity: data.desiredCity,
        isRemoteOnly: data.isRemoteOnly,
        skills: data.skills,
        resumeText: data.resumeText,
      },
      create: {
        userId,
        headline: data.headline,
        bio: data.bio,
        city: data.city || "Ташкент",
        experienceYears: data.experienceYears,
        experienceLevel: data.experienceLevel,
        education: data.education,
        desiredSalaryMin: data.desiredSalaryMin,
        desiredSalaryCurrency: data.desiredSalaryCurrency || "USD",
        employmentType: data.employmentType,
        desiredCity: data.desiredCity || "Ташкент",
        isRemoteOnly: data.isRemoteOnly || false,
        skills: data.skills || [],
        resumeText: data.resumeText,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Не удалось сохранить профиль" }, { status: 500 });
  }
}
