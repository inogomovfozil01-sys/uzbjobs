import { PrismaClient, Role, VacancyStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding UzbJobs database...");

  // 1. System Settings
  await prisma.systemSetting.upsert({
    where: { key: "AUTO_APPROVE_THRESHOLD" },
    update: {},
    create: {
      key: "AUTO_APPROVE_THRESHOLD",
      value: "85",
      description: "Минимальный AI score для автоматической публикации без ручной модерации",
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "EMPLOYER_NOTIFICATION_MODE" },
    update: {},
    create: {
      key: "EMPLOYER_NOTIFICATION_MODE",
      value: "MANUAL",
      description: "Режим отправки уведомлений работодателям: OFF / MANUAL / AUTOMATIC",
    },
  });

  // 2. Admin user
  const hashedPassword = await bcrypt.hash("admin123456", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@uzbjobs.uz" },
    update: {},
    create: {
      email: "admin@uzbjobs.uz",
      name: "UzbJobs Administrator",
      password: hashedPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          headline: "Head of Operations & Moderation",
          bio: "Администратор платформы UzbJobs",
          city: "Ташкент",
          skills: ["Management", "AI Pipelines", "Node.js", "Python"],
        },
      },
    },
  });
  console.log(`👤 Admin created: ${adminUser.email} (password: admin123456)`);

  // 3. Search Queries for AI Scanner
  const queries = [
    { query: "Frontend Developer Tashkent", category: "IT / Software", location: "Ташкент", priority: 10 },
    { query: "Backend Developer Uzbekistan", category: "IT / Software", location: "Узбекистан", priority: 10 },
    { query: "Python Developer Tashkent", category: "IT / Software", location: "Ташкент", priority: 9 },
    { query: "JavaScript Developer Uzbekistan", category: "IT / Software", location: "Узбекистан", priority: 9 },
    { query: "React Developer Uzbekistan", category: "IT / Software", location: "Узбекистан", priority: 8 },
    { query: "Designer Tashkent", category: "Design", location: "Ташкент", priority: 7 },
    { query: "QA Engineer Uzbekistan", category: "IT / Software", location: "Узбекистан", priority: 7 },
    { query: "DevOps Engineer Tashkent", category: "DevOps", location: "Ташкент", priority: 8 },
    { query: "Remote job Uzbekistan", category: "Remote", location: "Удаленно", priority: 9 },
    { query: "Data Engineer Uzbekistan", category: "Data Science", location: "Узбекистан", priority: 6 },
  ];

  for (const q of queries) {
    await prisma.searchQuery.upsert({
      where: { query: q.query },
      update: {},
      create: {
        query: q.query,
        category: q.category,
        location: q.location,
        priority: q.priority,
        isActive: true,
      },
    });
  }
  console.log(`🔍 Created ${queries.length} active search queries for scanner`);

  // 4. Search Sources
  const sources = [
    { name: "HeadHunter Uzbekistan", domain: "hh.uz", trustScore: 95 },
    { name: "LinkedIn", domain: "linkedin.com", trustScore: 90 },
    { name: "Rabota.uz", domain: "rabota.uz", trustScore: 85 },
    { name: "OLX Uzbekistan", domain: "olx.uz", trustScore: 70 },
  ];

  for (const s of sources) {
    await prisma.searchSource.upsert({
      where: { domain: s.domain },
      update: {},
      create: {
        name: s.name,
        domain: s.domain,
        trustScore: s.trustScore,
        isActive: true,
      },
    });
  }

  // 5. Companies in Uzbekistan
  const uzum = await prisma.company.upsert({
    where: { slug: "uzum-technologies" },
    update: {},
    create: {
      name: "Uzum Technologies",
      slug: "uzum-technologies",
      description: "Ведущая экосистема цифровых сервисов Узбекистана: маркетплейс, финтех и банковские решения.",
      city: "Ташкент",
      website: "https://uzum.com",
      isVerified: true,
    },
  });

  const payme = await prisma.company.upsert({
    where: { slug: "payme-uz" },
    update: {},
    create: {
      name: "Payme",
      slug: "payme-uz",
      description: "Крупнейший платежный сервис Узбекистана для мгновенных онлайн-платежей и переводов.",
      city: "Ташкент",
      website: "https://payme.uz",
      isVerified: true,
    },
  });

  const epam = await prisma.company.upsert({
    where: { slug: "epam-uzbekistan" },
    update: {},
    create: {
      name: "EPAM Uzbekistan",
      slug: "epam-uzbekistan",
      description: "Глобальный поставщик услуг по разработке цифровых платформ и продуктов в Ташкенте.",
      city: "Ташкент",
      website: "https://epam.com",
      isVerified: true,
    },
  });

  const click = await prisma.company.upsert({
    where: { slug: "click-uz" },
    update: {},
    create: {
      name: "CLICK",
      slug: "click-uz",
      description: "Финтех-экосистема и платежная система с миллионами активных пользователей по всему Узбекистану.",
      city: "Ташкент",
      website: "https://click.uz",
      isVerified: true,
    },
  });

  // 6. Real Vacancies
  const sampleVacancies = [
    {
      title: "Senior Frontend Developer (React / Next.js)",
      slug: "senior-frontend-developer-react-nextjs-uzum",
      companyId: uzum.id,
      companyName: uzum.name,
      description:
        "Мы ищем опытного Senior Frontend разработчика в команду маркетплейса Uzum. Вам предстоит проектировать архитектуру клиентских приложений с миллионной аудиторией, оптимизировать Core Web Vitals и работать с современным стеком Next.js, TypeScript и GraphQL.",
      shortDescription: "Разработка высоконагруженного интерфейса Uzum Market на React и Next.js.",
      salaryMin: 2500,
      salaryMax: 4000,
      salaryCurrency: "USD",
      salaryText: "$2,500 – $4,000",
      location: "Ташкент, Мирабадский район",
      city: "Ташкент",
      employmentType: "Full-time",
      experienceLevel: "Senior",
      isRemote: false,
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL", "Redux Toolkit", "CI/CD"],
      requirements: [
        "Опыт коммерческой разработки на React от 4 лет",
        "Глубокие знания JavaScript, TypeScript и современного веб-стандарта",
        "Опыт SSR/SSG в Next.js и оптимизации производительности LCP/INP",
        "Понимание микрофронтендов и дизайн-систем",
      ],
      responsibilities: [
        "Разработка и поддержка ключевых модулей Uzum Market",
        "Проведение Code Review и менторинг Middle/Junior разработчиков",
        "Взаимодействие с UI/UX дизайнерами и Backend-командой",
      ],
      benefits: [
        "Конкурентная зарплата с привязкой к валюте",
        "ДМС со стоматологией для сотрудника и семьи",
        "Современный офис в центре Ташкента с зонами отдыха и кофе-поинтами",
        "Бюджет на обучение и участие в IT-конференциях",
      ],
      sourceUrl: "https://uzum.com/careers/senior-frontend",
      sourceNormalizedUrl: "https://uzum.com/careers/senior-frontend",
      sourceName: "Uzum Careers",
      qualityScore: 96,
      relevanceScore: 98,
      status: VacancyStatus.ACTIVE,
      isVerified: true,
      category: "IT / Software",
    },
    {
      title: "Middle / Senior Python Developer (Fintech)",
      slug: "middle-senior-python-developer-fintech-payme",
      companyId: payme.id,
      companyName: payme.name,
      description:
        "Команда Payme расширяет инженерный состав для разработки сервисов мгновенных платежей и интеграции с международными банковскими шлюзами. Основной стек: Python 3.12, FastAPI, PostgreSQL, Redis, Kafka, Docker.",
      shortDescription: "Разработка высоконагруженных бэкенд-сервисов Payme на FastAPI и PostgreSQL.",
      salaryMin: 2000,
      salaryMax: 3500,
      salaryCurrency: "USD",
      salaryText: "$2,000 – $3,500",
      location: "Ташкент, Шайхантахурский район",
      city: "Ташкент",
      employmentType: "Full-time",
      experienceLevel: "Middle",
      isRemote: true,
      skills: ["Python", "FastAPI", "PostgreSQL", "Redis", "Kafka", "Docker", "Asyncio"],
      requirements: [
        "Опыт разработки на Python от 3 лет",
        "Опыт работы с асинхронным кодом (asyncio, FastAPI / aiohttp)",
        "Уверенное знание реляционных баз данных и оптимизации сложных SQL запросов",
        "Опыт работы с очередями сообщений (Kafka или RabbitMQ)",
      ],
      responsibilities: [
        "Разработка микросервисов транзакционного процессинга",
        "Обеспечение отказоустойчивости 99.99% и защиты финансовых операций",
        "Написание модульных и интеграционных тестов",
      ],
      benefits: [
        "Гибридный или полностью удаленный формат работы по Узбекистану",
        "Официальное трудоустройство, прозрачные KPI",
        "Медицинская страховка и фитнес-компенсация",
        "Ноутбук MacBook Pro топовой конфигурации",
      ],
      sourceUrl: "https://payme.uz/careers/python-developer",
      sourceNormalizedUrl: "https://payme.uz/careers/python-developer",
      sourceName: "Payme Jobs",
      qualityScore: 94,
      relevanceScore: 95,
      status: VacancyStatus.ACTIVE,
      isVerified: true,
      category: "IT / Software",
    },
    {
      title: "DevOps Engineer (Cloud Infrastructure)",
      slug: "devops-engineer-cloud-infrastructure-epam",
      companyId: epam.id,
      companyName: epam.name,
      description:
        "EPAM Uzbekistan приглашает DevOps инженера для построения надежной облачной инфраструктуры глобальных корпоративных заказчиков. Стек: AWS, Terraform, Kubernetes, Helm, GitLab CI, Prometheus, Grafana.",
      shortDescription: "Автоматизация CI/CD и поддержка Kubernetes кластеров в EPAM.",
      salaryMin: 1800,
      salaryMax: 3200,
      salaryCurrency: "USD",
      salaryText: "$1,800 – $3,200",
      location: "Ташкент / Самарканд",
      city: "Ташкент",
      employmentType: "Full-time",
      experienceLevel: "Senior",
      isRemote: true,
      skills: ["DevOps", "AWS", "Kubernetes", "Terraform", "Docker", "GitLab CI", "Linux"],
      requirements: [
        "Опыт администрирования Linux систем от 3 лет",
        "Практический опыт работы с Kubernetes (EKS/GKE)",
        "Опыт написания Infrastructure as Code (Terraform)",
        "Английский язык на уровне B2 (разговорный)",
      ],
      responsibilities: [
        "Проектирование и масштабирование облачных сред",
        "Построение пайплайнов непрерывной доставки (CI/CD)",
        "Мониторинг, логирование и реагирование на инциденты",
      ],
      benefits: [
        "Международные проекты и релокационные программы",
        "Корпоративные курсы английского языка и сертификация AWS/GCP за счет компании",
        "Гибкий график и работа из дома",
      ],
      sourceUrl: "https://epam.com/careers/devops-tashkent",
      sourceNormalizedUrl: "https://epam.com/careers/devops-tashkent",
      sourceName: "EPAM Careers",
      qualityScore: 92,
      relevanceScore: 91,
      status: VacancyStatus.ACTIVE,
      isVerified: true,
      category: "DevOps",
    },
    {
      title: "Product Designer (UI/UX) / Ведущий дизайнер",
      slug: "product-designer-ui-ux-click",
      companyId: click.id,
      companyName: click.name,
      description:
        "CLICK ищет продуктового дизайнера с сильным визуальным вкусом и пониманием поведения пользователей в мобильных приложениях. Вы будете отвечать за дизайн новых функций супераппа CLICK, проведение исследований и развитие дизайн-системы.",
      shortDescription: "Создание интерфейсов мобильного приложения CLICK для 10+ млн пользователей.",
      salaryMin: 15000000,
      salaryMax: 28000000,
      salaryCurrency: "UZS",
      salaryText: "15 000 000 – 28 000 000 сум",
      location: "Ташкент, Юнусабадский район",
      city: "Ташкент",
      employmentType: "Full-time",
      experienceLevel: "Middle",
      isRemote: false,
      skills: ["Figma", "UI/UX", "Mobile Design", "Design Systems", "Prototyping", "User Research"],
      requirements: [
        "Портфолио реализованных мобильных приложений (iOS/Android)",
        "Уверенное владение Figma (компоненты, автолейауты, переменные)",
        "Опыт проведения интервью с пользователями и юзабилити-тестирования",
      ],
      responsibilities: [
        "Проектирование пользовательских сценариев и экранов",
        "Поддержка и развитие дизайн-системы CLICK",
        "Контроль реализации дизайна разработчиками (Design Review)",
      ],
      benefits: [
        "Официальное оформление по ТК РУз",
        "Комфортный офис у метро Шахристан",
        "Оплата профильного обучения и подписок (Figma, Mobbin)",
      ],
      sourceUrl: "https://click.uz/vacancies/product-designer",
      sourceNormalizedUrl: "https://click.uz/vacancies/product-designer",
      sourceName: "CLICK Careers",
      qualityScore: 90,
      relevanceScore: 89,
      status: VacancyStatus.ACTIVE,
      isVerified: true,
      category: "Design",
    },
  ];

  for (const v of sampleVacancies) {
    await prisma.vacancy.upsert({
      where: { slug: v.slug },
      update: {},
      create: v,
    });
  }
  console.log(`💼 Seeded ${sampleVacancies.length} verified vacancies for Uzbekistan`);

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
