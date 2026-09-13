import { describe, it, expect } from "vitest";
import { VacancyAnalysisSchema } from "@/validators/ai";
import vacancyAnalyzer from "@/services/ai/vacancy-analyzer";

describe("AI Vacancy Parser & Validator", () => {
  it("should validate and parse well-formed Gemini JSON", () => {
    const raw = {
      title: "Fullstack Engineer",
      company: "Uzum",
      description: "Developing modern web apps",
      salaryMin: 2000,
      salaryMax: 3000,
      salaryCurrency: "USD",
      skills: ["React", "Node.js"],
      sourceUrl: "https://example.com/job",
      qualityScore: 90,
      isVacancy: true,
      isExpired: false,
    };

    const parsed = VacancyAnalysisSchema.parse(raw);
    expect(parsed.title).toBe("Fullstack Engineer");
    expect(parsed.company).toBe("Uzum");
    expect(parsed.qualityScore).toBe(90);
    expect(parsed.isVacancy).toBe(true);
  });

  it("should provide default values for missing optional fields without hallucinating", () => {
    const minimal = {
      title: "Backend Dev",
      description: "FastAPI microservices",
      sourceUrl: "https://example.com",
    };

    const parsed = VacancyAnalysisSchema.parse(minimal);
    expect(parsed.company).toBeNull();
    expect(parsed.salaryMin).toBeNull();
    expect(parsed.salaryMax).toBeNull();
    expect(parsed.contactEmail).toBeNull();
    expect(parsed.isExpired).toBe(false);
  });

  it("should extract clean body text from HTML, stripping scripts and nav tags", () => {
    const sampleHtml = `
      <html>
        <head><script>console.log('malicious');</script></head>
        <body>
          <nav>Home About Contact</nav>
          <div class="vacancy-description">
            <h1>Python Developer</h1>
            <p>Requirements: Django, PostgreSQL</p>
          </div>
          <footer>Copyright 2026</footer>
        </body>
      </html>
    `;

    const extracted = vacancyAnalyzer.extractCleanText(sampleHtml);
    expect(extracted).toContain("Python Developer");
    expect(extracted).toContain("Django, PostgreSQL");
    expect(extracted).not.toContain("console.log");
    expect(extracted).not.toContain("Copyright 2026");
  });
});
