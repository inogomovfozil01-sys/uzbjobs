"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "uz" | "ru" | "en";

export interface Translations {
  navJobs: string;
  navCompanies: string;
  navSaved: string;
  navAdmin: string;
  navSignIn: string;
  navRegister: string;
  navProfile: string;
  navSettings: string;
  navLogout: string;
  continueWithGoogle: string;
  orWithEmail: string;
  loginTitle: string;
  loginSubtitle: string;
  registerTitle: string;
  registerSubtitle: string;
  nameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  passwordMin: string;
  haveAccount: string;
  noAccount: string;
  searchPlaceholder: string;
  searchBtn: string;
  filtersTitle: string;
  resetFilters: string;
  cityLabel: string;
  allCities: string;
  formatLabel: string;
  allFormats: string;
  remoteOnly: string;
  officeOnly: string;
  expLabel: string;
  allExp: string;
  salaryLabel: string;
  sortLabel: string;
  sortNewest: string;
  sortSalary: string;
  sortRelevance: string;
  applyBtn: string;
  saveBtn: string;
  savedBtn: string;
  aiMatchBtn: string;
  coverLetterBtn: string;
  reportBtn: string;
  googleCseTab: string;
  internalJobsTab: string;
  viewDetails: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroHighlight: string;
  searchCityAll: string;
  popularLabel: string;
  popularRemote: string;
  statsVacancies: string;
  statsEmployers: string;
  statsAiQuality: string;
  statsDuplicates: string;
  aiBannerBadge: string;
  aiBannerTitle: string;
  aiBannerDesc: string;
  aiBannerBtn: string;
  latestVacanciesTitle: string;
  latestVacanciesSubtitle: string;
  viewAll: string;
  noVacanciesYet: string;
  remoteVacanciesTitle: string;
  remoteVacanciesSubtitle: string;
  allRemote: string;
  featuredCompaniesTitle: string;
  featuredCompaniesSubtitle: string;
  allCompanies: string;
  vacanciesCount: string;
  remoteBadge: string;
  companyDefault: string;
  sourceLabel: string;
  saveJobTooltip: string;
  removeJobTooltip: string;
  verifiedBadge: string;
  jobsFoundCount: string;
  filtersBtn: string;
}

export const translations: Record<Language, Translations> = {
  ru: {
    navJobs: "Все вакансии",
    navCompanies: "Компании",
    navSaved: "Сохранённые",
    navAdmin: "Админ-панель",
    navSignIn: "Войти",
    navRegister: "Регистрация",
    navProfile: "Мой профиль",
    navSettings: "Настройки",
    navLogout: "Выйти",
    continueWithGoogle: "Продолжить с Google",
    orWithEmail: "или с помощью email",
    loginTitle: "Вход в аккаунт",
    loginSubtitle: "Войдите, чтобы сохранять вакансии и использовать AI Match",
    registerTitle: "Создать аккаунт",
    registerSubtitle: "Присоединяйтесь к платформе поиска работы с AI в Узбекистане",
    nameLabel: "Ваше имя:",
    emailLabel: "Электронная почта:",
    passwordLabel: "Пароль:",
    passwordMin: "Пароль (от 6 символов):",
    haveAccount: "Уже зарегистрированы? Войти",
    noAccount: "Нет аккаунта? Зарегистрироваться",
    searchPlaceholder: "Поиск по должности, стеку (React, Python...) или компании",
    searchBtn: "Найти работу",
    filtersTitle: "Фильтры поиска",
    resetFilters: "Сбросить все",
    cityLabel: "Город:",
    allCities: "Все города",
    formatLabel: "Формат работы:",
    allFormats: "Все форматы",
    remoteOnly: "Только удаленно",
    officeOnly: "В офисе",
    expLabel: "Опыт работы:",
    allExp: "Любой опыт",
    salaryLabel: "Минимальная зарплата:",
    sortLabel: "Сортировка:",
    sortNewest: "Сначала новые",
    sortSalary: "По зарплате",
    sortRelevance: "По AI соответствию",
    applyBtn: "Откликнуться",
    saveBtn: "В закладки",
    savedBtn: "Сохранено",
    aiMatchBtn: "AI Анализ соответствия",
    coverLetterBtn: "AI Сопроводительное",
    reportBtn: "Пожаловаться",
    googleCseTab: "Google Web Поиск (CSE)",
    internalJobsTab: "База вакансий UzbJobs",
    viewDetails: "Подробнее →",
    heroTitle: "Найди работу в Узбекистане с помощью",
    heroHighlight: "AI",
    heroSubtitle: "Автоматический сбор свежих вакансий из интернета, анализ стека через Google Gemini, проверка качества и персональный расчет совместимости.",
    heroBadge: "AI-платформа умного поиска работы в Узбекистане",
    searchCityAll: "Все города",
    popularLabel: "Популярное:",
    popularRemote: "Удаленно",
    statsVacancies: "Актуальных вакансий",
    statsEmployers: "Работодателей РУз",
    statsAiQuality: "AI-проверка качества",
    statsDuplicates: "Дубликатов в каталоге",
    aiBannerBadge: "Умные рекомендации",
    aiBannerTitle: "Получи персональный AI Match и сопроводительное письмо",
    aiBannerDesc: "Заполни профиль один раз — наша нейросеть моментально покажет твою совместимость с любой вакансией и сгенерирует убедительный отклик на узбекском, русском или английском.",
    aiBannerBtn: "Заполнить профиль →",
    latestVacanciesTitle: "Свежие вакансии в Узбекистане",
    latestVacanciesSubtitle: "Проверенные предложения работы, опубликованные за последние дни",
    viewAll: "Смотреть все",
    noVacanciesYet: "Пока вакансий нет. Запустите AI Scanner в админ-панели для наполнения каталога.",
    remoteVacanciesTitle: "Удаленная работа (Remote)",
    remoteVacanciesSubtitle: "Вакансии с возможностью комфортной работы из дома из любой точки Узбекистана",
    allRemote: "Все удаленные",
    featuredCompaniesTitle: "Ведущие работодатели Узбекистана",
    featuredCompaniesSubtitle: "IT-компании, финтех и цифровые экосистемы, нанимающие специалистов прямо сейчас",
    allCompanies: "Все компании →",
    vacanciesCount: "вакансий",
    remoteBadge: "Удаленно",
    companyDefault: "Компания",
    sourceLabel: "Источник",
    saveJobTooltip: "Сохранить вакансию",
    removeJobTooltip: "Удалить из сохранённых",
    verifiedBadge: "Верифицировано",
    jobsFoundCount: "Найдено {count} актуальных вакансий",
    filtersBtn: "Фильтры",
  },
  uz: {
    navJobs: "Barcha vakansiyalar",
    navCompanies: "Kompaniyalar",
    navSaved: "Saqlanganlar",
    navAdmin: "Admin paneli",
    navSignIn: "Kirish",
    navRegister: "Ro'yxatdan o'tish",
    navProfile: "Mening profilim",
    navSettings: "Sozlamalar",
    navLogout: "Chiqish",
    continueWithGoogle: "Google orqali kirish",
    orWithEmail: "yoki elektron pochta orqali",
    loginTitle: "Hisobga kirish",
    loginSubtitle: "Vakansiyalarni saqlash va AI Match xizmatidan foydalanish uchun kiring",
    registerTitle: "Hisob yaratish",
    registerSubtitle: "O'zbekistonda AI yordamida ish topish platformasiga qo'shiling",
    nameLabel: "Ismingiz:",
    emailLabel: "Elektron pochta:",
    passwordLabel: "Parol:",
    passwordMin: "Parol (kamida 6 ta belgi):",
    haveAccount: "Hisobingiz bormi? Kirish",
    noAccount: "Hisobingiz yo'qmi? Ro'yxatdan o'ting",
    searchPlaceholder: "Kasb, texnologiya (React, Python...) yoki kompaniya bo'yicha qidiruv",
    searchBtn: "Ish qidirish",
    filtersTitle: "Qidiruv filtrlari",
    resetFilters: "Barchasini tozalash",
    cityLabel: "Shahar:",
    allCities: "Barcha shaharlar",
    formatLabel: "Ish formati:",
    allFormats: "Barcha formatlar",
    remoteOnly: "Faqat masofaviy (Remote)",
    officeOnly: "Ofisda",
    expLabel: "Ish tajribasi:",
    allExp: "Ixtiyoriy tajriba",
    salaryLabel: "Minimal maosh:",
    sortLabel: "Saralash:",
    sortNewest: "Avval yangilari",
    sortSalary: "Maosh bo'yicha",
    sortRelevance: "AI mosligi bo'yicha",
    applyBtn: "Ariza topshirish",
    saveBtn: "Saqlash",
    savedBtn: "Saqlandi",
    aiMatchBtn: "AI Moslik tahlili",
    coverLetterBtn: "AI Muqova xati",
    reportBtn: "Shikoyat qilish",
    googleCseTab: "Google Web Qidiruv (CSE)",
    internalJobsTab: "UzbJobs Vakansiyalar bazasi",
    viewDetails: "Batafsil →",
    heroTitle: "O'zbekistonda orzuingizdagi ishni toping:",
    heroHighlight: "AI yordamida",
    heroSubtitle: "Internetdan yangi vakansiyalarni avtomatik to'plash, Google Gemini orqali tahlil, sifat nazorati va shaxsiy moslik hisobi.",
    heroBadge: "O'zbekistonda AI bilan aqlli ish qidirish platformasi",
    searchCityAll: "Barcha shaharlar",
    popularLabel: "Ommabop:",
    popularRemote: "Masofaviy",
    statsVacancies: "Faol vakansiyalar",
    statsEmployers: "O'zbekiston ish beruvchilari",
    statsAiQuality: "AI sifat nazorati",
    statsDuplicates: "Katalogda dublikatlar",
    aiBannerBadge: "Aqlli tavsiyalar",
    aiBannerTitle: "Shaxsiy AI Match va muqova xatini oling",
    aiBannerDesc: "Profilni bir marta to'ldiring — neyrotarmog'imiz har qanday vakansiyaga mosligingizni ko'rsatadi va o'zbek, rus yoki ingliz tillarida arizangizni yozib beradi.",
    aiBannerBtn: "Profilni to'ldirish →",
    latestVacanciesTitle: "O'zbekistondagi eng so'nggi vakansiyalar",
    latestVacanciesSubtitle: "So'nggi kunlarda e'lon qilingan tekshirilgan ish takliflari",
    viewAll: "Barchasini ko'rish",
    noVacanciesYet: "Hozircha vakansiyalar yo'q. Katalogni to'ldirish uchun admin panelida AI Scanner ni ishga tushiring.",
    remoteVacanciesTitle: "Masofaviy ish (Remote)",
    remoteVacanciesSubtitle: "O'zbekistonning istalgan nuqtasidan uydan turib ishlash imkoniyati bo'lgan vakansiyalar",
    allRemote: "Barcha masofaviy",
    featuredCompaniesTitle: "O'zbekistonning yetakchi ish beruvchilari",
    featuredCompaniesSubtitle: "Hozirda mutaxassislarni ishga olayotgan IT-kompaniyalar, fintech va raqamli ekotizimlar",
    allCompanies: "Barcha kompaniyalar →",
    vacanciesCount: "ta vakansiya",
    remoteBadge: "Masofaviy",
    companyDefault: "Kompaniya",
    sourceLabel: "Manba",
    saveJobTooltip: "Vakansiyani saqlash",
    removeJobTooltip: "Saqlanganlardan o'chirish",
    verifiedBadge: "Tasdiqlangan",
    jobsFoundCount: "{count} ta faol vakansiya topildi",
    filtersBtn: "Filtrlar",
  },
  en: {
    navJobs: "All Jobs",
    navCompanies: "Companies",
    navSaved: "Saved",
    navAdmin: "Admin Panel",
    navSignIn: "Sign In",
    navRegister: "Sign Up",
    navProfile: "My Profile",
    navSettings: "Settings",
    navLogout: "Sign Out",
    continueWithGoogle: "Continue with Google",
    orWithEmail: "or with email",
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to save jobs, track applications and use AI Match",
    registerTitle: "Create an Account",
    registerSubtitle: "Join Uzbekistan's premier AI-powered job search engine",
    nameLabel: "Your Name:",
    emailLabel: "Email Address:",
    passwordLabel: "Password:",
    passwordMin: "Password (minimum 6 characters):",
    haveAccount: "Already have an account? Sign in",
    noAccount: "Don't have an account? Sign up",
    searchPlaceholder: "Search by title, technology stack (React, Python...) or company",
    searchBtn: "Find Jobs",
    filtersTitle: "Search Filters",
    resetFilters: "Reset All",
    cityLabel: "City:",
    allCities: "All cities",
    formatLabel: "Work Format:",
    allFormats: "All formats",
    remoteOnly: "Remote only",
    officeOnly: "Office only",
    expLabel: "Experience:",
    allExp: "Any experience",
    salaryLabel: "Minimum salary:",
    sortLabel: "Sort by:",
    sortNewest: "Newest first",
    sortSalary: "Highest salary",
    sortRelevance: "AI Quality Match",
    applyBtn: "Apply Now",
    saveBtn: "Save Job",
    savedBtn: "Saved",
    aiMatchBtn: "AI Match Score",
    coverLetterBtn: "AI Cover Letter",
    reportBtn: "Report Issue",
    googleCseTab: "Google Web Search (CSE)",
    internalJobsTab: "UzbJobs Curated Database",
    viewDetails: "View Details →",
    heroTitle: "Find your dream job in Uzbekistan with",
    heroHighlight: "AI",
    heroSubtitle: "Automated job aggregation from across the web, tech stack analysis with Google Gemini, quality filtering and personalized compatibility matching.",
    heroBadge: "AI-Powered Job Search Platform in Uzbekistan",
    searchCityAll: "All cities",
    popularLabel: "Popular:",
    popularRemote: "Remote",
    statsVacancies: "Active Vacancies",
    statsEmployers: "Verified Employers",
    statsAiQuality: "AI Quality Check",
    statsDuplicates: "Catalog Duplicates",
    aiBannerBadge: "Smart Recommendations",
    aiBannerTitle: "Get your personalized AI Match and tailored cover letter",
    aiBannerDesc: "Fill out your profile once — our AI instantly calculates your compatibility score for every job and crafts compelling applications in Uzbek, Russian, or English.",
    aiBannerBtn: "Complete Profile →",
    latestVacanciesTitle: "Latest Jobs in Uzbekistan",
    latestVacanciesSubtitle: "Verified job openings published over the recent days",
    viewAll: "View All",
    noVacanciesYet: "No vacancies found yet. Run the AI Scanner in the admin panel to populate the catalog.",
    remoteVacanciesTitle: "Remote Work (Worldwide & Local)",
    remoteVacanciesSubtitle: "Opportunities with the flexibility to work from home anywhere in Uzbekistan",
    allRemote: "All Remote Jobs",
    featuredCompaniesTitle: "Top Employers in Uzbekistan",
    featuredCompaniesSubtitle: "Leading IT firms, fintechs, and digital enterprises actively hiring talent right now",
    allCompanies: "All Companies →",
    vacanciesCount: "vacancies",
    remoteBadge: "Remote",
    companyDefault: "Company",
    sourceLabel: "Source",
    saveJobTooltip: "Save Job",
    removeJobTooltip: "Remove from Saved",
    verifiedBadge: "Verified",
    jobsFoundCount: "Found {count} active vacancies",
    filtersBtn: "Filters",
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ru",
  setLang: () => {},
  t: (key) => translations.ru[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ru");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("uzbjobs_lang") as Language | null;
      if (savedLang && ["uz", "ru", "en"].includes(savedLang)) {
        setLangState(savedLang);
      }
    } catch (e) {
      // localStorage fallback
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("uzbjobs_lang", newLang);
      document.cookie = `uzbjobs_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {}
  };

  const t = (key: keyof Translations): string => {
    return translations[lang]?.[key] || translations.ru[key] || "";
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
