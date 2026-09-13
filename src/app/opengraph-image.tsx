import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "UzbJobs — AI-платформа поиска работы в Узбекистане";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #090d16 0%, #0f172a 50%, #032b43 100%)",
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
        {/* Top brand header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #0284c7, #0f766e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "36px",
              fontWeight: 900,
            }}
          >
            UJ
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "42px", fontWeight: 900, color: "#ffffff", letterSpacing: "-1px" }}>
              Uzb<span style={{ color: "#38bdf8" }}>Jobs</span>
            </span>
            <span style={{ fontSize: "16px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2px" }}>
              AI Job Search Platform • Uzbekistan
            </span>
          </div>
        </div>

        {/* Center Main Slogan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.15,
              maxWidth: "1000px",
              letterSpacing: "-2px",
            }}
          >
            Работа мечты в Узбекистане с силой <span style={{ color: "#38bdf8" }}>UzbJobs AI</span>
          </h1>
          <p style={{ fontSize: "24px", color: "#94a3b8", maxWidth: "880px" }}>
            Агрегация актуальных вакансий Ташкента, Самарканда и Remote. Умный скоринг соответствия резюме и генерация Cover Letters.
          </p>
        </div>

        {/* Bottom features bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              padding: "10px 24px",
              borderRadius: "999px",
              color: "#38bdf8",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            ✦ 100% Verified Jobs
          </div>
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "10px 24px",
              borderRadius: "999px",
              color: "#34d399",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            ✦ AI Match 0–100%
          </div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "10px 24px",
              borderRadius: "999px",
              color: "#f8fafc",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            uzbjobs.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
