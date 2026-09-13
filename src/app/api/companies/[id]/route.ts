import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const company = await prisma.company.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        vacancies: {
          where: { status: VacancyStatus.ACTIVE },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (err: any) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
