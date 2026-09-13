import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import jobScanner from "@/jobs/scanner";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  jobScanner.stopScan();
  return NextResponse.json({
    success: true,
    message: "Сигнал остановки отправлен сканеру",
  });
}
