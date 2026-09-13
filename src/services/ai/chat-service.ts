import geminiService from "./gemini-service";
import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  userName?: string | null;
  userCity?: string | null;
  userSkills?: string[];
  userExperience?: string | null;
}

class AIChatService {
  /**
   * Generates response from UzbJobs AI Career Consultant.
   */
  public async generateChatReply({
    messages,
    context,
  }: {
    messages: ChatMessage[];
    context?: ChatContext;
  }): Promise<string> {
    if (!messages || messages.length === 0) {
      throw new Error("Сообщения не переданы");
    }

    // 1. Fetch latest active vacancies for grounding recommendations
    let activeVacanciesSnippet = "";
    try {
      const vacancies = await prisma.vacancy.findMany({
        where: { status: VacancyStatus.ACTIVE },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          title: true,
          slug: true,
          companyName: true,
          city: true,
          salaryText: true,
          skills: true,
          experienceLevel: true,
          isRemote: true,
        },
      });

      if (vacancies.length > 0) {
        activeVacanciesSnippet = vacancies
          .map(
            (v) =>
              `- [${v.title} в ${v.companyName || "Компанию"}](/jobs/${v.slug}) | Город: ${v.city || "Ташкент"} | Зарплата: ${v.salaryText || "Договорная"} | Уровень: ${v.experienceLevel || "Любой"} | Формат: ${v.isRemote ? "Удаленно" : "Офис"} | Навыки: ${v.skills.slice(0, 4).join(", ")}`
          )
          .join("\n");
      }
    } catch (err) {
      console.warn("Could not fetch active vacancies for chat context:", err);
    }

    // 2. Build system instructions
    const systemInstruction = `Ты — UzbJobs AI, профессиональный, дружелюбный и авторитетный карьерный консультант платформы UzbJobs в Узбекистане.

ТВОЯ МИССИЯ:
Помогать соискателям и специалистам в Узбекистане находить лучшую работу, развивать карьеру, готовиться к собеседованиям, составлять резюме, оценивать рыночные зарплаты и ориентироваться в технологических и коммерческих компаниях страны.

КОНТЕКСТ РЫНКА УЗБЕКИСТАНА:
- Ведущие работодатели и IT-компании: Uzum Technologies (Uzum Market, Uzum Bank, Tezkor), Payme, CLICK, EPAM Uzbekistan, TBC Bank Uzbekistan, Yandex Uzbekistan, Beeline, Ucell, Anorbank, IT Park Uzbekistan, Billz, Mad Devs, Exadel, Kapitalbank, MyUztelecom и др.
- Города: Ташкент (основной IT-хаб), Самарканд, Бухара, Фергана, Андижан, а также удаленная работа (Remote).
- Зарплатные вилки в IT в Узбекистане (ориентировочно):
  * Junior: $400 - $900 (6 000 000 – 12 000 000 сум)
  * Middle: $1,200 - $2,500 (15 000 000 – 30 000 000 сум)
  * Senior / Lead: $2,500 - $5,000+ (35 000 000 – 65 000 000+ сум)

АКТУАЛЬНЫЕ ВАКАНСИИ ИЗ БАЗЫ ДАННЫХ ПЛАТФОРМЫ (рекомендуй их пользователю, когда это релевантно, вставляя ссылки в формате Markdown [Название](/jobs/slug)):
${activeVacanciesSnippet || "Каталог вакансий доступен на странице /jobs"}

ДАННЫЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ (если авторизован):
${
  context?.userName
    ? `- Имя: ${context.userName}
- Город: ${context.userCity || "Не указан"}
- Навыки: ${context.userSkills?.join(", ") || "Не указаны"}
- Опыт: ${context.userExperience || "Не указан"}`
    : "Пользователь — гость (пока не авторизован)."
}

ПРАВИЛА ОТВЕТОВ:
1. Язык общения: Автоматически отвечай на том языке, на котором пишет пользователь — русский, узбекский (O'zbek tili lotin alifbosida) или английский.
2. Стиль: Поддерживающий, практичный, структурированный (используй списки, выделение жирным шрифтом, четкие шаги).
3. При рекомендации вакансий всегда давай прямые кликабельные ссылки на вакансии из списка выше в формате [Название должности](/jobs/slug).
4. Если пользователь просит составить или улучшить резюме, давай конкретные формулировки, сильные глаголы действий и советы по оформлению.
5. Если пользователь спрашивает про зарплаты или стек, опирайся на реальный рынок Узбекистана.
6. НИКОГДА не упоминай названия сторонних базовых AI-моделей или провайдеров (таких как Google Gemini, OpenAI, Claude). Ты — "UzbJobs AI" или "ИИ-консультант UzbJobs".
7. Держи фокус на карьере, работе, технологиях, бизнесе и обучении в Узбекистане.`;

    // 3. Construct prompt history for model
    const conversationHistory = messages
      .slice(-10) // last 10 messages for context
      .map((m) => `${m.role === "user" ? "Пользователь" : "UzbJobs AI"}: ${m.content}`)
      .join("\n\n");

    const prompt = `${conversationHistory}\n\nUzbJobs AI:`;

    // 4. Call model
    const result = await geminiService.generateContent({
      systemInstruction,
      contents: prompt,
      temperature: 0.7,
    });

    return result.text.trim();
  }
}

export const aiChatService = new AIChatService();
export default aiChatService;
