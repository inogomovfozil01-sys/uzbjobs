import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  try {
    const queries = await prisma.searchQuery.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ queries });
  } catch (err: any) {
    console.error("Admin search queries GET error:", err);
    return NextResponse.json({
      queries: [],
      warning: "База данных PostgreSQL еще не подключена",
    });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { query, category, location, priority = 1, isActive = true } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Поисковый запрос обязателен" }, { status: 400 });
    }

    const created = await prisma.searchQuery.create({
      data: {
        query: query.trim(),
        category: category || "IT",
        location: location || "Узбекистан",
        priority: Number(priority),
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, query: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Не удалось добавить запрос: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, isActive, priority } = body;

    const updated = await prisma.searchQuery.update({
      where: { id },
      data: {
        ...(typeof isActive === "boolean" ? { isActive } : {}),
        ...(priority !== undefined ? { priority: Number(priority) } : {}),
      },
    });

    return NextResponse.json({ success: true, query: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
  }

  try {
    await prisma.searchQuery.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
