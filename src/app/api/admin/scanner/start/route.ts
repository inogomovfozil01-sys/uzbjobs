import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import jobScanner from "@/jobs/scanner";

export async function POST() {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  try {
    const scanId = await jobScanner.startScan("MANUAL", admin.email);
    return NextResponse.json({
      success: true,
      message: "AI Scanner запущен",
      scanId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
