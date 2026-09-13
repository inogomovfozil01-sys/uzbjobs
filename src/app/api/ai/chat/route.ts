import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import aiChatService, { ChatMessage } from "@/services/ai/chat-service";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limiter";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const session = await getAuthSession();
  const userId = (session?.user as any)?.id || `guest-${ip}`;

  // Rate limiting (shared or user specific)
  const rateConfig = session?.user ? RATE_LIMITS.AI_USER : RATE_LIMITS.AI_GUEST;
  const rateLimit = checkRateLimit(userId, "ai_chat", rateConfig);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error:
          "Слишком много запросов в чат. Пожалуйста, подождите немного перед отправкой следующего сообщения.",
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Некорректный формат сообщений." },
        { status: 400 }
      );
    }

    // Sanitize & validate messages
    const validMessages: ChatMessage[] = [];
    for (const m of messages) {
      if (
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
      ) {
        validMessages.push({
          role: m.role,
          content: m.content.slice(0, 3000), // prevent huge payloads
        });
      }
    }

    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: "Сообщение не может быть пустым." },
        { status: 400 }
      );
    }

    // Retrieve user context if authenticated
    let context = undefined;
    if (session?.user) {
      const user = session.user as any;
      try {
        const profile = await prisma.profile.findUnique({
          where: { userId: user.id },
          select: {
            city: true,
            skills: true,
            experienceLevel: true,
          },
        });

        context = {
          userName: user.name || null,
          userCity: profile?.city || null,
          userSkills: profile?.skills || [],
          userExperience: profile?.experienceLevel || null,
        };
      } catch (e) {
        console.warn("Could not load user profile for chat context:", e);
      }
    }

    const reply = await aiChatService.generateChatReply({
      messages: validMessages,
      context,
    });

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (err: any) {
    console.error("AI Chat API Error:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Не удалось получить ответ от ИИ-консультанта. Попробуйте еще раз через минуту.",
      },
      { status: 500 }
    );
  }
}
