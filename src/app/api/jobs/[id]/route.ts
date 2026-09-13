import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const vacancy = await prisma.vacancy.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        company: true,
      },
    });

    if (!vacancy) {
      return NextResponse.json({ error: "Вакансия не найдена" }, { status: 404 });
    }

    // Increment view count in background
    prisma.vacancy
      .update({
        where: { id: vacancy.id },
        data: { viewsCount: { increment: 1 } },
      })
      .catch(() => {});

    // Also find related vacancies in same city or category
    const related = await prisma.vacancy.findMany({
      where: {
        id: { not: vacancy.id },
        status: vacancy.status,
        OR: [{ category: vacancy.category }, { city: vacancy.city }],
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ vacancy, related });
  } catch (err: any) {
    console.error("Error fetching single vacancy:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
