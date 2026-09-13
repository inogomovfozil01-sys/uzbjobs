"use client";

import { useState } from "react";
import { X, Flag, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export function ReportModal({
  vacancyId,
  vacancyTitle,
  onClose,
}: {
  vacancyId: string;
  vacancyTitle: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<"FAKE" | "EXPIRED" | "WRONG_INFO" | "SPAM" | "OTHER">("EXPIRED");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyId,
          reason,
          details: details.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Не удалось отправить жалобу");
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reasonLabels = {
    EXPIRED: "Вакансия закрыта / неактуальна",
    FAKE: "Фейковая вакансия / обман",
    WRONG_INFO: "Недостоверная информация или контакты",
    SPAM: "Спам или реклама",
    OTHER: "Другая причина",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border text-card-foreground">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
            <Flag className="h-4 w-4" />
          </div>
          <h3>Сообщить о проблеме</h3>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Вакансия: <span className="font-semibold text-foreground">{vacancyTitle}</span>
        </p>

        {submitted ? (
          <div className="my-8 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 animate-bounce" />
            <p className="text-sm font-semibold">Жалоба успешно отправлена!</p>
            <p className="text-xs text-muted-foreground">Модератор проверит публикацию в ближайшее время.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Причина жалобы:</label>
              <div className="mt-2 space-y-2">
                {(["EXPIRED", "FAKE", "WRONG_INFO", "SPAM", "OTHER"] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs font-medium cursor-pointer transition ${
                      reason === r
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="text-primary"
                    />
                    <span>{reasonLabels[r]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Подробности (необязательно):
              </label>
              <textarea
                rows={3}
                placeholder="Опишите подробнее, что не так с вакансией..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300 border border-rose-500/20">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border px-4 py-2 text-xs font-medium hover:bg-muted"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Отправить"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
