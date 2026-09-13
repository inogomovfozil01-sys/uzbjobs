import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import jobScanner from "@/jobs/scanner";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const status = jobScanner.getStatus();

  // Fetch last completed scan and counts
  let lastScan = null;
  let activeQueriesCount = 0;

  try {
    [lastScan, activeQueriesCount] = await Promise.all([
      prisma.scan.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          results: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.searchQuery.count({ where: { isActive: true } }),
    ]);
  } catch {}

  return NextResponse.json({
    isRunning: status.isRunning,
    currentScanId: status.currentScanId,
    activeQueriesCount,
    lastScan,
    logs: status.logs,
  });
}
