"use client";

import { useState, useEffect, useRef } from "react";
import {
  Radio,
  Play,
  Square,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  RefreshCw,
  Terminal,
  Loader2,
} from "lucide-react";

export default function AdminScannerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [activeQueriesCount, setActiveQueriesCount] = useState(0);
  const [lastScan, setLastScan] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [testQueryInput, setTestQueryInput] = useState("React Developer Tashkent");
  const [testLoading, setTestLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/scanner/status");
      if (res.ok) {
        const data = await res.json();
        setIsRunning(data.isRunning);
        setCurrentScanId(data.currentScanId);
        setActiveQueriesCount(data.activeQueriesCount);
        setLastScan(data.lastScan);
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Scanner status fetch error:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, isRunning ? 2000 : 5000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleStartScan = async () => {
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/scanner/start", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Не удалось запустить");
      setIsRunning(true);
      setActionMessage("Сканер запущен!");
      fetchStatus();
    } catch (err: any) {
      setActionMessage(`Ошибка: ${err.message}`);
    }
  };

  const handleStopScan = async () => {
    try {
      const res = await fetch("/api/admin/scanner/stop", { method: "POST" });
      const d = await res.json();
      setActionMessage(d.message || "Остановка...");
      fetchStatus();
    } catch (err: any) {
      setActionMessage(`Ошибка: ${err.message}`);
    }
  };

  const handleTestQuery = async () => {
    if (!testQueryInput) return;
    setTestLoading(true);
    setTestResults(null);
    try {
      const res = await fetch(`/api/jobs?q=${encodeURIComponent(testQueryInput)}&limit=5`);
      const data = await res.json();
      setTestResults(data.vacancies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Radio className={`h-7 w-7 ${isRunning ? "text-emerald-500 animate-pulse" : "text-primary"}`} />
            Управление AI Сканером вакансий
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Автономный пайплайн поиска в Google, SSRF-безопасной загрузки страниц и анализа через нейросеть
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={handleStopScan}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
            >
              <Square className="h-4 w-4" /> Остановить сканирование
            </button>
          ) : (
            <button
              onClick={handleStartScan}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
            >
              <Play className="h-4 w-4" /> Запустить сканирование
            </button>
          )}

          <button
            onClick={fetchStatus}
            title="Обновить данные"
            className="rounded-xl border bg-card p-2.5 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs font-medium text-primary">
          {actionMessage}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <span className="text-[11px] text-muted-foreground block">Статус</span>
          <span
            className={`text-sm font-black mt-0.5 inline-flex items-center gap-1 ${
              isRunning ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            }`}
          >
            {isRunning ? "РАБОТАЕТ" : "ОЖИДАНИЕ"}
          </span>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <span className="text-[11px] text-muted-foreground block">Активных запросов</span>
          <span className="text-sm font-black text-foreground mt-0.5 block">
            {activeQueriesCount}
          </span>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <span className="text-[11px] text-muted-foreground block">Принято AI</span>
          <span className="text-sm font-black text-emerald-600 mt-0.5 block">
            {lastScan?.accepted ?? 0}
          </span>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <span className="text-[11px] text-muted-foreground block">Дубликатов</span>
          <span className="text-sm font-black text-amber-600 mt-0.5 block">
            {lastScan?.duplicates ?? 0}
          </span>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <span className="text-[11px] text-muted-foreground block">Устаревших</span>
          <span className="text-sm font-black text-muted-foreground mt-0.5 block">
            {lastScan?.expired ?? 0}
          </span>
        </div>

        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <span className="text-[11px] text-muted-foreground block">Ошибок</span>
          <span className="text-sm font-black text-rose-600 mt-0.5 block">
            {lastScan?.errors ?? 0}
          </span>
        </div>
      </div>

      {/* Realtime Terminal / Log Stream */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="bg-muted px-4 py-2.5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Terminal className="h-4 w-4 text-primary" />
            <span>Журнал сканера в реальном времени (Live Stream)</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            {logs.length} сообщений
          </span>
        </div>

        <div
          ref={logContainerRef}
          className="h-80 bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-y-auto space-y-1"
        >
          {logs.length === 0 ? (
            <div className="text-slate-500 py-4 text-center">
              Журнал пуст. Нажмите «Запустить сканирование», чтобы запустить сбор вакансий.
            </div>
          ) : (
            logs.map((log) => {
              let color = "text-slate-300";
              if (log.level === "success") color = "text-emerald-400 font-semibold";
              if (log.level === "warn") color = "text-amber-400";
              if (log.level === "error") color = "text-rose-400 font-bold";

              return (
                <div key={log.id} className="leading-relaxed flex items-start gap-2">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span className={color}>{log.text}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Test Query Sandbox */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" /> Тестирование поискового запроса
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Введите запрос, например: Python Developer Tashkent"
            value={testQueryInput}
            onChange={(e) => setTestQueryInput(e.target.value)}
            className="flex-1 rounded-xl border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleTestQuery}
            disabled={testLoading}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50"
          >
            {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Тестовый поиск"}
          </button>
        </div>

        {testResults && (
          <div className="mt-4 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Результаты в текущей базе данных ({testResults.length}):
            </span>
            {testResults.length === 0 ? (
              <p className="text-xs text-muted-foreground">По данному запросу пока ничего не найдено в БД.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {testResults.map((t) => (
                  <li key={t.id} className="p-2 rounded-lg bg-muted flex items-center justify-between">
                    <span className="font-semibold text-foreground">{t.title}</span>
                    <span className="text-muted-foreground">{t.city}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
