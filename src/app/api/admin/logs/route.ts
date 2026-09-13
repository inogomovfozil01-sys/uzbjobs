import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";

  try {
    const [aiLogs, searchLogs, errorLogs, adminActions] = await Promise.all([
      type === "all" || type === "ai"
        ? prisma.aIAnalysisLog.findMany({ take: 30, orderBy: { createdAt: "desc" } })
        : [],
      type === "all" || type === "search"
        ? prisma.searchLog.findMany({ take: 30, orderBy: { createdAt: "desc" } })
        : [],
      type === "all" || type === "error"
        ? prisma.errorLog.findMany({ take: 30, orderBy: { createdAt: "desc" } })
        : [],
      type === "all" || type === "admin"
        ? prisma.adminAction.findMany({
            take: 30,
            orderBy: { createdAt: "desc" },
            include: { admin: { select: { email: true, name: true } } },
          })
        : [],
    ]);

    return NextResponse.json({
      aiLogs,
      searchLogs,
      errorLogs,
      adminActions,
    });
  } catch (err: any) {
    console.error("Admin logs route error:", err);
    return NextResponse.json({
      aiLogs: [],
      searchLogs: [],
      errorLogs: [],
      adminActions: [],
      warning: "База данных PostgreSQL еще не подключена",
    });
  }
}
