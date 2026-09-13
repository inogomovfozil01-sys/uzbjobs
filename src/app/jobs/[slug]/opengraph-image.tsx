import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "Вакансия на UzbJobs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  let title = "Вакансия в Узбекистане";
  let company = "Компания";
  let city = "Ташкент";
  let salary = "По договоренности";

  try {
    const vacancy = await prisma.vacancy.findUnique({
      where: { slug },
      select: {
        title: true,
        companyName: true,
        city: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
      },
    });

    if (vacancy) {
      title = vacancy.title || "Вакансия в Узбекистане";
      company = vacancy.companyName || "Компания";
      city = vacancy.city || "Ташкент";
      if (vacancy.salaryMin || vacancy.salaryMax) {
        salary = `${vacancy.salaryMin ? vacancy.salaryMin.toLocaleString() : ""} ${vacancy.salaryMax ? "- " + vacancy.salaryMax.toLocaleString() : ""} ${vacancy.salaryCurrency || "UZS"}`.trim();
      }
    }
  } catch (e) {
    // fallback values
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #090d16 0%, #0f172a 60%, #064e3b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#0284c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: 900,
            }}
          >
            UJ
          </div>
          <span style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff" }}>
            Uzb<span style={{ color: "#38bdf8" }}>Jobs</span>
          </span>
          <span style={{ color: "#64748b", fontSize: "24px" }}>•</span>
          <span style={{ color: "#34d399", fontSize: "20px", fontWeight: 700 }}>
            Горячая вакансия
          </span>
        </div>

        {/* Vacancy Main Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px", color: "#38bdf8", fontWeight: 700 }}>
              {company}
            </span>
            <span style={{ fontSize: "24px", color: "#64748b" }}>в</span>
            <span style={{ fontSize: "26px", color: "#94a3b8" }}>{city}</span>
          </div>

          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.15,
              maxWidth: "1000px",
              letterSpacing: "-1.5px",
            }}
          >
            {title}
          </h1>

          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#34d399",
            }}
          >
            {salary}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                padding: "8px 20px",
                borderRadius: "999px",
                color: "#e2e8f0",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Откликнуться с AI резюме
            </div>
            <div
              style={{
                background: "rgba(56, 189, 248, 0.15)",
                padding: "8px 20px",
                borderRadius: "999px",
                color: "#38bdf8",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              UzbJobs AI Platform
            </div>
          </div>
          <span style={{ color: "#64748b", fontSize: "18px" }}>uzbjobs.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
