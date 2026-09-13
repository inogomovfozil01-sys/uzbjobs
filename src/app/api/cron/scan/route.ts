import { NextResponse } from "next/server";
import jobScanner from "@/jobs/scanner";
import stalenessChecker from "@/services/jobs/staleness-checker";

export async function POST(req: Request) {
  // Validate CRON_SECRET
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret || expectedSecret.trim().length === 0) {
    return NextResponse.json(
      { error: "CRON_SECRET не настроен на сервере" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization") || "";
  const headerSecret = req.headers.get("x-cron-secret") || "";

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : authHeader.trim();

  if (token !== expectedSecret && headerSecret !== expectedSecret) {
    return NextResponse.json({ error: "Доступ запрещен: неверный CRON_SECRET" }, { status: 401 });
  }

  try {
    // 1. Run staleness check on existing vacancies
    const stalenessResult = await stalenessChecker.checkStaleVacancies(15);

    // 2. Trigger automated scanner if not already running
    let scanId: string | null = null;
    const scannerStatus = jobScanner.getStatus();
    if (!scannerStatus.isRunning) {
      scanId = await jobScanner.startScan("CRON", "system-cron-job");
    }

    return NextResponse.json({
      success: true,
      message: "Cron job выполнен",
      stalenessChecked: stalenessResult.checked,
      expiredFound: stalenessResult.expired,
      scanId,
      scannerRunning: jobScanner.getStatus().isRunning,
    });
  } catch (err: any) {
    console.error("Cron execution error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
