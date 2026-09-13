import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://uzbjobs.uz";

  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/
Disallow: /api/auth/

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
