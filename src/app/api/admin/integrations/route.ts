import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import integrationsTester from "@/services/integrations/tester";
import { IntegrationService } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  try {
    const statuses = await integrationsTester.getStatuses();
    return NextResponse.json({ statuses });
  } catch (err: any) {
    return NextResponse.json({ error: "Не удалось получить статусы" }, { status: 500 });
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
    const { service } = body;

    let result;
    switch (service) {
      case "DATABASE":
        result = await integrationsTester.testDatabase();
        break;
      case "GEMINI":
        result = await integrationsTester.testGemini();
        break;
      case "GOOGLE_SEARCH":
        result = await integrationsTester.testGoogleSearch();
        break;
      case "EMAIL":
        result = await integrationsTester.testEmail();
        break;
      case "AUTH":
        result = await integrationsTester.testAuth();
        break;
      case "CRON":
        result = await integrationsTester.testCron();
        break;
      case "ALL":
      default:
        result = await integrationsTester.testAll();
        break;
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Integration test error:", err);
    return NextResponse.json({ error: err.message || "Ошибка тестирования" }, { status: 500 });
  }
}
