import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VacancyStatus } from "@prisma/client";
import { VacancyCard } from "@/components/jobs/VacancyCard";
import { Search, Sparkles, MapPin, Building2, TrendingUp, ShieldCheck, ArrowRight, Laptop } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "UzbJobs — Работа в Узбекистане",
  description: "Главная страница поиска работы в Узбекистане с AI-подбором. Тысячи проверенных вакансий от ведущих IT-компаний и работодателей.",
};

export default async function HomePage() {
  // Fetch real data from PostgreSQL
  let latestVacancies: any[] = [];
  let remoteVacancies: any[] = [];
  let featuredCompanies: any[] = [];
  let totalVacanciesCount = 0;
  let activeCompaniesCount = 0;

  try {
    [
      latestVacancies,
      remoteVacancies,
      featuredCompanies,
      totalVacanciesCount,
      activeCompaniesCount,
    ] = await Promise.all([
      prisma.vacancy.findMany({
        where: { status: VacancyStatus.ACTIVE },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { company: true },
      }),
      prisma.vacancy.findMany({
        where: { status: VacancyStatus.ACTIVE, isRemote: true },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { company: true },
      }),
      prisma.company.findMany({
        take: 6,
        orderBy: { vacancies: { _count: "desc" } },
        include: {
          _count: {
            select: { vacancies: { where: { status: VacancyStatus.ACTIVE } } },
          },
        },
      }),
      prisma.vacancy.count({ where: { status: VacancyStatus.ACTIVE } }),
      prisma.company.count(),
    ]);
  } catch (err) {
    console.error("Home page DB load error:", err);
  }

  const popularQueries = [
    "Frontend Developer",
    "Python Developer",
    "React",
    "DevOps",
    "Product Designer",
    "QA Engineer",
    "Data Engineer",
    "Ташкент",
    "Удаленно",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24 border-b">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-платформа умного поиска работы в Узбекистане</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            Найди работу в Узбекистане с помощью{" "}
            <span className="text-primary underline decoration-primary/30 decoration-wavy">
              AI
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
            Автоматический сбор свежих вакансий из интернета, анализ стека через Google Gemini,
            проверка качества и персональный расчет совместимости.
          </p>

          {/* Search Bar */}
          <div className="mx-auto max-w-3xl pt-4">
            <form
              action="/jobs"
              method="GET"
              className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl border bg-card p-2 shadow-lg"
            >
              <div className="flex flex-1 items-center gap-2 px-3 w-full">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Frontend Developer, Tashkent"
                  className="w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-muted-foreground py-2"
                />
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l px-3 w-full sm:w-auto py-2 sm:py-0">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <select
                  name="city"
                  className="bg-transparent text-sm outline-none text-muted-foreground pr-4 cursor-pointer"
                >
                  <option value="all">Все города</option>
                  <option value="Ташкент">Ташкент</option>
                  <option value="Самарканд">Самарканд</option>
                  <option value="Бухара">Бухара</option>
                  <option value="Фергана">Фергана</option>
                  <option value="Андижан">Андижан</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto rounded-xl bg-primary px-7 py-3 text-sm sm:text-base font-bold text-primary-foreground shadow transition hover:opacity-95 shrink-0"
              >
                Найти работу
              </button>
            </form>

            {/* Popular search tags */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Популярное:</span>
              {popularQueries.map((tag) => (
                <Link
                  key={tag}
                  href={`/jobs?q=${encodeURIComponent(tag)}`}
                  className="rounded-lg bg-secondary/80 px-2.5 py-1 transition hover:bg-primary/20 hover:text-primary font-medium"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="rounded-xl border bg-card/60 p-4 backdrop-blur">
              <div className="text-2xl font-black text-primary">{totalVacanciesCount}+</div>
              <div className="text-xs text-muted-foreground">Актуальных вакансий</div>
            </div>
            <div className="rounded-xl border bg-card/60 p-4 backdrop-blur">
              <div className="text-2xl font-black text-primary">{activeCompaniesCount}+</div>
              <div className="text-xs text-muted-foreground">Работодателей РУз</div>
            </div>
            <div className="rounded-xl border bg-card/60 p-4 backdrop-blur">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs text-muted-foreground">AI-проверка качества</div>
            </div>
            <div className="rounded-xl border bg-card/60 p-4 backdrop-blur">
              <div className="text-2xl font-black text-primary">0</div>
              <div className="text-xs text-muted-foreground">Дубликатов в каталоге</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Highlights Banner */}
      <section className="py-8 bg-muted/40 border-b">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-uzb-navy p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" /> Умные рекомендации
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Получи персональный AI Match и сопроводительное письмо
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Заполни профиль один раз — наша нейросеть моментально покажет твою совместимость с любой вакансией и сгенерирует убедительный отклик на узбекском, русском или английском.
              </p>
            </div>
            <Link
              href="/profile"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary shadow hover:bg-white/90 transition shrink-0"
            >
              Заполнить профиль →
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Vacancies Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Свежие вакансии в Узбекистане
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Проверенные предложения работы, опубликованные за последние дни
              </p>
            </div>
            <Link
              href="/jobs"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Смотреть все ({totalVacanciesCount}) <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {latestVacancies.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
              <p>Пока вакансий нет. Запустите AI Scanner в админ-панели для наполнения каталога.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {latestVacancies.map((vacancy) => (
                <VacancyCard key={vacancy.id} vacancy={vacancy} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Смотреть все вакансии →
            </Link>
          </div>
        </div>
      </section>

      {/* Remote Jobs Section */}
      {remoteVacancies.length > 0 && (
        <section className="py-12 bg-muted/20 border-t border-b">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Laptop className="h-6 w-6 text-primary" />
                  Удаленная работа (Remote)
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Вакансии с возможностью комфортной работы из дома из любой точки Узбекистана
                </p>
              </div>
              <Link
                href="/jobs?remote=true"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Все удаленные <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {remoteVacancies.map((vacancy) => (
                <VacancyCard key={vacancy.id} vacancy={vacancy} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Companies Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Ведущие работодатели Узбекистана
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                IT-компании, финтех и цифровые экосистемы, нанимающие специалистов прямо сейчас
              </p>
            </div>
            <Link
              href="/companies"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Все компании →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {featuredCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="group rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-lg">
                      {company.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition flex items-center gap-1">
                        {company.name}
                        {company.isVerified && (
                          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </h3>
                      <span className="text-xs text-muted-foreground">{company.city || "Ташкент"}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {company._count.vacancies} вакансий
                  </span>
                </div>
                {company.description && (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {company.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
