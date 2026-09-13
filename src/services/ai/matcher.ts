import geminiService from "./gemini-service";
import { AIMatchResult, AIMatchResultSchema } from "@/validators/ai";

interface MatchCandidate {
  userProfile: {
    skills: string[];
    experienceLevel?: string | null;
    experienceYears?: number | null;
    desiredSalaryMin?: number | null;
    desiredSalaryCurrency?: string | null;
    city?: string | null;
    headline?: string | null;
    bio?: string | null;
  };
  vacancy: {
    id: string;
    title: string;
    skills: string[];
    experienceLevel?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string | null;
    city?: string | null;
    description: string;
  };
}

class AIMatcherService {
  private cache = new Map<string, { result: AIMatchResult; timestamp: number }>();
  private cacheTtl = 24 * 60 * 60 * 1000; // 24 hours

  private getCacheKey(userId: string, vacancyId: string): string {
    return `${userId}:${vacancyId}`;
  }

  public async matchProfileWithVacancy(
    userId: string,
    candidate: MatchCandidate
  ): Promise<AIMatchResult> {
    const cacheKey = this.getCacheKey(userId, candidate.vacancy.id);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      return cached.result;
    }

    if (!geminiService.isConfigured()) {
      // Fallback deterministic algorithmic match when Gemini API key is not configured
      const result = this.fallbackDeterministicMatch(candidate);
      this.cache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    }

    const prompt = `
Ты — AI-рекрутер UzbJobs.
Оцени совместимость профиля соискателя с вакансией.

ПРОФИЛЬ СОИСКАТЕЛЯ:
- Навыки: ${candidate.userProfile.skills.join(", ") || "Не указаны"}
- Опыт (уровень): ${candidate.userProfile.experienceLevel || "Не указан"} (${candidate.userProfile.experienceYears ?? 0} лет)
- Желаемая зарплата: ${candidate.userProfile.desiredSalaryMin ? `${candidate.userProfile.desiredSalaryMin} ${candidate.userProfile.desiredSalaryCurrency}` : "Не указана"}
- Город: ${candidate.userProfile.city || "Не указан"}
- О себе / заголовок: ${candidate.userProfile.headline || ""} ${candidate.userProfile.bio || ""}

ВАКАНСИЯ:
- Название: ${candidate.vacancy.title}
- Требуемые навыки: ${candidate.vacancy.skills.join(", ") || "Не указаны"}
- Уровень: ${candidate.vacancy.experienceLevel || "Любой"}
- Зарплата: ${candidate.vacancy.salaryMin || candidate.vacancy.salaryMax ? `${candidate.vacancy.salaryMin || 0} - ${candidate.vacancy.salaryMax || 0} ${candidate.vacancy.salaryCurrency}` : "Не указана"}
- Локация: ${candidate.vacancy.city || "Узбекистан"}
- Описание: ${candidate.vacancy.description.slice(0, 1500)}

ЗАДАЧА:
Верни JSON со следующей структурой:
{
  "score": number (0-100),
  "summary": string (краткий вердикт на русском языке в 1-2 предложениях),
  "matchingSkills": string[] (навыки, которые есть и у соискателя, и в вакансии),
  "missingSkills": string[] (навыки из вакансии, которых нет у соискателя),
  "experienceMatch": string ("Подходит" | "Выше требуемого" | "Ниже требуемого"),
  "salaryMatch": string ("Соответствует ожиданиям" | "Ниже ожиданий" | "Выше ожиданий" | "Не указана"),
  "recommendations": string[] (1-3 практических совета, как повысить шансы на отклик)
}
    `;

    try {
      const response = await geminiService.generateContent({
        contents: prompt,
        responseMimeType: "application/json",
        temperature: 0.1,
      });

      let cleaned = response.text.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(cleaned);
      const validated = AIMatchResultSchema.parse(parsed);

      this.cache.set(cacheKey, { result: validated, timestamp: Date.now() });
      return validated;
    } catch (err) {
      console.warn("Gemini match failed, falling back to deterministic matching:", err);
      const fallback = this.fallbackDeterministicMatch(candidate);
      this.cache.set(cacheKey, { result: fallback, timestamp: Date.now() });
      return fallback;
    }
  }

  private fallbackDeterministicMatch(candidate: MatchCandidate): AIMatchResult {
    const userSkills = new Set(candidate.userProfile.skills.map((s) => s.toLowerCase().trim()));
    const vacSkills = candidate.vacancy.skills.map((s) => s.trim());

    const matching: string[] = [];
    const missing: string[] = [];

    for (const skill of vacSkills) {
      if (userSkills.has(skill.toLowerCase())) {
        matching.push(skill);
      } else {
        missing.push(skill);
      }
    }

    const totalSkills = vacSkills.length || 1;
    const matchRatio = matching.length / totalSkills;
    const score = Math.min(95, Math.max(30, Math.round(matchRatio * 70 + 25)));

    return {
      score,
      summary: `Совпадение по стеку технологий составляет ${Math.round(matchRatio * 100)}%.`,
      matchingSkills: matching,
      missingSkills: missing,
      experienceMatch: "Подходит",
      salaryMatch: candidate.vacancy.salaryMin ? "Соответствует ожиданиям" : "Не указана",
      recommendations: missing.length > 0
        ? [`Рекомендуем упомянуть опыт с: ${missing.slice(0, 3).join(", ")}.`]
        : ["Отличный профиль для подачи заявки!"],
    };
  }
}

export const aiMatcherService = new AIMatcherService();
export default aiMatcherService;
