"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "uz" | "ru" | "en";

export interface Translations {
  // Navigation
  navHome: string;
  navJobs: string;
  navCompanies: string;
  navSaved: string;
  navAdmin: string;
  navSignIn: string;
  navRegister: string;
  navProfile: string;
  navSettings: string;
  navLogout: string;
  navAiChat: string;
  badgeNew: string;
  themeTitle: string;

  // Auth
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

  // Search & Filters
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

  // Hero & Stats
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

  // Profile Page
  profileTabResume: string;
  profileTabSaved: string;
  profileAiBannerTitle: string;
  profileAiBannerDesc: string;
  profileBasicInfo: string;
  profileHeadline: string;
  profileHeadlinePlaceholder: string;
  profileCurrentCity: string;
  profileDesiredCity: string;
  profileExpLevel: string;
  profileExpYears: string;
  profileEducation: string;
  profileEducationPlaceholder: string;
  profileAbout: string;
  profileAboutPlaceholder: string;
  profileWishesSkills: string;
  profileSalaryMin: string;
  profileSalaryCurrency: string;
  profileFormat: string;
  profileRemoteOnly: string;
  profileSkills: string;
  profileSkillsPlaceholder: string;
  profileResumeText: string;
  profileResumePlaceholder: string;
  profileSavedSuccess: string;
  profileSaveBtn: string;
  profileSavingBtn: string;
  profileAiGenerateBtn: string;
  profileAiGenerating: string;
  profileEmptySaved: string;
  profileEmptySavedDesc: string;

  // AI Chat & Drawer
  chatLauncher: string;
  chatConsultantTitle: string;
  chatConsultantStatus: string;
  chatPlaceholder: string;
  chatClearTooltip: string;
  chatFullscreenTooltip: string;
  chatNewDialog: string;
  chatPopularQuestions: string;
  chatCopyResponse: string;
  chatCopied: string;
  chatThinking: string;
  chatEnterHint: string;

  // Companies & Saved
  companiesTitle: string;
  companiesSubtitle: string;
  companiesViewJobs: string;
  savedTitle: string;
  savedCountText: string;
  savedEmptyTitle: string;
  savedEmptyDesc: string;
  savedSearchNew: string;
  savedBrowseCatalog: string;

  // Footer
  footerDesc: string;
  footerForSeekers: string;
  footerForCompanies: string;
  footerLocations: string;
  footerAllRights: string;
  footerJobsInTashkent: string;
  footerRemoteJobs: string;
  footerItJobs: string;
  footerEmployerCatalog: string;
  footerAdminPanel: string;
  footerMadeWith: string;
  footerForUzbekistan: string;
}

export const translations: Record<Language, Translations> = {
  ru: {
    // Navigation
    navHome: "Главная",
    navJobs: "Все вакансии",
    navCompanies: "Компании",
    navSaved: "Сохранённые",
    navAdmin: "Админ-панель",
    navSignIn: "Войти",
    navRegister: "Регистрация",
    navProfile: "Мой профиль",
    navSettings: "Настройки",
    navLogout: "Выйти",
    navAiChat: "AI Чат",
    badgeNew: "Новинка",
    themeTitle: "Тема оформления",

    // Auth
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

    // Search & Filters
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

    // Hero & Stats
    heroTitle: "Найди работу в Узбекистане с помощью",
    heroHighlight: "AI",
    heroSubtitle: "Автоматический сбор свежих вакансий из интернета, анализ стека с помощью передового ИИ, проверка качества и персональный расчет совместимости.",
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

    // Profile Page
    profileTabResume: "Данные резюме",
    profileTabSaved: "Сохранённые",
    profileAiBannerTitle: "Данные используются искусственным интеллектом",
    profileAiBannerDesc: "ИИ-ассистент сопоставляет ваши навыки, желаемый оклад и опыт с каждой вакансией для расчета AI Match и генерации персонализированных Cover Letter.",
    profileBasicInfo: "Основная информация",
    profileHeadline: "Профессиональный заголовок (должность):",
    profileHeadlinePlaceholder: "Например: Senior Frontend Developer / React",
    profileCurrentCity: "Текущий город:",
    profileDesiredCity: "Желаемый город:",
    profileExpLevel: "Уровень квалификации:",
    profileExpYears: "Опыт работы (лет):",
    profileEducation: "Образование:",
    profileEducationPlaceholder: "ВУЗ, специальность, курсы",
    profileAbout: "О себе (кратко):",
    profileAboutPlaceholder: "Расскажите о ваших ключевых сильных сторонах...",
    profileWishesSkills: "Пожелания и навыки",
    profileSalaryMin: "Желаемая зарплата от:",
    profileSalaryCurrency: "Валюта:",
    profileFormat: "Предпочтения по формату:",
    profileRemoteOnly: "Ищу только удаленную работу (Remote)",
    profileSkills: "Навыки и стек технологий:",
    profileSkillsPlaceholder: "Например: Docker, Tailwind, PostgreSQL",
    profileResumeText: "Полный текст резюме (для AI анализа):",
    profileResumePlaceholder: "Вставьте сюда текст вашего резюме, опыт работы или портфолио...",
    profileSavedSuccess: "Профиль успешно сохранен!",
    profileSaveBtn: "Сохранить изменения",
    profileSavingBtn: "Сохранение...",
    profileAiGenerateBtn: "Сгенерировать через ИИ",
    profileAiGenerating: "Генерация резюме...",
    profileEmptySaved: "Вы пока не сохранили ни одной вакансии",
    profileEmptySavedDesc: "Нажмите на значок закладки в карточке вакансии, чтобы отслеживать её здесь.",

    // AI Chat & Drawer
    chatLauncher: "Чат с ИИ",
    chatConsultantTitle: "AI Карьерный консультант",
    chatConsultantStatus: "Онлайн • Поиск работы в Узбекистане",
    chatPlaceholder: "Напишите ваш вопрос по вакансиям или карьере...",
    chatClearTooltip: "Очистить историю",
    chatFullscreenTooltip: "Открыть на весь экран",
    chatNewDialog: "Новый диалог",
    chatPopularQuestions: "Популярные вопросы",
    chatCopyResponse: "Копировать ответ",
    chatCopied: "Скопировано",
    chatThinking: "ИИ готовит ответ по рынку Узбекистана...",
    chatEnterHint: "Нажмите Enter для отправки, Shift + Enter для новой строки",

    // Companies & Saved
    companiesTitle: "Работодатели Узбекистана",
    companiesSubtitle: "Каталог компаний, активно нанимающих специалистов в Ташкенте и регионах",
    companiesViewJobs: "Смотреть вакансии компании",
    savedTitle: "Сохранённые вакансии",
    savedCountText: "У вас сохранено вакансий: {count}",
    savedEmptyTitle: "Список пуст",
    savedEmptyDesc: "Нажимайте иконку закладки на любой понравившейся вакансии в каталоге, чтобы быстро вернуться к ней позже.",
    savedSearchNew: "Искать новые вакансии",
    savedBrowseCatalog: "Перейти к каталогу вакансий →",

    // Footer
    footerDesc: "Интеллектуальная AI-платформа поиска работы и агрегации вакансий в Узбекистане.",
    footerForSeekers: "Соискателям",
    footerForCompanies: "Компаниям",
    footerLocations: "Локации",
    footerAllRights: "Все права защищены.",
    footerJobsInTashkent: "Работа в Ташкенте",
    footerRemoteJobs: "Удаленная работа",
    footerItJobs: "IT вакансии",
    footerEmployerCatalog: "Каталог работодателей",
    footerAdminPanel: "Панель администратора",
    footerMadeWith: "Сделано с",
    footerForUzbekistan: "для Узбекистана",
  },

  uz: {
    // Navigation
    navHome: "Bosh sahifa",
    navJobs: "Barcha vakansiyalar",
    navCompanies: "Kompaniyalar",
    navSaved: "Saqlanganlar",
    navAdmin: "Admin paneli",
    navSignIn: "Kirish",
    navRegister: "Ro'yxatdan o'tish",
    navProfile: "Mening profilim",
    navSettings: "Sozlamalar",
    navLogout: "Chiqish",
    navAiChat: "AI Chati",
    badgeNew: "Yangi",
    themeTitle: "Mavzu",

    // Auth
    continueWithGoogle: "Google orqali davom etish",
    orWithEmail: "yoki email orqali",
    loginTitle: "Hisobga kirish",
    loginSubtitle: "Vakansiyalarni saqlash va AI Match dan foydalanish uchun kiring",
    registerTitle: "Hisob yaratish",
    registerSubtitle: "O'zbekistondagi AI ish qidirish platformasiga qo'shiling",
    nameLabel: "Ismingiz:",
    emailLabel: "Elektron pochta:",
    passwordLabel: "Parol:",
    passwordMin: "Parol (kamida 6 ta belgi):",
    haveAccount: "Hisobingiz bormi? Kirish",
    noAccount: "Hisobingiz yo'qmi? Ro'yxatdan o'ting",

    // Search & Filters
    searchPlaceholder: "Lavozim, texnologiya (React, Python...) yoki kompaniya bo'yicha qidiruv",
    searchBtn: "Ish topish",
    filtersTitle: "Qidiruv filtrlari",
    resetFilters: "Filtrlarni tozalash",
    cityLabel: "Shahar:",
    allCities: "Barcha shaharlar",
    formatLabel: "Ish formati:",
    allFormats: "Barcha formatlar",
    remoteOnly: "Faqat masofaviy",
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
    coverLetterBtn: "AI Xat yozish",
    reportBtn: "Shikoyat qilish",
    googleCseTab: "Google Web Qidiruv (CSE)",
    internalJobsTab: "UzbJobs Vakansiyalar bazasi",
    viewDetails: "Batafsil →",

    // Hero & Stats
    heroTitle: "O'zbekistonda orzuingizdagi ishni toping:",
    heroHighlight: "AI yordamida",
    heroSubtitle: "Internetdan yangi vakansiyalarni avtomatik to'plash, zamonaviy AI orqali tahlil, sifat nazorati va shaxsiy moslik hisobi.",
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

    // Profile Page
    profileTabResume: "Rezyume ma'lumotlari",
    profileTabSaved: "Saqlanganlar",
    profileAiBannerTitle: "Ma'lumotlar sun'iy intellekt tomonidan tahlil qilinadi",
    profileAiBannerDesc: "AI-assistent sizning ko'nikmalaringiz, kerakli maosh va tajribangizni AI Match va Cover Letter hisoblash uchun ishlatadi.",
    profileBasicInfo: "Asosiy ma'lumotlar",
    profileHeadline: "Kasbiy lavozim (sarlavha):",
    profileHeadlinePlaceholder: "Masalan: Senior Frontend Developer / React",
    profileCurrentCity: "Hozirgi shahar:",
    profileDesiredCity: "Istalgan shahar:",
    profileExpLevel: "Malaka darajasi:",
    profileExpYears: "Ish tajribasi (yil):",
    profileEducation: "Ma'lumoti:",
    profileEducationPlaceholder: "OTM, mutaxassislik, kurslar",
    profileAbout: "O'zingiz haqingizda (qisqacha):",
    profileAboutPlaceholder: "Asosiy kuchli tomonlaringiz haqida yozing...",
    profileWishesSkills: "Istaklar va ko'nikmalar",
    profileSalaryMin: "Kutilayotgan maosh:",
    profileSalaryCurrency: "Valyuta:",
    profileFormat: "Ish formati:",
    profileRemoteOnly: "Faqat masofaviy ish qidiryapman (Remote)",
    profileSkills: "Ko'nikmalar va texnologiyalar:",
    profileSkillsPlaceholder: "Masalan: Docker, Tailwind, PostgreSQL",
    profileResumeText: "Rezyumening to'liq matni (AI tahlili uchun):",
    profileResumePlaceholder: "Bu yerga rezyumeingiz, ish tajribangiz yoki portfolio matnini kiriting...",
    profileSavedSuccess: "Profil muvaffaqiyatli saqlandi!",
    profileSaveBtn: "O'zgarishlarni saqlash",
    profileSavingBtn: "Saqlanmoqda...",
    profileAiGenerateBtn: "AI orqali yaratish",
    profileAiGenerating: "Rezyume yaratilmoqda...",
    profileEmptySaved: "Siz hali birorta ham vakansiyani saqlamadingiz",
    profileEmptySavedDesc: "Katalogdagi istalgan vakansiyani saqlash uchun xatcho'p belgisini bosing.",

    // AI Chat & Drawer
    chatLauncher: "AI Chati",
    chatConsultantTitle: "AI Karyera maslahatchisi",
    chatConsultantStatus: "Onlayn • O'zbekistonda ish qidirish",
    chatPlaceholder: "Vakansiyalar yoki karyera bo'yicha savolingizni yozing...",
    chatClearTooltip: "Tarixni tozalash",
    chatFullscreenTooltip: "To'liq ekranga ochish",
    chatNewDialog: "Yangi suhbat",
    chatPopularQuestions: "Ommabop savollar",
    chatCopyResponse: "Javobdan nusxa olish",
    chatCopied: "Nusxalandi",
    chatThinking: "AI O'zbekiston mehnat bozori bo'yicha javob tayyorlamoqda...",
    chatEnterHint: "Yuborish uchun Enter, yangi qator uchun Shift + Enter bosing",

    // Companies & Saved
    companiesTitle: "O'zbekiston ish beruvchilari",
    companiesSubtitle: "Toshkent va viloyatlarda mutaxassislarni ishga olayotgan kompaniyalar katalogi",
    companiesViewJobs: "Kompaniya vakansiyalarini ko'rish",
    savedTitle: "Saqlangan vakansiyalar",
    savedCountText: "Saqlangan vakansiyalar soni: {count}",
    savedEmptyTitle: "Ro'yxat bo'sh",
    savedEmptyDesc: "Katalogdagi har qanday vakansiyani saqlab qo'yish uchun xatcho'p belgisini bosing.",
    savedSearchNew: "Yangi vakansiyalarni qidirish",
    savedBrowseCatalog: "Vakansiyalar katalogiga o'tish →",

    // Footer
    footerDesc: "O'zbekistonda sun'iy intellekt asosidagi aqlli ish qidirish va vakansiyalar agregatori.",
    footerForSeekers: "Ish izlovchilarga",
    footerForCompanies: "Kompaniyalarga",
    footerLocations: "Hududlar",
    footerAllRights: "Barcha huquqlar himoyalangan.",
    footerJobsInTashkent: "Toshkentda ish",
    footerRemoteJobs: "Masofaviy ish",
    footerItJobs: "IT vakansiyalar",
    footerEmployerCatalog: "Ish beruvchilar katalogi",
    footerAdminPanel: "Admin paneli",
    footerMadeWith: "Mehr bilan yaratildi",
    footerForUzbekistan: "O'zbekiston uchun",
  },

  en: {
    // Navigation
    navHome: "Home",
    navJobs: "All Jobs",
    navCompanies: "Companies",
    navSaved: "Saved",
    navAdmin: "Admin Panel",
    navSignIn: "Sign In",
    navRegister: "Sign Up",
    navProfile: "My Profile",
    navSettings: "Settings",
    navLogout: "Sign Out",
    navAiChat: "AI Chat",
    badgeNew: "New",
    themeTitle: "Theme",

    // Auth
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

    // Search & Filters
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

    // Hero & Stats
    heroTitle: "Find your dream job in Uzbekistan with",
    heroHighlight: "AI",
    heroSubtitle: "Automated job aggregation from across the web, tech stack analysis with state-of-the-art AI, quality filtering and personalized compatibility matching.",
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

    // Profile Page
    profileTabResume: "Resume Details",
    profileTabSaved: "Saved",
    profileAiBannerTitle: "Data Processed by Artificial Intelligence",
    profileAiBannerDesc: "Our AI assistant compares your skills, salary expectations, and experience with every job to compute AI Match scores and generate tailored Cover Letters.",
    profileBasicInfo: "Basic Information",
    profileHeadline: "Professional Headline (Job Title):",
    profileHeadlinePlaceholder: "e.g. Senior Frontend Developer / React",
    profileCurrentCity: "Current City:",
    profileDesiredCity: "Desired City:",
    profileExpLevel: "Experience Level:",
    profileExpYears: "Years of Experience:",
    profileEducation: "Education:",
    profileEducationPlaceholder: "University, Major, Certifications",
    profileAbout: "About Me (Summary):",
    profileAboutPlaceholder: "Briefly outline your core strengths and expertise...",
    profileWishesSkills: "Preferences & Skills",
    profileSalaryMin: "Expected Minimum Salary:",
    profileSalaryCurrency: "Currency:",
    profileFormat: "Work Format Preferences:",
    profileRemoteOnly: "Open only to remote opportunities (Remote)",
    profileSkills: "Skills & Tech Stack:",
    profileSkillsPlaceholder: "e.g. Docker, Tailwind, PostgreSQL",
    profileResumeText: "Full Resume Text (for AI Analysis):",
    profileResumePlaceholder: "Paste your resume, employment history or project portfolio here...",
    profileSavedSuccess: "Profile saved successfully!",
    profileSaveBtn: "Save Changes",
    profileSavingBtn: "Saving...",
    profileAiGenerateBtn: "Generate with AI",
    profileAiGenerating: "Generating Resume...",
    profileEmptySaved: "You haven't saved any vacancies yet",
    profileEmptySavedDesc: "Click the bookmark icon on any vacancy card to easily track it here.",

    // AI Chat & Drawer
    chatLauncher: "AI Chat",
    chatConsultantTitle: "AI Career Consultant",
    chatConsultantStatus: "Online • Uzbekistan Job Market Expert",
    chatPlaceholder: "Ask any question about jobs, salaries or career...",
    chatClearTooltip: "Clear chat history",
    chatFullscreenTooltip: "Open full screen",
    chatNewDialog: "New Chat",
    chatPopularQuestions: "Popular Questions",
    chatCopyResponse: "Copy response",
    chatCopied: "Copied",
    chatThinking: "AI is analyzing the Uzbekistan job market...",
    chatEnterHint: "Press Enter to send, Shift + Enter for new line",

    // Companies & Saved
    companiesTitle: "Employers in Uzbekistan",
    companiesSubtitle: "Directory of tech and commercial companies actively hiring in Tashkent and regions",
    companiesViewJobs: "View Company Jobs",
    savedTitle: "Saved Vacancies",
    savedCountText: "Saved vacancies: {count}",
    savedEmptyTitle: "List is empty",
    savedEmptyDesc: "Click the bookmark icon on any vacancy to access it quickly later.",
    savedSearchNew: "Explore Vacancies",
    savedBrowseCatalog: "Browse Job Catalog →",

    // Footer
    footerDesc: "Uzbekistan's intelligent AI-powered job search and aggregation engine.",
    footerForSeekers: "Job Seekers",
    footerForCompanies: "Employers",
    footerLocations: "Locations",
    footerAllRights: "All rights reserved.",
    footerJobsInTashkent: "Jobs in Tashkent",
    footerRemoteJobs: "Remote Jobs",
    footerItJobs: "IT Jobs",
    footerEmployerCatalog: "Employer Directory",
    footerAdminPanel: "Admin Dashboard",
    footerMadeWith: "Crafted with",
    footerForUzbekistan: "for Uzbekistan",
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
