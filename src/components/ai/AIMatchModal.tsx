"use client";

import { useState } from "react";
import { X, Sparkles, CheckCircle2, AlertCircle, Check, Loader2 } from "lucide-react";
import { VacancyItem } from "@/components/jobs/VacancyCard";
import { AIMatchResult } from "@/validators/ai";

export function AIMatchModal({
  vacancy,
  onClose,
}: {
  vacancy: VacancyItem;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guestSkillsInput, setGuestSkillsInput] = useState("");
  const [guestExperience, setGuestExperience] = useState("Mid");
  const [needsGuestInput, setNeedsGuestInput] = useState(false);

  const runMatch = async (customSkills?: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyId: vacancy.id,
          guestSkills: customSkills || (guestSkillsInput ? guestSkillsInput.split(",").map((s) => s.trim()).filter(Boolean) : undefined),
          guestExperience: guestExperience,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.requiresProfile) {
          setNeedsGuestInput(true);
        } else {
          setError(data.error || "Не удалось выполнить анализ");
        }
        setLoading(false);
        return;
      }

      setResult(data.match);
      setNeedsGuestInput(false);
    } catch (err: any) {
      setError(err.message || "Ошибка подключения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border text-card-foreground">
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
            <Sparkles className="h-5 w-5" />
          </div>
          <h3>AI Анализ соответствия (Match)</h3>
        </div>

        <p className="mt-1.5 text-xs text-muted-foreground">
          Оценка соответствия вашего профиля вакансии:{" "}
          <span className="font-semibold text-foreground">{vacancy.title}</span>
        </p>

        {/* State 1: Initial Prompt if not run */}
        {!result && !loading && !needsGuestInput && (
          <div className="mt-6 text-center py-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium">
                ИИ проанализирует стек технологий, опыт и требования вакансии в сравнении с вашим резюме.
              </p>
            </div>
            <button
              onClick={() => runMatch()}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition"
            >
              Запустить AI анализ
            </button>
          </div>
        )}

        {/* State 2: Guest input needed */}
        {needsGuestInput && !loading && (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-300 border border-amber-500/20">
              Вы не авторизованы или не указали навыки в профиле. Введите ваш стек через запятую:
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Ваши навыки (через запятую):</label>
              <input
                type="text"
                placeholder="React, TypeScript, Next.js, Git, Docker"
                value={guestSkillsInput}
                onChange={(e) => setGuestSkillsInput(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Уровень опыта:</label>
              <select
                value={guestExperience}
                onChange={(e) => setGuestExperience(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Junior">Junior (0-1 год)</option>
                <option value="Mid">Middle (1-3 года)</option>
                <option value="Senior">Senior (4+ лет)</option>
                <option value="Lead">Lead / Team Lead</option>
              </select>
            </div>
            <button
              onClick={() => runMatch()}
              className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition"
            >
              Проверить совместимость
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              ИИ анализирует соответствие навыков и требований...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-500/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Match Result Display */}
        {result && (
          <div className="mt-5 space-y-4 animate-in fade-in duration-300">
            {/* Score Ring / Bar */}
            <div className="flex items-center justify-between rounded-xl bg-muted/60 p-4">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Общий балл совпадения:</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-primary">{result.score}%</span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {result.score >= 80 ? "🔥 Высокий шанс" : result.score >= 50 ? "👍 Хороший кандидат" : "⚡ Требует подготовки"}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs space-y-1">
                <div>
                  <span className="text-muted-foreground">Опыт: </span>
                  <span className="font-semibold text-foreground">{result.experienceMatch}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Зарплата: </span>
                  <span className="font-semibold text-foreground">{result.salaryMatch}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed font-medium bg-secondary/40 p-3 rounded-lg">
              {result.summary}
            </p>

            {/* Matching Skills */}
            {result.matchingSkills.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Совпадающие навыки ({result.matchingSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchingSkills.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missingSkills.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Стоит изучить или упомянуть ({result.missingSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-500/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="border-t pt-3">
                <span className="text-xs font-semibold text-foreground mb-1 block">Советы по отклику:</span>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-xs font-medium hover:bg-muted transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
