"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function OptOutContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/opt-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) throw new Error("Не удалось обработать запрос");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border bg-card p-8 shadow-xl text-card-foreground">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Управление уведомлениями для работодателей
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Мы уважаем приватность компаний. Если вы получили уведомление о добавлении вакансии и хотите отключить будущие письма или удалить вакансии компании, подтвердите ваш email.
          </p>
        </div>

        {success ? (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-6 text-center space-y-2 border border-emerald-500/20">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              Ваш адрес успешно исключен из рассылки (Opt-Out)
            </p>
            <p className="text-xs text-muted-foreground">
              Мы больше не будем отправлять уведомления на этот адрес.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Ваш рабочий email:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@company.uz"
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Отписаться от уведомлений"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function OptOutPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <OptOutContent />
    </Suspense>
  );
}
