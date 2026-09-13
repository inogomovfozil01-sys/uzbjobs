"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Не удалось завершить регистрацию");
      }

      // Automatically sign in upon registration
      await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      router.push("/profile");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            Создать аккаунт
          </h1>
          <p className="text-xs text-muted-foreground">
            Присоединяйтесь к платформе поиска работы с AI в Узбекистане
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-500/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground">Ваше имя:</label>
            <input
              type="text"
              required
              placeholder="Сардор Рахимов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Электронная почта:</label>
            <input
              type="email"
              required
              placeholder="sardor@example.uz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Пароль (от 6 символов):</label>
            <input
              type="password"
              required
              minLength={6}
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Зарегистрироваться"}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-2">
          Уже зарегистрированы?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    </div>
  );
}
