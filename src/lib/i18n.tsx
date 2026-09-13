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
    searchBtn: "Найти",
    filtersTitle: "Фильтры поиска",
    resetFilters: "Сбросить все",
    cityLabel: "Город:",
    allCities: "Все города Узбекистана",
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
    viewDetails: "Подробнее",
    heroTitle: "Найдите работу мечты в Узбекистане с помощью AI",
    heroSubtitle: "Тысячи проверенных вакансий от ведущих IT-компаний Ташкента, Самарканда и удаленно",
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
    searchBtn: "Qidirish",
    filtersTitle: "Qidiruv filtrlari",
    resetFilters: "Barchasini tozalash",
    cityLabel: "Shahar:",
    allCities: "O'zbekistonning barcha shaharlari",
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
    coverLetterBtn: "AI Kuzatuv xati",
    reportBtn: "Shikoyat qilish",
    googleCseTab: "Google Web Qidiruv (CSE)",
    internalJobsTab: "UzbJobs vakansiyalar bazasi",
    viewDetails: "Batafsil",
    heroTitle: "O'zbekistonda AI orqali orzuingizdagi ishni toping",
    heroSubtitle: "Toshkent, Samarqand va masofaviy yetakchi IT-kompaniyalardan minglab tasdiqlangan ishlar",
  },
  en: {
    navJobs: "All Jobs",
    navCompanies: "Companies",
    navSaved: "Saved Jobs",
    navAdmin: "Admin Panel",
    navSignIn: "Sign In",
    navRegister: "Sign Up",
    navProfile: "My Profile",
    navSettings: "Settings",
    navLogout: "Log Out",
    continueWithGoogle: "Continue with Google",
    orWithEmail: "or with email",
    loginTitle: "Sign in to account",
    loginSubtitle: "Sign in to bookmark jobs and use AI Match",
    registerTitle: "Create an account",
    registerSubtitle: "Join Uzbekistan's AI-powered job search platform",
    nameLabel: "Your Name:",
    emailLabel: "Email address:",
    passwordLabel: "Password:",
    passwordMin: "Password (min 6 chars):",
    haveAccount: "Already registered? Sign In",
    noAccount: "Don't have an account? Sign Up",
    searchPlaceholder: "Search by title, skills (React, Python...) or company",
    searchBtn: "Search",
    filtersTitle: "Search Filters",
    resetFilters: "Reset all",
    cityLabel: "City:",
    allCities: "All cities in Uzbekistan",
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
    viewDetails: "View Details",
    heroTitle: "Find your dream job in Uzbekistan powered by AI",
    heroSubtitle: "Thousands of verified tech & business jobs across Tashkent, Samarkand and remote",
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
