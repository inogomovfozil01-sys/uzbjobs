"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Radio,
  Building2,
  Users,
  Sparkles,
  Search,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Layers,
  Loader2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data?.metrics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { metrics, charts, recentScans } = data;

  const statCards = [
    {
      title: "Всего вакансий",
      value: metrics.totalVacancies,
      sub: `${metrics.activeVacancies} активных`,
      icon: FileText,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "На модерации",
      value: metrics.pendingVacancies,
      sub: "Требуют проверки",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
      href: "/admin/vacancies?status=PENDING_REVIEW",
    },
    {
      title: "Новых сегодня",
      value: metrics.newToday,
      sub: "Добавлено AI сканером",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Компаний в базе",
      value: metrics.totalCompanies,
      sub: "Работодатели РУз",
      icon: Building2,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      title: "AI Анализов вакансий",
      value: metrics.totalAIAnalyses,
      sub: "Обработано страниц",
      icon: Sparkles,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
    },
    {
      title: "Поисковых запросов",
      value: metrics.totalSearches,
      sub: "Google Search API",
      icon: Search,
      color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50",
    },
    {
      title: "Пользователей",
      value: metrics.totalUsers,
      sub: "Зарегистрировано",
      icon: Users,
      color: "text-teal-600 bg-teal-50 dark:bg-teal-950/50",
    },
    {
      title: "Ошибок в журнале",
      value: metrics.errorCount,
      sub: "ErrorLog записей",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50",
      href: "/admin/logs",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Обзор платформы UzbJobs
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Мониторинг работы AI-сканера, базы данных и поисковых интеграций
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/scanner"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow hover:opacity-90 transition"
          >
            <Radio className="h-4 w-4 animate-pulse" /> Открыть AI Сканер
          </Link>
        </div>
      </div>

      {data.warning && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <div className="space-y-1">
            <p className="font-semibold">{data.warning}</p>
            <p className="text-muted-foreground">
              Перейдите в <Link href="/admin/settings/integrations" className="underline font-medium text-amber-600 dark:text-amber-400">Интеграции & API</Link> для проверки подключений к PostgreSQL, Gemini и Google Search.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const CardContent = (
            <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3 hover:border-primary/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{card.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-foreground">{card.value}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{card.sub}</p>
              </div>
            </div>
          );

          return card.href ? (
            <Link key={i} href={card.href}>
              {CardContent}
            </Link>
          ) : (
            <div key={i}>{CardContent}</div>
          );
        })}
      </div>

      {/* Breakdown Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cities breakdown */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Распределение вакансий по городам
          </h2>
          <div className="space-y-3">
            {charts.cities.map((cityItem: any, i: number) => {
              const maxCount = charts.cities[0]?.count || 1;
              const percentage = Math.round((cityItem.count / maxCount) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">{cityItem.name}</span>
                    <span className="text-muted-foreground font-mono">{cityItem.count} вакансий</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories breakdown */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Вакансии по специализациям
          </h2>
          <div className="space-y-3">
            {charts.categories.map((catItem: any, i: number) => {
              const maxCount = charts.categories[0]?.count || 1;
              const percentage = Math.round((catItem.count / maxCount) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">{catItem.name}</span>
                    <span className="text-muted-foreground font-mono">{catItem.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" /> История последних запусков AI Сканера
          </h2>
          <Link href="/admin/scanner" className="text-xs text-primary hover:underline">
            Перейти к сканеру →
          </Link>
        </div>

        {recentScans.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Запусков сканера ещё не зафиксировано.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-2.5 font-semibold">ID</th>
                  <th className="py-2.5 font-semibold">Статус</th>
                  <th className="py-2.5 font-semibold">Найдено</th>
                  <th className="py-2.5 font-semibold">Принято</th>
                  <th className="py-2.5 font-semibold">Дубликатов</th>
                  <th className="py-2.5 font-semibold">Отклонено</th>
                  <th className="py-2.5 font-semibold">Дата запуска</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentScans.map((scan: any) => (
                  <tr key={scan.id} className="hover:bg-muted/40">
                    <td className="py-3 font-mono font-medium">{scan.id.slice(0, 8)}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          scan.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : scan.status === "RUNNING"
                            ? "bg-blue-50 text-blue-600 animate-pulse"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{scan.totalFound}</td>
                    <td className="py-3 text-emerald-600 font-bold">{scan.accepted}</td>
                    <td className="py-3 text-amber-600">{scan.duplicates}</td>
                    <td className="py-3 text-muted-foreground">{scan.rejected}</td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(scan.createdAt).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
