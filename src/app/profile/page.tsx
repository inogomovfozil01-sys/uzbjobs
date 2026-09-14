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
  Wand2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [activeTab, setActiveTab] = useState<"profile" | "saved">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingResume, setGeneratingResume] = useState(false);
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

  const handleGenerateResumeWithAI = async () => {
    setGeneratingResume(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          skills,
          experienceYears,
          experienceLevel,
          city,
          bio,
          lang,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Не удалось сгенерировать резюме");
      }

      if (data.resumeText) {
        setResumeText(data.resumeText);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingResume(false);
    }
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
    <div className="container mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-8 pb-32 sm:pb-12 space-y-6">
      {/* Profile Header */}
      <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary font-black text-xl sm:text-2xl">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-black text-foreground truncate">
              {session?.user?.name || t("navProfile")}
            </h1>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            {headline && (
              <p className="text-xs font-semibold text-primary mt-0.5 truncate">{headline}</p>
            )}
          </div>
        </div>

        {/* Tab Toggle - Responsive Grid on Mobile */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex rounded-xl bg-muted p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 transition ${
              activeTab === "profile"
                ? "bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t("profileTabResume")}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 transition ${
              activeTab === "saved"
                ? "bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {t("profileTabSaved")} ({savedVacancies.length})
            </span>
          </button>
        </div>
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* AI Banner */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary flex items-start sm:items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
            <div className="space-y-0.5">
              <span className="font-bold block">{t("profileAiBannerTitle")}</span>
              <span className="leading-relaxed block">{t("profileAiBannerDesc")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column: Basic Information */}
            <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> {t("profileBasicInfo")}
              </h2>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {t("profileHeadline")}
                </label>
                <input
                  type="text"
                  placeholder={t("profileHeadlinePlaceholder")}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    {t("profileCurrentCity")}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  >
                    <option value="Ташкент">Ташкент (Toshkent)</option>
                    <option value="Самарканд">Самарканд (Samarqand)</option>
                    <option value="Бухара">Бухара (Buxoro)</option>
                    <option value="Фергана">Фергана (Farg'ona)</option>
                    <option value="Андижан">Андижан (Andijon)</option>
                    <option value="Наманган">Наманган (Namangan)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    {t("profileDesiredCity")}
                  </label>
                  <input
                    type="text"
                    value={desiredCity}
                    onChange={(e) => setDesiredCity(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    {t("profileExpLevel")}
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  >
                    <option value="Intern">Intern / Trainee</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid">Middle</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead / Principal</option>
                    <option value="Head">Head / Director</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    {t("profileExpYears")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {t("profileEducation")}
                </label>
                <input
                  type="text"
                  placeholder={t("profileEducationPlaceholder")}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {t("profileAbout")}
                </label>
                <textarea
                  rows={3}
                  placeholder={t("profileAboutPlaceholder")}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>
            </div>

            {/* Right Column: Preferences, Skills & AI Resume */}
            <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> {t("profileWishesSkills")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    {t("profileSalaryMin")}
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={desiredSalaryMin}
                    onChange={(e) => setDesiredSalaryMin(Number(e.target.value))}
                    className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    {t("profileSalaryCurrency")}
                  </label>
                  <select
                    value={desiredSalaryCurrency}
                    onChange={(e) => setDesiredSalaryCurrency(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="UZS">UZS (сум)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="RUB">RUB (₽)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("profileFormat")}
                </label>
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={isRemoteOnly}
                    onChange={(e) => setIsRemoteOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>{t("profileRemoteOnly")}</span>
                </label>
              </div>

              {/* Skills Tags Input */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {t("profileSkills")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("profileSkillsPlaceholder")}
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="flex-1 rounded-xl border bg-background px-3.5 py-2 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="rounded-xl bg-secondary px-3.5 py-2 text-xs font-semibold hover:bg-secondary/80 shrink-0"
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
                        className="hover:text-rose-500 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Text with AI Auto-Generator Button */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-semibold text-foreground">
                    {t("profileResumeText")}
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateResumeWithAI}
                    disabled={generatingResume}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 active:scale-95 transition disabled:opacity-50"
                  >
                    {generatingResume ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>{t("profileAiGenerating")}</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3" />
                        <span>{t("profileAiGenerateBtn")}</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={6}
                  placeholder={t("profileResumePlaceholder")}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full rounded-xl border bg-background p-3 text-sm sm:text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-500/20">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {t("profileSavedSuccess")}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:opacity-90 disabled:opacity-50 transition active:scale-98"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("profileSavingBtn")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> {t("profileSaveBtn")}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "saved" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">
            {t("savedTitle")} ({savedVacancies.length})
          </h2>

          {savedVacancies.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 sm:p-12 text-center text-xs text-muted-foreground space-y-2">
              <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="font-semibold text-foreground text-sm">{t("profileEmptySaved")}</p>
              <p>{t("profileEmptySavedDesc")}</p>
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
