"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";

export default function AdminSearchQueriesPage() {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuery, setNewQuery] = useState("");
  const [newCategory, setNewCategory] = useState("IT / Software");
  const [newLocation, setNewLocation] = useState("Ташкент");
  const [newPriority, setNewPriority] = useState(1);
  const [creating, setCreating] = useState(false);

  const loadQueries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/search-queries");
      const data = await res.json();
      setQueries(data.queries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const handleAddQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/admin/search-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: newQuery.trim(),
          category: newCategory,
          location: newLocation,
          priority: Number(newPriority),
        }),
      });

      if (res.ok) {
        setNewQuery("");
        loadQueries();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await fetch("/api/admin/search-queries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      setQueries((prev) =>
        prev.map((q) => (q.id === id ? { ...q, isActive: !currentActive } : q))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/search-queries?id=${id}`, { method: "DELETE" });
      setQueries((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Search className="h-7 w-7 text-primary" />
          Поисковые запросы для AI Сканера
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Конфигурация запросов к Google Custom Search API для обнаружения свежих вакансий
        </p>
      </div>

      {/* Add New Query Form */}
      <form onSubmit={handleAddQuery} className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Добавить новый поисковый запрос
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="Например: Node.js Developer Tashkent"
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="IT / Software">IT / Software</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="DevOps">DevOps</option>
              <option value="Data Science">Data Science</option>
              <option value="Management">Management</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-1"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Добавить запрос
            </button>
          </div>
        </div>
      </form>

      {/* Queries List */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="p-3.5 font-semibold">Статус</th>
                  <th className="p-3.5 font-semibold">Поисковый запрос</th>
                  <th className="p-3.5 font-semibold">Категория</th>
                  <th className="p-3.5 font-semibold">Найдено вакансий</th>
                  <th className="p-3.5 font-semibold">Последний запуск</th>
                  <th className="p-3.5 font-semibold text-right">Управление</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {queries.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/30 transition">
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggle(q.id, q.isActive)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          q.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {q.isActive ? "АКТИВЕН" : "ОТКЛЮЧЕН"}
                      </button>
                    </td>
                    <td className="p-3.5 font-bold text-foreground">{q.query}</td>
                    <td className="p-3.5 text-muted-foreground">{q.category}</td>
                    <td className="p-3.5 font-mono">{q.totalFound}</td>
                    <td className="p-3.5 text-muted-foreground">
                      {q.lastRunAt ? new Date(q.lastRunAt).toLocaleString("ru-RU") : "Никогда"}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
