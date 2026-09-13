"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VacancyCard, VacancyItem } from "@/components/jobs/VacancyCard";
import { AIMatchModal } from "@/components/ai/AIMatchModal";
import { Search, SlidersHorizontal, MapPin, X, Loader2, DollarSign, Laptop, RefreshCw, Globe } from "lucide-react";
import { GoogleSearchWidget } from "@/components/search/GoogleSearchWidget";

function JobsSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state initialized from URL params
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "all");
  const [remote, setRemote] = useState(searchParams.get("remote") || "all");
  const [experience, setExperience] = useState(searchParams.get("experience") || "all");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [minSalary, setMinSalary] = useState(searchParams.get("minSalary") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // Vacancies data
  const [vacancies, setVacancies] = useState<VacancyItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Mobile filters drawer toggle
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Selected vacancy for AI Match modal
  const [matchModalVacancy, setMatchModalVacancy] = useState<VacancyItem | null>(null);

  // Search mode switcher: internal database vs Google CSE
  const [searchMode, setSearchMode] = useState<"internal" | "google">("internal");

  // Sync state to URL and fetch vacancies
  const fetchJobs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city && city !== "all") params.set("city", city);
    if (remote && remote !== "all") params.set("remote", remote);
    if (experience && experience !== "all") params.set("experience", experience);
    if (type && type !== "all") params.set("type", type);
    if (category && category !== "all") params.set("category", category);
    if (minSalary) params.set("minSalary", minSalary);
    if (sort) params.set("sort", sort);
    params.set("page", page.toString());
    params.set("limit", "12");

    // Update browser URL without reloading
    router.replace(`/jobs?${params.toString()}`, { scroll: false });

    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setVacancies(data.vacancies || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [city, remote, experience, type, category, sort, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const resetFilters = () => {
    setQ("");
    setCity("all");
    setRemote("all");
    setExperience("all");
    setType("all");
    setCategory("all");
    setMinSalary("");
    setSort("newest");
    setPage(1);
    router.replace("/jobs");
  };

  const citiesList = ["Ташкент", "Самарканд", "Бухара", "Фергана", "Андижан", "Наманган"];
  const categoriesList = ["IT / Software", "Design", "Marketing", "Finance", "DevOps", "Data Science"];
  const experienceList = ["Junior", "Middle", "Senior", "Lead"];

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Search Header Bar */}
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Поиск работы в Узбекистане
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Найдено {pagination.total} актуальных вакансий
          </p>
        </div>

        {/* Search Mode Switcher */}
        <div className="flex items-center gap-2 border-b pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSearchMode("internal")}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
              searchMode === "internal"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            База вакансий UzbJobs ({pagination.total})
          </button>
          <button
            type="button"
            onClick={() => setSearchMode("google")}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
              searchMode === "google"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Google Web Поиск (CSE)
          </button>
        </div>

        {searchMode === "google" ? (
          <div className="pt-2">
            <GoogleSearchWidget />
          </div>
        ) : (
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по должности, стеку (React, Python...) или компании"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border bg-card py-2.5 pl-9 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow transition hover:opacity-90"
          >
            Найти
          </button>

          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden flex items-center justify-center gap-1.5 rounded-xl border bg-card px-4 py-2.5 text-sm font-medium"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Фильтры
          </button>
        </form>
      )}
      </div>

      {searchMode === "internal" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside
          className={`${
            filtersOpen ? "block" : "hidden"
          } lg:block lg:col-span-1 rounded-2xl border bg-card p-5 shadow-sm space-y-6 self-start`}
        >
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Фильтры поиска
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-primary hover:underline"
            >
              Сбросить все
            </button>
          </div>

          {/* City filter */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">Город:</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Все города Узбекистана</option>
              {citiesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Remote filter */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">Формат работы:</label>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="remoteFilter"
                  checked={remote === "all"}
                  onChange={() => {
                    setRemote("all");
                    setPage(1);
                  }}
                  className="text-primary"
                />
                <span>Все форматы</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="remoteFilter"
                  checked={remote === "true"}
                  onChange={() => {
                    setRemote("true");
                    setPage(1);
                  }}
                  className="text-primary"
                />
                <span className="flex items-center gap-1">
                  <Laptop className="h-3 w-3 text-primary" /> Только удаленно (Remote)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="remoteFilter"
                  checked={remote === "false"}
                  onChange={() => {
                    setRemote("false");
                    setPage(1);
                  }}
                  className="text-primary"
                />
                <span>В офисе / гибрид</span>
              </label>
            </div>
          </div>

          {/* Category filter */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">Сфера деятельности:</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Все сферы</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Experience level */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">Опыт работы:</label>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="expFilter"
                  checked={experience === "all"}
                  onChange={() => {
                    setExperience("all");
                    setPage(1);
                  }}
                  className="text-primary"
                />
                <span>Любой опыт</span>
              </label>
              {experienceList.map((exp) => (
                <label key={exp} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="expFilter"
                    checked={experience === exp}
                    onChange={() => {
                      setExperience(exp);
                      setPage(1);
                    }}
                    className="text-primary"
                  />
                  <span>{exp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Salary */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">Минимальная зарплата:</label>
            <div className="relative">
              <input
                type="number"
                placeholder="от 1 000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                onBlur={() => {
                  setPage(1);
                  fetchJobs();
                }}
                className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <main className="lg:col-span-3 space-y-4">
          {/* Sorting and Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-card p-3 text-xs">
            <span className="text-muted-foreground">
              Страница {pagination.page} из {Math.max(1, pagination.totalPages)}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Сортировка:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border bg-background px-2.5 py-1 text-xs font-medium cursor-pointer"
              >
                <option value="newest">Сначала новые</option>
                <option value="salary">По зарплате</option>
                <option value="relevance">По AI качеству</option>
              </select>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Загрузка вакансий...</p>
            </div>
          ) : vacancies.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center space-y-3">
              <p className="text-base font-semibold text-foreground">По вашему запросу ничего не найдено</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Попробуйте изменить ключевые слова, выбрать другой город или сбросить фильтры.
              </p>
              <button
                onClick={resetFilters}
                className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {vacancies.map((vacancy) => (
                <VacancyCard
                  key={vacancy.id}
                  vacancy={vacancy}
                  onOpenMatch={(v) => setMatchModalVacancy(v)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-muted"
              >
                ← Назад
              </button>
              <span className="text-xs text-muted-foreground px-2">
                {page} / {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-muted"
              >
                Вперед →
              </button>
            </div>
          )}
        </main>
      </div>
      )}

      {/* AI Match Modal if triggered */}
      {matchModalVacancy && (
        <AIMatchModal
          vacancy={matchModalVacancy}
          onClose={() => setMatchModalVacancy(null)}
        />
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <JobsSearchContent />
    </Suspense>
  );
}
