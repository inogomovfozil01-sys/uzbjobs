"use client";

import { useState } from "react";
import { X, FileText, Copy, Check, Loader2, Globe, Sparkles } from "lucide-react";
import { VacancyItem } from "@/components/jobs/VacancyCard";

export function AICoverLetterModal({
  vacancy,
  onClose,
}: {
  vacancy: VacancyItem;
  onClose: () => void;
}) {
  const [language, setLanguage] = useState<"Russian" | "Uzbek" | "English">("Russian");
  const [customNotes, setCustomNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLetter = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyId: vacancy.id,
          language,
          customNotes: customNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Не удалось сгенерировать письмо");
      }

      setCoverLetter(data.coverLetter);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-card p-6 shadow-2xl border text-card-foreground max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5" />
          </div>
          <h3>AI Генератор сопроводительного письма</h3>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Создание персонализированного Cover Letter на основе вакансии «{vacancy.title}»
        </p>

        {/* Options */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> Язык письма:
            </label>
            <div className="mt-1.5 flex gap-2">
              {(["Russian", "Uzbek", "English"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${
                    language === lang
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {lang === "Russian" ? "Русский" : lang === "Uzbek" ? "O'zbekcha" : "English"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">
              Дополнительные пожелания (опционально):
            </label>
            <input
              type="text"
              placeholder="Например: подчеркнуть опыт с Next.js и готовность к переезду"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Action button */}
        {!coverLetter && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={generateLetter}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gemini составляет письмо...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Сгенерировать сопроводительное письмо
                </>
              )}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-500/20">
            {error}
          </div>
        )}

        {/* Generated Letter Display */}
        {coverLetter && (
          <div className="mt-6 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Готовый текст письма:</span>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Скопировать
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={12}
              readOnly
              value={coverLetter}
              className="w-full rounded-xl border bg-muted/40 p-4 text-xs font-mono leading-relaxed text-foreground focus:outline-none"
            />

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={generateLetter}
                disabled={loading}
                className="text-xs text-primary hover:underline"
              >
                {loading ? "Пересоздание..." : "Сгенерировать заново"}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Готово
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
