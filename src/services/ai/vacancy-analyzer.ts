import * as cheerio from "cheerio";
import geminiService from "./gemini-service";
import { VacancyAnalysisSchema, VacancyAnalysis } from "@/validators/ai";
import { wrapUntrustedContent, PROMPT_INJECTION_SYSTEM_GUARD } from "@/lib/security/prompt-guard";
import { prisma } from "@/lib/prisma";

export class VacancyAnalyzer {
  /**
   * Cleans raw HTML to extract meaningful body text.
   */
  public extractCleanText(html: string): string {
    const $ = cheerio.load(html);
    // Remove unwanted non-content elements
    $("script, style, noscript, svg, iframe, header, footer, nav, ads").remove();

    // Prefer main vacancy content selectors if present (HH, Rabota, LinkedIn, etc.)
    const vacancyContainer = $(
      ".vacancy-description, .job-description, .vacancy-section, main, article, #content, .content"
    ).first();

    let text = "";
    if (vacancyContainer.length > 0) {
      text = vacancyContainer.text();
    } else {
      text = $("body").text();
    }

    // Normalize whitespaces
    return text.replace(/\s+/g, " ").trim().slice(0, 20000);
  }

  /**
   * Analyzes an untrusted web page or search snippet with Gemini and validates output.
   */
  public async analyzePage({
    url,
    title,
    snippet,
    rawHtml,
  }: {
    url: string;
    title?: string;
    snippet?: string;
    rawHtml?: string;
  }): Promise<{
    analysis: VacancyAnalysis | null;
    rawResponse: string;
    qualityScore: number;
    isVacancy: boolean;
    error?: string;
  }> {
    const cleanedBody = rawHtml ? this.extractCleanText(rawHtml) : "";
    const combinedContent = `
URL страницы: ${url}
Заголовок поиска: ${title || "Не указан"}
Фрагмент поиска: ${snippet || "Не указан"}

Текст страницы:
${cleanedBody || snippet || "Текст недоступен"}
    `.trim();

    const guardedText = wrapUntrustedContent(combinedContent);

    const systemInstruction = `
Ты — профессиональный AI-аналитик вакансий платформы UzbJobs (рынок труда Узбекистана).
Твоя задача — детально проанализировать веб-страницу и извлечь структурированные данные о вакансии.

${PROMPT_INJECTION_SYSTEM_GUARD}

ПРАВИЛА ИЗВЛЕЧЕНИЯ:
1. Определи: является ли страница РЕАЛЬНОЙ вакансией (isVacancy = true/false). Если это статья, главная страница сайта, список каталога без конкретной вакансии — ставь isVacancy = false.
2. Не выдумывай информацию!
   - Если зарплата не указана: salaryMin = null, salaryMax = null, salaryText = null, salaryCurrency = null.
   - Если компания неизвестна: company = null.
   - Если дата неизвестна: publishedAt = null.
   - Не придумывай email или телефон, если их нет в тексте!
   - Отделяй факты от предположений.
3. Проверь актуальность: если вакансия закрыта, снята с публикации или архивна, ставь isExpired = true.
4. Оцени качество вакансии qualityScore (0-100):
   - 80-100: подробное описание, требования, стек, компания, условия.
   - 50-79: базовое описание с минимальными деталями.
   - 0-49: неполное, спамное, подозрительное или сомнительное описание.
5. Локация: если город в Узбекистане (Ташкент, Самарканд, Бухара, Фергана, Андижан, Наманган и т.д.), укажи city и country = "Uzbekistan". Если удалённо по всему миру / Узбекистану, укажи isRemote = true.
6. Выдели ключевые навыки (skills): список технологий, инструментов или ключевых компетенций (например, ["React", "TypeScript", "Node.js"]).

Ты ОБЯЗАН вернуть ТОЛЬКО валидный JSON-объект, соответствующий схеме:
{
  "title": string,
  "company": string or null,
  "description": string,
  "shortDescription": string or null,
  "location": string or null,
  "salaryMin": number or null,
  "salaryMax": number or null,
  "salaryCurrency": string or null (e.g. "UZS", "USD", "EUR"),
  "salaryText": string or null,
  "employmentType": string or null (e.g. "Full-time", "Part-time", "Contract", "Internship"),
  "experienceLevel": string or null (e.g. "Junior", "Mid", "Senior", "Lead"),
  "skills": string[],
  "requirements": string[],
  "responsibilities": string[],
  "benefits": string[],
  "sourceUrl": "${url}",
  "sourceName": string or null (e.g. "HeadHunter", "LinkedIn", "Olx", "UzInfocom", "Компания"),
  "publishedAt": string or null (ISO format if known),
  "applicationUrl": string or null,
  "contactEmail": string or null,
  "contactPhone": string or null,
  "isRemote": boolean,
  "country": string or null,
  "city": string or null,
  "qualityScore": number (0-100),
  "relevanceScore": number (0-100),
  "isVacancy": boolean,
  "isExpired": boolean,
  "isDuplicateCandidate": boolean,
  "confidence": number (0.0 - 1.0),
  "category": string or null (e.g. "IT / Software", "Design", "Marketing", "Finance", "Sales", "Management", "Other")
}
`;

    let rawOutput = "";
    let durationMs = 0;
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      const response = await geminiService.generateContent({
        systemInstruction,
        contents: guardedText,
        responseMimeType: "application/json",
        temperature: 0.1,
      });

      rawOutput = response.text;
      durationMs = response.durationMs;
      promptTokens = response.promptTokens || 0;
      completionTokens = response.completionTokens || 0;

      const parsedData = this.parseAndValidate(rawOutput, url);

      // Save log
      try {
        await prisma.aIAnalysisLog.create({
          data: {
            model: geminiService.getModel(),
            durationMs,
            promptTokens,
            completionTokens,
            rawResponse: rawOutput.slice(0, 5000),
            qualityScore: parsedData.qualityScore,
            relevanceScore: parsedData.relevanceScore,
            status: "SUCCESS",
          },
        });
      } catch {}

      return {
        analysis: parsedData,
        rawResponse: rawOutput,
        qualityScore: parsedData.qualityScore,
        isVacancy: parsedData.isVacancy,
      };
    } catch (firstErr: any) {
      console.warn("First attempt parsing Gemini output failed, attempting 1-shot repair:", firstErr.message);

      // Attempt 1-shot repair with correction prompt
      try {
        const repairPrompt = `
Предыдущий ответ не удалось распарсить как строгий JSON.
Преобразуй следующий текст в абсолютно валидный JSON по требуемой схеме (без markdown-оберток, без лишнего текста):

${rawOutput || combinedContent.slice(0, 5000)}
        `;

        const repairRes = await geminiService.generateContent({
          contents: repairPrompt,
          responseMimeType: "application/json",
          temperature: 0.0,
        });

        const repairedData = this.parseAndValidate(repairRes.text, url);

        try {
          await prisma.aIAnalysisLog.create({
            data: {
              model: geminiService.getModel(),
              durationMs: durationMs + repairRes.durationMs,
              rawResponse: repairRes.text.slice(0, 5000),
              qualityScore: repairedData.qualityScore,
              relevanceScore: repairedData.relevanceScore,
              status: "RETRIED",
            },
          });
        } catch {}

        return {
          analysis: repairedData,
          rawResponse: repairRes.text,
          qualityScore: repairedData.qualityScore,
          isVacancy: repairedData.isVacancy,
        };
      } catch (finalErr: any) {
        // Log final failure to AIAnalysisLog
        try {
          await prisma.aIAnalysisLog.create({
            data: {
              model: geminiService.getModel(),
              durationMs,
              rawResponse: rawOutput.slice(0, 5000),
              status: "FAILED",
              error: finalErr.message,
            },
          });
        } catch {}

        return {
          analysis: null,
          rawResponse: rawOutput,
          qualityScore: 0,
          isVacancy: false,
          error: finalErr.message,
        };
      }
    }
  }

  private parseAndValidate(raw: string, fallbackUrl: string): VacancyAnalysis {
    // Strip possible markdown ```json ... ``` blocks
    let cleaned = raw.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsedJson = JSON.parse(cleaned);

    // Ensure sourceUrl is not empty
    if (!parsedJson.sourceUrl) {
      parsedJson.sourceUrl = fallbackUrl;
    }

    const validated = VacancyAnalysisSchema.parse(parsedJson);
    return validated;
  }
}

export const vacancyAnalyzer = new VacancyAnalyzer();
export default vacancyAnalyzer;
