import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterUserSchema } from "@/validators/job";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limiter";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, "register", RATE_LIMITS.AUTH);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Слишком много попыток. Пожалуйста, подождите минуту." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const result = RegisterUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Неверные данные" },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже зарегистрирован" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0 || normalizedEmail === "admin@uzbjobs.uz";

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: isFirstUser ? Role.ADMIN : Role.USER,
        profile: {
          create: {
            city: "Ташкент",
            desiredCity: "Ташкент",
            desiredSalaryCurrency: "USD",
            skills: [],
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user,
        message: isFirstUser
          ? "Администратор успешно зарегистрирован"
          : "Регистрация успешна",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера при регистрации" },
      { status: 500 }
    );
  }
}
