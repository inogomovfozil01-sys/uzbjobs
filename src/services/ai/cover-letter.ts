import geminiService from "./gemini-service";

interface CoverLetterContext {
  userName: string;
  userEmail?: string | null;
  profile: {
    headline?: string | null;
    bio?: string | null;
    skills: string[];
    experienceLevel?: string | null;
    experienceYears?: number | null;
    city?: string | null;
    resumeText?: string | null;
  };
  vacancy: {
    title: string;
    companyName?: string | null;
    skills: string[];
    description: string;
  };
  language: "Russian" | "Uzbek" | "English";
  customNotes?: string;
}

class AICoverLetterService {
  public async generateCoverLetter(ctx: CoverLetterContext): Promise<string> {
    if (!geminiService.isConfigured()) {
      return this.generateFallbackLetter(ctx);
    }

    const languageInstruction =
      ctx.language === "Uzbek"
        ? "Yozuv tili: O'zbek tili (Lotin alifbosida). Rasmiy, professional va ta'sirchan uslubda yozing."
        : ctx.language === "English"
        ? "Language: English. Write in a compelling, concise, and professional business tone."
        : "Язык письма: Русский. Пиши в профессиональном, убедительном деловом стиле без лишней «воды».";

    const prompt = `
Ты — профессиональный карьерный консультант платформы UzbJobs.
Составь персональное, сильное сопроводительное письмо (Cover Letter) для соискателя на вакансию.

${languageInstruction}

ДАННЫЕ СОИСКАТЕЛЯ:
- Имя: ${ctx.userName}
- Специализация: ${ctx.profile.headline || "Специалист"}
- Навыки: ${ctx.profile.skills.join(", ") || "Разработка и проектирование"}
- Опыт: ${ctx.profile.experienceYears ?? "Несколько"} лет (${ctx.profile.experienceLevel || "Mid-level"})
- Город: ${ctx.profile.city || "Узбекистан"}
- Резюме / О себе: ${ctx.profile.resumeText || ctx.profile.bio || ""}
- Дополнительные пожелания соискателя: ${ctx.customNotes || "Нет"}

ДАННЫЕ ВАКАНСИИ:
- Должность: ${ctx.vacancy.title}
- Компания: ${ctx.vacancy.companyName || "Компания"}
- Требуемый стек: ${ctx.vacancy.skills.join(", ")}
- Описание вакансии: ${ctx.vacancy.description.slice(0, 1500)}

СТРУКТУРА ПИСЬМА:
1. Приветствие к нанимающему менеджеру или HR-команде.
2. Вводная часть: на какую позицию отклик и почему заинтересовала компания.
3. Основная часть: 2-3 ключевых достижения/навыка соискателя, которые решают задачи работодателя.
4. Заключение: готовность к собеседованию и контакты.
5. Вежливая подпись с именем соискателя.

ВАЖНО: Верни ТОЛЬКО текст письма, готовый к отправке. Не добавляй свои комментарии или вступления вида "Вот ваше письмо:".
    `;

    try {
      const response = await geminiService.generateContent({
        contents: prompt,
        temperature: 0.3,
      });

      return response.text.trim();
    } catch (err) {
      console.warn("Gemini cover letter generation failed, using template:", err);
      return this.generateFallbackLetter(ctx);
    }
  }

  private generateFallbackLetter(ctx: CoverLetterContext): string {
    const name = ctx.userName || "Соискатель";
    const title = ctx.vacancy.title;
    const company = ctx.vacancy.companyName || "вашу компанию";
    const skills = ctx.profile.skills.slice(0, 4).join(", ") || "профильные навыки";

    if (ctx.language === "Uzbek") {
      return `Assalomu alaykum!

Mening ismim ${name}. Men ${company}dagi "${title}" bo'sh ish o'rniga o'z nomzodimni taqdim etmoqchiman.

Men o'z faoliyatimda ${skills} kabi texnologiyalar bilan faol ishlab kelmoqdaman va tajribam kompaniyangiz loyihalariga amaliy foyda keltirishiga ishonaman.

Mening rezyumeimni ko'rib chiqishingizni so'rayman. Suhbat jarayonida o'z tajribam haqida batafsilroq so'zlab berishdan mamnun bo'laman.

Hurmat bilan,
${name}`;
    }

    if (ctx.language === "English") {
      return `Dear Hiring Team,

My name is ${name}, and I am writing to express my strong interest in the "${title}" position at ${company}.

With a background in ${skills}, I have contributed to impactful projects and honed skills that align directly with your requirements. I am passionate about delivering clean, high-performance solutions and collaborating with cross-functional teams.

I would welcome the opportunity to discuss how my qualifications and passion can benefit your team. Thank you for your time and consideration.

Sincerely,
${name}`;
    }

    return `Здравствуйте!

Меня зовут ${name}. Пишу вам, чтобы выразить искреннюю заинтересованность в открытой позиции «${title}» в компании ${company}.

Мой профессиональный профиль включает опыт работы с ${skills}. Я нацелен на достижение реальных бизнес-результатов, внимателен к качеству кода/продукта и стремлюсь внести значимый вклад в развитие вашей команды.

Буду рад возможности пообщаться на собеседовании и подробнее рассказать о реализованных кейсах.

С уважением,
${name}`;
  }
}

export const aiCoverLetterService = new AICoverLetterService();
export default aiCoverLetterService;
