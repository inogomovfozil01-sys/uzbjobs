import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { id: vacancyId } = await params;
  const userId = (session.user as any).id;

  try {
    const saved = await prisma.savedVacancy.upsert({
      where: {
        userId_vacancyId: { userId, vacancyId },
      },
      update: {},
      create: { userId, vacancyId },
    });

    return NextResponse.json({ success: true, saved });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Не удалось сохранить вакансию" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { id: vacancyId } = await params;
  const userId = (session.user as any).id;

  try {
    await prisma.savedVacancy.deleteMany({
      where: { userId, vacancyId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Не удалось удалить вакансию из сохранённых" },
      { status: 500 }
    );
  }
}
