import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import geminiService from "@/services/ai/gemini-service";
import googleSearchService from "@/services/search/google-search";

export const dynamic = "force-dynamic";

export async function GET() {
  const health: Record<string, string> = {
    status: "ok",
    database: "disconnected",
    gemini: "not_configured",
    googleSearch: "not_configured",
    auth: "not_configured",
  };

  // 1. Check Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = "connected";
  } catch (err: any) {
    health.database = process.env.DATABASE_URL ? "error" : "not_configured";
    health.status = "degraded";
  }

  // 2. Check Gemini
  if (geminiService.isConfigured()) {
    health.gemini = "connected";
  } else {
    health.gemini = "not_configured";
  }

  // 3. Check Google Search
  if (googleSearchService.isConfigured()) {
    health.googleSearch = "connected";
  } else {
    health.googleSearch = "not_configured";
  }

  // 4. Check Auth
  if (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) {
    health.auth = "configured";
  } else {
    health.auth = "not_configured";
  }

  return NextResponse.json(health, { status: 200 });
}
