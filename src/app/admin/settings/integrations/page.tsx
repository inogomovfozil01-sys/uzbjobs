"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Sparkles,
  Search,
  Database,
  Mail,
  Lock,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface ServiceCardData {
  id: string;
  name: string;
  category: "GEMINI" | "GOOGLE_SEARCH" | "DATABASE" | "EMAIL" | "AUTH" | "CRON";
  description: string;
  icon: any;
  docsUrl: string;
  docsLabel: string;
}

const SERVICES: ServiceCardData[] = [
  {
    id: "gemini",
    name: "Google Gemini API",
    category: "GEMINI",
    description: "Анализ вакансий, извлечение структурированного JSON, AI Match и генерация Cover Letter.",
    icon: Sparkles,
    docsUrl: "https://aistudio.google.com/app/apikey",
    docsLabel: "Получить ключ в Google AI Studio",
  },
  {
    id: "google_search",
    name: "Google Search API (Custom Search)",
    category: "GOOGLE_SEARCH",
    description: "Поиск актуальных объявлений о работе в интернете по Узбекистану.",
    icon: Search,
    docsUrl: "https://programmablesearchengine.google.com/",
    docsLabel: "Настроить Search Engine ID (CX)",
  },
  {
    id: "database",
    name: "PostgreSQL Database (Prisma)",
    category: "DATABASE",
    description: "Основное хранилище вакансий, профилей, логов сканирования и компаний (Neon / Supabase / Railway).",
    icon: Database,
    docsUrl: "https://neon.tech",
    docsLabel: "Документация Neon / Supabase",
  },
  {
    id: "email",
    name: "Email (SMTP Transporter)",
    category: "EMAIL",
    description: "Отправка уведомлений работодателям и соискателям с поддержкой opt-out.",
    icon: Mail,
    docsUrl: "https://support.google.com/mail/answer/185833",
    docsLabel: "Настройка SMTP паролей приложений",
  },
  {
    id: "auth",
    name: "Google OAuth (NextAuth)",
    category: "AUTH",
    description: "Регистрация и вход через Google аккаунт, безопасные JWT сессии и защита ролей USER/ADMIN.",
    icon: Lock,
    docsUrl: "https://console.cloud.google.com/apis/credentials",
    docsLabel: "Настройка Google OAuth Client",
  },
  {
    id: "cron",
    name: "Cron / Scheduled Jobs",
    category: "CRON",
    description: "Фоновый регулярный запуск сканирования вакансий и проверка устаревших объявлений.",
    icon: Clock,
    docsUrl: "https://vercel.com/docs/cron-jobs",
    docsLabel: "Настройка Cron в Vercel / Railway",
  },
];

export default function IntegrationsSettingsPage() {
  const [statuses, setStatuses] = useState<Record<string, { status: string; message: string; latencyMs?: number }>>({});
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);

  const loadStatuses = async () => {
    try {
      const res = await fetch("/api/admin/integrations");
      if (res.ok) {
        const data = await res.json();
        setStatuses(data.statuses || {});
      }
    } catch (err) {
      console.error("Failed to load statuses:", err);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  const testSingle = async (category: string) => {
    setTestingService(category);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: category }),
      });
      const data = await res.json();
      if (data.result) {
        setStatuses((prev) => ({
          ...prev,
          [category.toLowerCase()]: data.result,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingService(null);
    }
  };

  const testAll = async () => {
    setTestingAll(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: "ALL" }),
      });
      const data = await res.json();
      if (data.result) {
        setStatuses(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingAll(false);
    }
  };

  const getBadge = (serviceCategory: string) => {
    const key = serviceCategory.toLowerCase();
    const st = statuses[key] || statuses[serviceCategory];
    const status = st?.status || "NOT_CONFIGURED";

    if (status === "CONNECTED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3.5 w-3.5" /> CONNECTED
        </span>
      );
    }

    if (status === "ERROR") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <XCircle className="h-3.5 w-3.5" /> ERROR
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <AlertCircle className="h-3.5 w-3.5" /> NOT CONFIGURED
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            Интеграции и API Сервисы
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Диагностика подключения внешних сервисов: Gemini, Google Search, PostgreSQL, Email, Auth и Cron
          </p>
        </div>

        <button
          onClick={testAll}
          disabled={testingAll}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50 transition shrink-0"
        >
          {testingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Проверить все сервисы
        </button>
      </div>

      {/* Security Note */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-muted-foreground leading-relaxed">
        <span className="font-bold text-foreground block mb-0.5">🔒 Безопасность ключей и паролей</span>
        Секретные API ключи (GEMINI_API_KEY, GOOGLE_SEARCH_API_KEY, AUTH_SECRET и пароли БД) никогда не передаются в браузер. Все проверки и вызовы выполняются исключительно на стороне защищенного сервера.
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICES.map((srv) => {
          const Icon = srv.icon;
          const key = srv.category.toLowerCase();
          const info = statuses[key] || statuses[srv.category];
          const isTesting = testingService === srv.category;

          return (
            <div
              key={srv.id}
              className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{srv.name}</h3>
                      <span className="text-[10px] text-muted-foreground font-mono">{srv.category}</span>
                    </div>
                  </div>
                  {getBadge(srv.category)}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {srv.description}
                </p>

                {info?.message && (
                  <div className="rounded-lg bg-muted p-2.5 text-[11px] font-mono text-foreground/90 border">
                    {info.message}
                    {info.latencyMs && (
                      <span className="text-muted-foreground ml-2">({info.latencyMs}ms)</span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t flex items-center justify-between gap-2">
                <a
                  href={srv.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  {srv.docsLabel} <ExternalLink className="h-3 w-3" />
                </a>

                <button
                  onClick={() => testSingle(srv.category)}
                  disabled={isTesting || testingAll}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50 transition flex items-center gap-1.5 shrink-0"
                >
                  {isTesting && <Loader2 className="h-3 w-3 animate-spin" />}
                  Test connection
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
