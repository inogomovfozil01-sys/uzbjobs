import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://uzbjobs.uz";

  let vacancies: { slug: string; updatedAt: Date }[] = [];
  let companies: { slug: string; updatedAt: Date }[] = [];

  try {
    [vacancies, companies] = await Promise.all([
      prisma.vacancy.findMany({
        where: { status: VacancyStatus.ACTIVE },
        select: { slug: true, updatedAt: true },
        take: 1000,
      }),
      prisma.company.findMany({
        select: { slug: true, updatedAt: true },
        take: 200,
      }),
    ]);
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/jobs</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/companies</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${vacancies
  .map(
    (v) => `  <url>
    <loc>${baseUrl}/jobs/${v.slug}</loc>
    <lastmod>${v.updatedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("\n")}
${companies
  .map(
    (c) => `  <url>
    <loc>${baseUrl}/companies/${c.slug}</loc>
    <lastmod>${c.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
