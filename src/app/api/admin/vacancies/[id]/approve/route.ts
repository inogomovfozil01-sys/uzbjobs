import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const vacancy = await prisma.vacancy.update({
      where: { id },
      data: {
        status: VacancyStatus.ACTIVE,
        isVerified: true,
      },
    });

    // Record admin action
    await prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: "APPROVE_VACANCY",
        targetType: "Vacancy",
        targetId: vacancy.id,
        details: `Одобрена вакансия "${vacancy.title}"`,
      },
    });

    return NextResponse.json({ success: true, vacancy });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Не удалось одобрить вакансию: " + err.message },
      { status: 500 }
    );
  }
}
