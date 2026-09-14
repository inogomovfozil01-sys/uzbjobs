import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import geminiService from "@/services/ai/gemini-service";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limiter";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const session = await getAuthSession();
  const userId = (session?.user as any)?.id || `guest-${ip}`;

  const rateConfig = session?.user ? RATE_LIMITS.AI_USER : RATE_LIMITS.AI_GUEST;
  const rateLimit = checkRateLimit(userId, "ai_resume", rateConfig);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Слишком много запросов. Пожалуйста, подождите минуту." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const {
      headline,
      skills,
      experienceYears,
      experienceLevel,
      city,
      bio,
      lang = "ru",
    } = body;

    const name = session?.user?.name || "Специалист";

    const systemInstruction = `Ты — эксперт по HR и составлению резюме для платформы UzbJobs в Узбекистане.
Твоя задача — составить подробный, сильный и профессиональный текст резюме кандидата для последующего AI-анализа (AI Match) и откликов на вакансии в Узбекистане.

Требования к тексту резюме:
1. Язык: ${lang === "uz" ? "O'zbek tili (lotin alifbosida)" : lang === "en" ? "English" : "Русский"}.
2. Структура:
   - ФИО и целевая должность (Headline)
   - Контакты и локация (Город, формат работы)
   - Краткое профессиональное саммари (сильные стороны, ценность для бизнеса)
   - Ключевые навыки и технологии (разбитые по группам)
   - Опыт работы и ключевые достижения (с цифрами, результатами, глаголами действия)
   - Языки
3. Формат: Чистый, хорошо структурированный текст (без лишней болтовни, сразу готовый текст резюме).
4. НИКОГДА не упоминай названия сторонних AI-моделей (таких как Google Gemini, OpenAI и т.д.).`;

    const prompt = `Составь идеальное резюме по следующим данным кандидата:
- Имя: ${name}
- Целевая должность / Заголовок: ${headline || "IT Специалист"}
- Город: ${city || "Ташкент"}
- Уровень квалификации: ${experienceLevel || "Middle"}
- Опыт работы: ${experienceYears || 2} года/лет
- Ключевые навыки: ${Array.isArray(skills) && skills.length > 0 ? skills.join(", ") : "Fullstack, DevOps, Management"}
- Дополнительно о себе / контекст: ${bio || "Администратор и разработчик платформы"}

Выдай только готовый для вставки текст резюме.`;

    const result = await geminiService.generateContent({
      systemInstruction,
      contents: prompt,
      temperature: 0.6,
    });

    return NextResponse.json({ resumeText: result.text.trim() });
  } catch (err: any) {
    console.error("Resume generation error:", err);
    return NextResponse.json(
      { error: err.message || "Не удалось сгенерировать резюме" },
      { status: 500 }
    );
  }
}
