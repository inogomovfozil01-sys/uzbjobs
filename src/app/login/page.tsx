"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, Loader2, AlertCircle } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useLanguage } from "@/lib/i18n";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    authError === "OAuthSignin" || authError === "OAuthCallback"
      ? "Не удалось войти через Google. Проверьте настройки OAuth Client ID."
      : null
  );

  // If already authenticated, automatically redirect: ADMIN -> /admin, USER -> /
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if ((session.user as any).role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace(callbackUrl);
      }
    }
  }, [status, session, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const isAdmin = normalizedEmail === "inogomovfozil01@gmail.com" || normalizedEmail === "admin@uzbjobs.uz";

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: normalizedEmail,
        password,
      });

      if (res?.error) {
        setError("Неверный email или пароль");
      } else {
        const targetUrl = isAdmin ? "/admin" : (callbackUrl === "/" ? (isAdmin ? "/admin" : "/") : callbackUrl);
        router.push(targetUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-xl text-card-foreground">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground">
              Uzb<span className="text-primary">Jobs</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("loginTitle")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("loginSubtitle")}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-500/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google */}
        <div className="space-y-4">
          <GoogleSignInButton callbackUrl={callbackUrl} />

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border"></div>
            <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              {t("orWithEmail")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground">{t("emailLabel")}</label>
            <input
              type="email"
              required
              placeholder="example@uzbjobs.uz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">{t("passwordLabel")}</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("navSignIn")}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-1">
          <Link href="/register" className="font-semibold text-primary hover:underline">
            {t("noAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
