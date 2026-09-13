"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  AlertTriangle,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AdminVacanciesPage() {
  const [tab, setTab] = useState<"PENDING_REVIEW" | "ACTIVE" | "REJECTED" | "ALL">("PENDING_REVIEW");
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadVacancies = async () => {
    setLoading(true);
    try {
      const url = tab === "ALL" ? "/api/jobs?limit=50" : `/api/jobs?status=${tab}&limit=50`;
      const res = await fetch(url);
      const data = await res.json();
      setVacancies(data.vacancies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacancies();
  }, [tab]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/vacancies/${id}/approve`, { method: "POST" });
      if (res.ok) {
        setVacancies((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/vacancies/${id}/reject`, { method: "POST" });
      if (res.ok) {
        setVacancies((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Модерация и управление вакансиями
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Очередь ручной проверки, AI score и подтверждение публикации
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex rounded-xl bg-muted p-1 text-xs font-semibold">
          <button
            onClick={() => setTab("PENDING_REVIEW")}
            className={`rounded-lg px-3 py-1.5 transition ${
              tab === "PENDING_REVIEW"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            На модерации
          </button>
          <button
            onClick={() => setTab("ACTIVE")}
            className={`rounded-lg px-3 py-1.5 transition ${
              tab === "ACTIVE"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Опубликованные
          </button>
          <button
            onClick={() => setTab("REJECTED")}
            className={`rounded-lg px-3 py-1.5 transition ${
              tab === "REJECTED"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Отклоненные
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : vacancies.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-xs text-muted-foreground space-y-2">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
          <p className="font-semibold text-foreground">Очередь чиста!</p>
          <p>В выбранной категории сейчас нет вакансий для проверки.</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3.5 font-semibold">AI Score</th>
                  <th className="p-3.5 font-semibold">Название и компания</th>
                  <th className="p-3.5 font-semibold">Город</th>
                  <th className="p-3.5 font-semibold">Зарплата</th>
                  <th className="p-3.5 font-semibold">Источник</th>
                  <th className="p-3.5 font-semibold text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vacancies.map((vacancy) => (
                  <tr key={vacancy.id} className="hover:bg-muted/30 transition">
                    {/* AI Score */}
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-bold text-xs ${
                          vacancy.qualityScore >= 85
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : vacancy.qualityScore >= 60
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <Sparkles className="h-3 w-3" />
                        {vacancy.qualityScore}
                      </span>
                    </td>

                    {/* Title and Company */}
                    <td className="p-3.5 space-y-0.5">
                      <Link
                        href={`/jobs/${vacancy.slug}`}
                        target="_blank"
                        className="font-bold text-foreground hover:text-primary transition line-clamp-1"
                      >
                        {vacancy.title}
                      </Link>
                      <div className="text-muted-foreground text-[11px]">
                        {vacancy.companyName || vacancy.company?.name || "Компания"}
                      </div>
                    </td>

                    {/* City */}
                    <td className="p-3.5 text-muted-foreground">{vacancy.city || "Ташкент"}</td>

                    {/* Salary */}
                    <td className="p-3.5 font-medium text-emerald-600 dark:text-emerald-400">
                      {vacancy.salaryText || "Не указана"}
                    </td>

                    {/* Source */}
                    <td className="p-3.5">
                      <a
                        href={vacancy.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-[11px]"
                      >
                        {vacancy.sourceName || "Ссылка"} <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(vacancy.id)}
                          disabled={actionLoading === vacancy.id}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleReject(vacancy.id)}
                          disabled={actionLoading === vacancy.id}
                          className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          Отклонить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
