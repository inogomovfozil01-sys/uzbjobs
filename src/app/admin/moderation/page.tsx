"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Filter,
  RefreshCw,
  ExternalLink,
  Lock,
} from "lucide-react";

interface ModerationLogItem {
  id: string;
  contentType: string;
  contentId: string | null;
  userId: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  decision: "SAFE" | "REVIEW" | "BLOCKED";
  category: string;
  confidence: number;
  reason: string | null;
  snippet: string | null;
  source: string | null;
  model: string | null;
  createdAt: string;
}

interface PendingVacancy {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  city: string;
  description: string;
  url: string;
  status: string;
  createdAt: string;
  company?: {
    name: string;
    website: string | null;
  };
}

interface Stats {
  totalChecked: number;
  blockedCount: number;
  reviewCount: number;
  safeCount: number;
  last24HoursCount: number;
  pendingReviewVacancies: number;
}

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "blocked" | "logs">("pending");
  const [logs, setLogs] = useState<ModerationLogItem[]>([]);
  const [pendingVacancies, setPendingVacancies] = useState<PendingVacancy[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalChecked: 0,
    blockedCount: 0,
    reviewCount: 0,
    safeCount: 0,
    last24HoursCount: 0,
    pendingReviewVacancies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<PendingVacancy | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (decisionFilter !== "ALL") {
        params.append("decision", decisionFilter);
      }
      params.append("limit", "50");

      const res = await fetch(`/api/admin/moderation?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setPendingVacancies(data.pendingVacancies || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load moderation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [decisionFilter]);

  const handleAction = async (action: "approve_vacancy" | "reject_vacancy" | "delete_vacancy", vacancyId: string, reason?: string) => {
    setActionLoading(vacancyId);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, vacancyId, reason }),
      });

      if (res.ok) {
        setPendingVacancies((prev) => prev.filter((v) => v.id !== vacancyId));
        if (selectedItem?.id === vacancyId) {
          setSelectedItem(null);
        }
        await fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Ошибка при выполнении действия");
      }
    } catch (err) {
      console.error("Action error:", err);
      alert("Сетевая ошибка при выполнении операции");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-rose-600" />
            AI Safety & 18+ Модерация
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Многоуровневая система предотвращения эскорта, интим-услуг и порнографического контента
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 self-start rounded-xl border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Обновить
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Проверено всего</span>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {stats.totalChecked.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">За последние 24ч: {stats.last24HoursCount}</p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Заблокировано (18+)</span>
            <XCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {stats.blockedCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-rose-500 font-medium mt-1">0% утечек в публичный доступ</p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Очередь проверки</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-500">
            {stats.pendingReviewVacancies}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Вакансий требуют решения</p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Безопасный контент</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {stats.safeCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">
            {stats.totalChecked > 0
              ? `${Math.round((stats.safeCount / stats.totalChecked) * 100)}% чистых записей`
              : "100% чистый поток"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "pending"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Требуют проверки
          {stats.pendingReviewVacancies > 0 && (
            <span className="bg-amber-500 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
              {stats.pendingReviewVacancies}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("blocked")}
          className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "blocked"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          Заблокированный 18+
          {stats.blockedCount > 0 && (
            <span className="bg-rose-500 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
              {stats.blockedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "logs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Журнал модерации
        </button>
      </div>

      {/* Tab: Pending Review */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingVacancies.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center text-xs text-muted-foreground space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="font-semibold text-foreground">Очередь пуста!</p>
              <p>Нет вакансий, требующих ручной модерации.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingVacancies.map((vacancy) => (
                <div
                  key={vacancy.id}
                  className="rounded-2xl border bg-card p-5 shadow-sm space-y-3 hover:border-border/80 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                          На проверке
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(vacancy.createdAt).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground mt-1">{vacancy.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {vacancy.companyName} • {vacancy.city}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction("approve_vacancy", vacancy.id)}
                        disabled={actionLoading === vacancy.id}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Одобрить
                      </button>
                      <button
                        onClick={() =>
                          handleAction("reject_vacancy", vacancy.id, "Отклонено модератором: подозрение на 18+")
                        }
                        disabled={actionLoading === vacancy.id}
                        className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Отклонить
                      </button>
                      <button
                        onClick={() => handleAction("delete_vacancy", vacancy.id)}
                        disabled={actionLoading === vacancy.id}
                        className="p-1.5 rounded-xl border text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition disabled:opacity-50"
                        title="Удалить навсегда"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-3 text-xs text-foreground/90 line-clamp-3">
                    {vacancy.description}
                  </div>

                  {vacancy.url && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Источник:</span>
                      <a
                        href={vacancy.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 truncate max-w-md"
                      >
                        {vacancy.url} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Blocked 18+ items */}
      {activeTab === "blocked" && (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Заблокированные 18+ объекты
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Контент, отсеченный AI-модерацией и правилами безопасности до публикации
              </p>
            </div>

            <div className="divide-y text-xs">
              {logs.filter((l) => l.decision === "BLOCKED").length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Заблокированных записей не найдено
                </div>
              ) : (
                logs
                  .filter((l) => l.decision === "BLOCKED")
                  .map((log) => (
                    <div key={log.id} className="p-4 space-y-2 hover:bg-muted/20 transition">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                            {log.category}
                          </span>
                          <span className="font-semibold text-foreground">
                            Тип: {log.contentType}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            Уверенность: {Math.round(log.confidence * 100)}%
                          </span>
                        </div>
                        <span className="text-muted-foreground text-[11px]">
                          {new Date(log.createdAt).toLocaleString("ru-RU")}
                        </span>
                      </div>

                      <p className="text-rose-600 dark:text-rose-400 font-medium text-xs">
                        Причина: {log.reason}
                      </p>

                      {log.snippet && (
                        <div className="bg-muted p-2 rounded-lg text-xs font-mono text-muted-foreground break-all">
                          [Фрагмент]: {log.snippet}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>Модель: {log.model || "rule_based"}</span>
                        <span>Источник: {log.source || "SYSTEM"}</span>
                        {log.user && <span>Пользователь: {log.user.email}</span>}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: All Moderation Logs */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Фильтр решения:</span>
            {["ALL", "SAFE", "REVIEW", "BLOCKED"].map((decision) => (
              <button
                key={decision}
                onClick={() => setDecisionFilter(decision)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  decisionFilter === decision
                    ? "bg-primary text-primary-foreground"
                    : "border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {decision === "ALL"
                  ? "Все"
                  : decision === "SAFE"
                  ? "Безопасно"
                  : decision === "REVIEW"
                  ? "Проверка"
                  : "Заблокировано"}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="divide-y text-xs">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Логов модерации пока нет</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-4 space-y-1.5 hover:bg-muted/20 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                            log.decision === "SAFE"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                              : log.decision === "REVIEW"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {log.decision}
                        </span>
                        <span className="text-muted-foreground text-[10px] uppercase">
                          {log.category}
                        </span>
                        <span className="font-semibold text-foreground">{log.contentType}</span>
                      </div>
                      <span className="text-muted-foreground text-[11px]">
                        {new Date(log.createdAt).toLocaleString("ru-RU")}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-xs">{log.reason || "Проверено системой"}</p>

                    {log.snippet && (
                      <div className="bg-muted/40 p-2 rounded text-[11px] font-mono text-muted-foreground truncate">
                        {log.snippet}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
