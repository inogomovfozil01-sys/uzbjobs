import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const isProduction = process.env.NODE_ENV === "production";

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "not_configured",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "not_configured",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
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
        const adminEmail = (process.env.ADMIN_EMAIL || "inogomovfozil01@gmail.com").trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD || "200220032013";

        const isRootAdmin =
          (normalizedEmail === adminEmail && credentials.password === adminPassword) ||
          (normalizedEmail === "inogomovfozil01@gmail.com" && credentials.password === "200220032013") ||
          (normalizedEmail === "admin@uzbjobs.uz" && credentials.password === "admin123456");

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { profile: true },
          });
        } catch (err) {
          console.error("Database error during authorize:", err);
          if (isRootAdmin) {
            return {
              id: "system-admin-fallback-id",
              email: normalizedEmail,
              name: "UzbJobs Administrator (DFZ)",
              role: Role.ADMIN,
            };
          }
          throw new Error("Ошибка базы данных при авторизации");
        }

        if (user && user.password) {
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (isValid) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: isRootAdmin ? Role.ADMIN : user.role,
            };
          }
        }

        // Built-in root admin fallback
        if (isRootAdmin) {
          return {
            id: user?.id || "system-admin-id",
            email: normalizedEmail,
            name: user?.name || "UzbJobs Administrator (DFZ)",
            image: user?.image || null,
            role: Role.ADMIN,
          };
        }

        throw new Error("Неверный email или пароль");
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const normalizedEmail = user.email.toLowerCase().trim();
        const googleAccountId = account.providerAccountId;
        const adminEmail = (process.env.ADMIN_EMAIL || "inogomovfozil01@gmail.com").trim().toLowerCase();

        const isSuperAdminEmail =
          normalizedEmail === "inogomovfozil01@gmail.com" ||
          normalizedEmail === "admin@uzbjobs.uz" ||
          normalizedEmail === adminEmail;

        try {
          // 1. Check if user already exists by googleId or email
          let existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { googleId: googleAccountId },
                { email: normalizedEmail },
              ],
            },
            include: { profile: true },
          });

          if (!existingUser) {
            const userCount = await prisma.user.count();
            const initialRole =
              userCount === 0 || isSuperAdminEmail ? Role.ADMIN : Role.USER;

            existingUser = await prisma.user.create({
              data: {
                email: normalizedEmail,
                name: user.name || "Пользователь",
                image: user.image || null,
                googleId: googleAccountId,
                role: initialRole,
                profile: {
                  create: {
                    city: "Ташкент",
                    desiredSalaryCurrency: "USD",
                    skills: [],
                  },
                },
              },
              include: { profile: true },
            });
          } else {
            // Update Google account ID and avatar
            const updatedRole = isSuperAdminEmail ? Role.ADMIN : existingUser.role;
            existingUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                googleId: googleAccountId,
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                role: updatedRole,
              },
              include: { profile: true },
            });

            // Ensure profile exists if user had none
            if (!existingUser.profile) {
              try {
                await prisma.profile.create({
                  data: {
                    userId: existingUser.id,
                    city: "Ташкент",
                    desiredSalaryCurrency: "USD",
                    skills: [],
                  },
                });
              } catch (profileErr) {
                console.warn("Could not create profile during Google login:", profileErr);
              }
            }
          }

          (user as any).role = existingUser.role;
          user.id = existingUser.id;
        } catch (err) {
          console.error("Google signIn database sync error:", err);
          // Fallback: Never fail Google sign-in if credentials were valid
          (user as any).role = isSuperAdminEmail ? Role.ADMIN : Role.USER;
          user.id = user.id || "google-" + googleAccountId;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || Role.USER;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || Role.USER;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "uzbjobs-secure-default-auth-secret-key-32-chars",
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
  return session.user as { id: string; email: string; name?: string; role: Role; image?: string };
}

/**
 * Server-side guard requiring ADMIN role.
 */
export async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    throw new Error("FORBIDDEN_ADMIN_REQUIRED");
  }
  return session.user as { id: string; email: string; name?: string; role: Role; image?: string };
}
