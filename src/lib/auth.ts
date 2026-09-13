import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Укажите email и пароль");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { profile: true },
          });
        } catch (err) {
          console.error("Database error during authorize:", err);
          throw new Error("Ошибка базы данных при авторизации");
        }

        if (!user || !user.password) {
          throw new Error("Неверный email или пароль");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Неверный email или пароль");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const normalizedEmail = user.email.toLowerCase();
        try {
          let existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!existingUser) {
            // First user or specific admin email gets ADMIN role automatically
            const count = await prisma.user.count();
            const role = count === 0 || normalizedEmail === "admin@uzbjobs.uz" ? Role.ADMIN : Role.USER;

            existingUser = await prisma.user.create({
              data: {
                email: normalizedEmail,
                name: user.name || "Пользователь",
                image: user.image,
                role: role,
                profile: {
                  create: {
                    city: "Ташкент",
                  },
                },
              },
            });
          }
          (user as any).role = existingUser.role;
          user.id = existingUser.id;
        } catch (err) {
          console.error("Google signIn error:", err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || Role.USER;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || Role.USER;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "default-uzbjobs-secret-key-for-dev",
};

/**
 * Server-side helper to get current session.
 */
export async function getAuthSession() {
  return getServerSession(authOptions);
}

/**
 * Server-side guard requiring logged in user.
 */
export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user as { id: string; email: string; name?: string; role: Role };
}

/**
 * Server-side guard requiring ADMIN role.
 */
export async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    throw new Error("FORBIDDEN_ADMIN_REQUIRED");
  }
  return session.user as { id: string; email: string; name?: string; role: Role };
}
