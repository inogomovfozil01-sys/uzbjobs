import { prisma } from "@/lib/prisma";
import {
  ModerationResult,
  ModerationResultSchema,
  ModerationDecision,
  ModerationCategory,
} from "@/validators/moderation";
import { wrapUntrustedContent, PROMPT_INJECTION_SYSTEM_GUARD } from "@/lib/security/prompt-guard";
import geminiService from "@/services/ai/gemini-service";

// High-precision explicit adult terms
const EXPLICIT_ADULT_PATTERNS = [
  /порно/i,
  /секс(уальные)?\s+услуг/i,
  /интим(ные)?\s+услуг/i,
  /эскорт/i,
  /интим\s*(предлагать|не предлагать|знакомства)/i,
  /проститут/i,
  /вебкам\s*(модел|студи)/i,
  /strip\s*club/i,
  /стриптиз/i,
  /jinsiy\s+xizmat/i,
  /eskort/i,
  /intim\s+xizmat/i,
  /pornograph/i,
  /escort\s+service/i,
  /sexual\s+service/i,
  /onlyfans\s+model/i,
  /sugar\s+baby/i,
  /содержанк/i,
  /массаж\s+с\s+окончанием/i,
  /боди\s+массаж\s+для\s+мужчин/i,
  /intim/i,
];

// Obfuscated adult patterns (spaced characters, e.g., "э с к о р т", "s e x")
const OBFUSCATED_PATTERNS = [
  /(?<!\p{L})[эe][\s._\-*]+[сs][\s._\-*]+[кk][\s._\-*]+[оo][\s._\-*]+[рr][\s._\-*]+[тt](?!\p{L})/iu,
  /(?<!\p{L})[sс][\s._\-*]+[eе][\s._\-*]+[xх](?!\p{L})/iu,
  /(?<!\p{L})[иi][\s._\-*]+[нn][\s._\-*]+[тt][\s._\-*]+[иi][\s._\-*]+[мm](?!\p{L})/iu,
  /(?<!\p{L})[пp][\s._\-*]+[оo][\s._\-*]+[рr][\s._\-*]+[нn][\s._\-*]+[оo](?!\p{L})/iu,
  /(?<!\p{L})[wш][\s._\-*]+[eе][\s._\-*]+[bб][\s._\-*]+[cсkк][\s._\-*]+[aа][\s._\-*]+[mм](?!\p{L})/iu,
];

// Benign professional phrases containing the word "adult" (Whitelisted context)
const BENIGN_ADULT_CONTEXTS = [
  /adult\s+education/i,
  /adult\s+learning/i,
  /adult\s+literacy/i,
  /adult\s+healthcare/i,
  /adult\s+medicine/i,
  /adult\s+training/i,
  /adult\s+day\s*care/i,
  /adult\s+patients/i,
  /adult\s+care/i,
  /обучение\s+взрослых/i,
  /образование\s+взрослых/i,
  /курсы\s+для\s+взрослых/i,
  /для\s+взрослых\s+и\s+детей/i,
  /взрослая\s+поликлиника/i,
  /взрослая\s+больница/i,
  /врач\s+для\s+взрослых/i,
  /katta\s+yoshdagilar\s+ta'limi/i,
  /kattalar\s+uchun\s+kurslar/i,
];

// Known adult / porn / escort domains and TLDs
const BLOCKED_ADULT_DOMAINS = [
  "onlyfans.com",
  "pornhub.com",
  "xvideos.com",
  "chaturbate.com",
  "escort.uz",
  "escort.com",
  "intim-tashkent",
  "dosug.uz",
];

const BLOCKED_ADULT_TLDS = [".xxx", ".adult", ".porn", ".sex"];

export interface ModerationInput {
  content: string;
  url?: string;
  contentType: "VACANCY" | "PROFILE" | "COMPANY" | "COMMENT";
  contentId?: string;
  userId?: string;
  source?: string;
}

export class ContentModerationService {
  /**
   * Checks content against domain blocklists, rule-based keywords,
   * prompt injection patterns, and Gemini AI Safety Moderator.
   */
  public async moderateContent(input: ModerationInput): Promise<ModerationResult> {
    const text = input.content || "";
    const url = input.url || "";

    // 1. Layer 1: URL and domain check
    if (url) {
      try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();

        for (const tld of BLOCKED_ADULT_TLDS) {
          if (host.endsWith(tld)) {
            const blockedResult: ModerationResult = {
              allowed: false,
              adultContent: true,
              sexualServices: false,
              pornographic: true,
              escort: false,
              unsafe: true,
              confidence: 0.99,
              category: "PORNOGRAPHIC",
              decision: "BLOCKED",
              reason: `Заблокирован домен с 18+ TLD: ${host}`,
            };
            await this.logModeration(input, blockedResult, "domain_filter");
            return blockedResult;
          }
        }

        for (const badDomain of BLOCKED_ADULT_DOMAINS) {
          if (host.includes(badDomain)) {
            const blockedResult: ModerationResult = {
              allowed: false,
              adultContent: true,
              sexualServices: true,
              pornographic: true,
              escort: true,
              unsafe: true,
              confidence: 0.99,
              category: "ADULT_CONTENT",
              decision: "BLOCKED",
              reason: `Заблокирован известный 18+ ресурс: ${host}`,
            };
            await this.logModeration(input, blockedResult, "domain_filter");
            return blockedResult;
          }
        }
      } catch {}
    }

    // 2. Layer 2: Rule-based heuristics with context awareness
    const ruleCheck = this.evaluateRules(text);
    if (ruleCheck.decision === "BLOCKED") {
      await this.logModeration(input, ruleCheck, "rule_based_filter");
      return ruleCheck;
    }

    // 3. Layer 3: Gemini AI Safety Moderator with Prompt Injection Protection
    if (geminiService.isConfigured()) {
      try {
        const aiResult = await this.evaluateWithGemini(text);
        await this.logModeration(input, aiResult, geminiService.getModel());
        return aiResult;
      } catch (err: any) {
        console.warn("Gemini moderation error, falling back to rule-based safety evaluation:", err.message);
      }
    }

    // 4. Layer 4: Fallback to rule check result
    await this.logModeration(input, ruleCheck, "fallback_rule_engine");
    return ruleCheck;
  }

  /**
   * Rule-based evaluator with benign context whitelisting.
   */
  public evaluateRules(text: string): ModerationResult {
    // Check if text is an obvious prompt injection attempt targeting moderation
    const hasInjection =
      /ignore\s+(previous\s+)?instructions/i.test(text) ||
      /disable\s+(safety|moderation)/i.test(text) ||
      /allow\s+adult\s+content/i.test(text) ||
      /return\s+allowed\s*=\s*true/i.test(text);

    if (hasInjection) {
      return {
        allowed: false,
        adultContent: false,
        sexualServices: false,
        pornographic: false,
        escort: false,
        unsafe: true,
        confidence: 0.85,
        category: "PROMPT_INJECTION_ATTEMPT",
        decision: "REVIEW",
        reason: "Обнаружена попытка манипуляции инструкциями модерации (Prompt Injection)",
      };
    }

    // Check for benign whitelisted context (e.g. "adult education", "adult literacy")
    let isBenignAdultContext = false;
    for (const benignRegex of BENIGN_ADULT_CONTEXTS) {
      if (benignRegex.test(text)) {
        isBenignAdultContext = true;
        break;
      }
    }

    // Check for obfuscated adult keywords (e.g. "э с к о р т")
    for (const obfRegex of OBFUSCATED_PATTERNS) {
      if (obfRegex.test(text)) {
        return {
          allowed: false,
          adultContent: true,
          sexualServices: true,
          pornographic: false,
          escort: true,
          unsafe: true,
          confidence: 0.95,
          category: "ESCORT",
          decision: "BLOCKED",
          reason: "Обнаружен замаскированный 18+ контент / эскорт",
        };
      }
    }

    // Check for explicit adult patterns
    for (const pattern of EXPLICIT_ADULT_PATTERNS) {
      if (pattern.test(text)) {
        // If benign context matches and it was just the generic word "adult", don't block
        if (isBenignAdultContext && pattern.source.includes("adult")) {
          continue;
        }

        const isEscort = /эскорт|escort/i.test(text);
        const isPorn = /порно|porn/i.test(text);
        const isSexualServices = /секс|sex|интим|intim|jinsiy/i.test(text);

        return {
          allowed: false,
          adultContent: true,
          sexualServices: isSexualServices,
          pornographic: isPorn,
          escort: isEscort,
          unsafe: true,
          confidence: 0.95,
          category: isEscort ? "ESCORT" : isPorn ? "PORNOGRAPHIC" : "SEXUAL_SERVICES",
          decision: "BLOCKED",
          reason: "Обнаружены ключевые слова сексуальных или эскорт-услуг",
        };
      }
    }

    // Check for suspicious masked patterns:
    // e.g. "работа для красивых девушек без опыта от $3000 в день с проживанием в апартаментах"
    const isSuspicious =
      /девуш(ек|кам).*без\s+опыта.*от\s*\$?[0-9]{3,5}.*(апартамент|выезд|сауна)/i.test(text) ||
      /приватн(ое|ые)\s+(общение|встречи)/i.test(text);

    if (isSuspicious) {
      return {
        allowed: false,
        adultContent: true,
        sexualServices: true,
        pornographic: false,
        escort: true,
        unsafe: true,
        confidence: 0.8,
        category: "SUSPICIOUS",
        decision: "REVIEW",
        reason: "Подозрение на замаскированные интим-услуги или сомнительные предложения",
      };
    }

    return {
      allowed: true,
      adultContent: false,
      sexualServices: false,
      pornographic: false,
      escort: false,
      unsafe: false,
      confidence: 0.95,
      category: "CLEAN",
      decision: "SAFE",
      reason: isBenignAdultContext ? "Подтвержден профессиональный образовательный/медицинский контекст" : null,
    };
  }

  /**
   * Gemini AI safety evaluation with strict JSON structured outputs and prompt guard.
   */
  private async evaluateWithGemini(content: string): Promise<ModerationResult> {
    const guardedContent = wrapUntrustedContent(content.slice(0, 15000));

    const systemInstruction = `
Ты — профессиональный AI-модератор платформы поиска работы UzbJobs (Узбекистан).
Твоя задача — строго проверять текст на наличие 18+ контента, сексуальных услуг, порнографии и эскорта.

${PROMPT_INJECTION_SYSTEM_GUARD}

ПРАВИЛА МОДЕРАЦИИ:
1. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ:
   - Порнография, эротика, обнажение
   - Сексуальные и интимные услуги, платный секс
   - Эскорт, услуги спутниц/спутников с интимным подтекстом
   - Вебкам-моделинг, приватные чаты 18+
   - Скрытые интимные услуги (маскировка под массаж, администраторов закрытых клубов, выездной досуг)
   - Ссылки на сайты для взрослых

2. КОНТЕКСТНАЯ ЗАЩИТА:
   - Легитимные вакансии, содержащие слова "adult" или "взрослые" в нормальном профессиональном контексте:
     "adult education", "adult learning", "adult healthcare", "обучение взрослых", "врач для взрослых"
     ОБЯЗАНЫ признаваться БЕЗОПАСНЫМИ (allowed = true, adultContent = false, decision = "SAFE").
   - Анализируй СМЫСЛ текста целиком, а не отдельные слова.

3. ПРИНЯТИЕ РЕШЕНИЯ (decision):
   - "SAFE": контент на 100% безопасен для публикации.
   - "REVIEW": есть сомнительные или двусмысленные формулировки, требующие проверки человеком.
   - "BLOCKED": обнаружен 18+ контент, сексуальные или эскорт-услуги.

ВЕРНИ ТОЛЬКО СТРОГИЙ JSON следующего формата:
{
  "allowed": boolean,
  "adultContent": boolean,
  "sexualServices": boolean,
  "pornographic": boolean,
  "escort": boolean,
  "unsafe": boolean,
  "confidence": number (0.0 - 1.0),
  "category": "CLEAN" | "ADULT_CONTENT" | "SEXUAL_SERVICES" | "ESCORT" | "PORNOGRAPHIC" | "SUSPICIOUS" | "PROMPT_INJECTION_ATTEMPT",
  "decision": "SAFE" | "REVIEW" | "BLOCKED",
  "reason": string or null
}
`;

    const response = await geminiService.generateContent({
      systemInstruction,
      contents: guardedContent,
      responseMimeType: "application/json",
      temperature: 0.0,
    });

    let cleaned = response.text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(cleaned);

    // Ensure decision consistency with boolean flags
    if (parsed.adultContent || parsed.sexualServices || parsed.pornographic || parsed.escort) {
      parsed.allowed = false;
      parsed.unsafe = true;
      parsed.decision = "BLOCKED";
    }

    return ModerationResultSchema.parse(parsed);
  }

  /**
   * Safely logs the moderation decision into ModerationLog table.
   * Never stores long or explicit strings in full.
   */
  private async logModeration(
    input: ModerationInput,
    result: ModerationResult,
    modelName: string
  ): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    try {
      // Create safe sanitized preview snippet (max 100 characters)
      const cleanSnippet = (input.content || "")
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 100);

      await prisma.moderationLog.create({
        data: {
          contentType: input.contentType,
          contentId: input.contentId || null,
          userId: input.userId || null,
          decision: result.decision as ModerationDecision,
          category: result.category as ModerationCategory,
          confidence: result.confidence,
          reason: result.reason || (result.decision === "SAFE" ? "Content clean" : "Flagged"),
          snippet: cleanSnippet,
          source: input.source || "SYSTEM",
          model: modelName,
        },
      });
    } catch (err) {
      // Don't fail the operation if logging fails
      console.error("Failed to write to ModerationLog:", err);
    }
  }
}

export const contentModerationService = new ContentModerationService();
export default contentModerationService;
