"use client";

import { useState, useEffect } from "react";
import { Activity, Sparkles, Search, AlertTriangle, Shield, Loader2, RefreshCw } from "lucide-react";

export default function AdminLogsPage() {
  const [logType, setLogType] = useState<"all" | "ai" | "search" | "error" | "admin">("all");
  const [logsData, setLogsData] = useState<any>({ aiLogs: [], searchLogs: [], errorLogs: [], adminActions: [] });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/logs?type=${logType}`);
      const data = await res.json();
      setLogsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [logType]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary" />
            Журналы и системные логи
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Структурированный аудит вызовов Gemini, Google Search, системных ошибок и действий администратора
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="rounded-xl border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted transition flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Обновить логи
        </button>
      </div>

      {/* Log type tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {(["all", "ai", "search", "error", "admin"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setLogType(t)}
            className={`rounded-xl px-4 py-2 transition ${
              logType === t
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t === "all"
              ? "Все логи"
              : t === "ai"
              ? "Gemini AI"
              : t === "search"
              ? "Google Search"
              : t === "error"
              ? "Ошибки (Errors)"
              : "Действия админа"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Logs */}
          {(logType === "all" || logType === "ai") && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> AI Analysis Logs (Gemini)
              </h3>
              {logsData.aiLogs?.length === 0 ? (
                <p className="text-xs text-muted-foreground">Записей пока нет.</p>
              ) : (
                <div className="space-y-2">
                  {logsData.aiLogs.map((log: any) => (
                    <div key={log.id} className="rounded-xl border bg-muted/30 p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{log.model}</span>
                        <span>{new Date(log.createdAt).toLocaleString("ru-RU")}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground">Длительность: {log.durationMs}ms</span>
                        <span className="text-muted-foreground">Score: {log.qualityScore ?? "N/A"}</span>
                        <span className={`font-bold ${log.status === "SUCCESS" ? "text-emerald-600" : "text-rose-600"}`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Logs */}
          {(logType === "all" || logType === "search") && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Search className="h-4 w-4 text-cyan-600" /> Search Logs (Google Search API)
              </h3>
              {logsData.searchLogs?.length === 0 ? (
                <p className="text-xs text-muted-foreground">Записей пока нет.</p>
              ) : (
                <div className="space-y-2">
                  {logsData.searchLogs.map((log: any) => (
                    <div key={log.id} className="rounded-xl border bg-muted/30 p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">"{log.query}"</span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Найдено: {log.resultsCount}</span>
                        <span>Время: {log.durationMs}ms</span>
                        <span className={log.status === "SUCCESS" ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Logs */}
          {(logType === "all" || logType === "error") && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Error Logs
              </h3>
              {logsData.errorLogs?.length === 0 ? (
                <p className="text-xs text-emerald-600 font-medium">Ошибок в журнале не зафиксировано.</p>
              ) : (
                <div className="space-y-2">
                  {logsData.errorLogs.map((log: any) => (
                    <div key={log.id} className="rounded-xl border border-rose-500/20 bg-rose-50/20 p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-rose-700">
                        <span className="font-bold">{log.message}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      {log.stack && (
                        <pre className="mt-1 max-h-24 overflow-x-auto text-[10px] text-muted-foreground font-mono bg-background p-2 rounded">
                          {log.stack}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
