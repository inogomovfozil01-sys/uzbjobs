"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { VacancyCard } from "@/components/jobs/VacancyCard";
import {
  User,
  Bookmark,
  Sparkles,
  Save,
  Loader2,
  Plus,
  X,
  Briefcase,
  MapPin,
  DollarSign,
  Laptop,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "saved">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("Ташкент");
  const [desiredCity, setDesiredCity] = useState("Ташкент");
  const [experienceLevel, setExperienceLevel] = useState("Mid");
  const [experienceYears, setExperienceYears] = useState(2);
  const [education, setEducation] = useState("");
  const [desiredSalaryMin, setDesiredSalaryMin] = useState(1500);
  const [desiredSalaryCurrency, setDesiredSalaryCurrency] = useState("USD");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeText, setResumeText] = useState("");

  // Saved vacancies
  const [savedVacancies, setSavedVacancies] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/profile");
    } else if (status === "authenticated") {
      loadProfile();
    }
  }, [status]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.user) {
        const p = data.user.profile || {};
        setHeadline(p.headline || "");
        setBio(p.bio || "");
        setCity(p.city || "Ташкент");
        setDesiredCity(p.desiredCity || "Ташкент");
        setExperienceLevel(p.experienceLevel || "Mid");
        setExperienceYears(p.experienceYears ?? 2);
        setEducation(p.education || "");
        setDesiredSalaryMin(p.desiredSalaryMin ?? 1500);
        setDesiredSalaryCurrency(p.desiredSalaryCurrency || "USD");
        setEmploymentType(p.employmentType || "Full-time");
        setIsRemoteOnly(p.isRemoteOnly ?? false);
        setSkills(p.skills || ["React", "TypeScript", "Next.js", "Git"]);
        setResumeText(p.resumeText || "");

        setSavedVacancies(data.user.savedVacancies || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          bio,
          city,
          desiredCity,
          experienceLevel,
          experienceYears: Number(experienceYears),
          education,
          desiredSalaryMin: Number(desiredSalaryMin),
          desiredSalaryCurrency,
          employmentType,
          isRemoteOnly,
          skills,
          resumeText,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Не удалось сохранить");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      {/* Profile Header */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary font-black text-2xl">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              {session?.user?.name || "Ваш профиль"}
            </h1>
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            {headline && (
              <p className="text-xs font-semibold text-primary mt-0.5">{headline}</p>
            )}
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-muted p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 transition ${
              activeTab === "profile"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> Данные резюме
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 transition ${
              activeTab === "saved"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className="h-4 w-4" /> Сохранённые ({savedVacancies.length})
          </button>
        </div>
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* AI Banner */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold block">Данные используются искусственным интеллектом</span>
              <span>
                Google Gemini сопоставляет ваши навыки, желаемый оклад и опыт с каждой вакансией для расчета AI Match и генерации персонализированных Cover Letter.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic Information */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Основная информация
              </h2>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Профессиональный заголовок (должность):
                </label>
                <input
                  type="text"
                  placeholder="Например: Senior Frontend Developer / React"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Текущий город:</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Ташкент">Ташкент</option>
                    <option value="Самарканд">Самарканд</option>
                    <option value="Бухара">Бухара</option>
                    <option value="Фергана">Фергана</option>
                    <option value="Андижан">Андижан</option>
                    <option value="Наманган">Наманган</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Желаемый город:</label>
                  <input
                    type="text"
                    value={desiredCity}
                    onChange={(e) => setDesiredCity(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Уровень квалификации:</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid">Middle</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead / Expert</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Опыт работы (лет):</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Образование:</label>
                <input
                  type="text"
                  placeholder="ВУЗ, специальность, курсы"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">О себе (кратко):</label>
                <textarea
                  rows={3}
                  placeholder="Краткое описание ключевых проектов и сильных сторон..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Right Column: Preferences & Skills */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Пожелания и навыки
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Желаемая зарплата от:</label>
                  <input
                    type="number"
                    value={desiredSalaryMin}
                    onChange={(e) => setDesiredSalaryMin(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Валюта:</label>
                  <select
                    value={desiredSalaryCurrency}
                    onChange={(e) => setDesiredSalaryCurrency(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="UZS">UZS (сум)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Предпочтения по формату:
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRemoteOnly}
                    onChange={(e) => setIsRemoteOnly(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Ищу только удаленную работу (Remote)</span>
                </label>
              </div>

              {/* Skills Tags Input */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Навыки и стек технологий:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Например: Docker, Tailwind, PostgreSQL"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold hover:bg-secondary/80"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Полный текст резюме (для AI анализа):
                </label>
                <textarea
                  rows={4}
                  placeholder="Вставьте сюда текст вашего резюме, опыт работы или портфолио..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-500/20">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Профиль успешно сохранен!
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50 transition"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Сохранить изменения
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "saved" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">
            Сохранённые вакансии ({savedVacancies.length})
          </h2>

          {savedVacancies.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center text-xs text-muted-foreground space-y-2">
              <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="font-semibold text-foreground">Вы пока не сохранили ни одной вакансии</p>
              <p>Нажмите на значок закладки в карточке вакансии, чтобы отслеживать её здесь.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedVacancies.map((item) => (
                <VacancyCard
                  key={item.id}
                  vacancy={item.vacancy}
                  isSaved={true}
                  onSaveToggle={() => loadProfile()}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
