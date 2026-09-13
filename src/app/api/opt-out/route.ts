import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    await prisma.emailLog.create({
      data: {
        recipient: normalized,
        subject: "Employer Opt-out",
        type: "EMPLOYER_NOTIFICATION",
        status: "OPTED_OUT",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
