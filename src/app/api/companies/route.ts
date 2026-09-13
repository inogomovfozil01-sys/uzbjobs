import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const city = searchParams.get("city");

  const where: any = {};
  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }
  if (city && city !== "all") {
    where.city = { contains: city, mode: "insensitive" };
  }

  try {
    const companies = await prisma.company.findMany({
      where,
      orderBy: { vacancies: { _count: "desc" } },
      take: 50,
      include: {
        _count: {
          select: {
            vacancies: {
              where: { status: VacancyStatus.ACTIVE },
            },
          },
        },
      },
    });

    return NextResponse.json({ companies });
  } catch (err: any) {
    console.error("Error fetching companies:", err);
    return NextResponse.json({ companies: [] }, { status: 500 });
  }
}
