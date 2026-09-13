# UzbJobs — AI-платформа поиска работы в Узбекистане 🇺🇿

**UzbJobs** — production-ready платформа агрегации вакансий и интеллектуального поиска работы для соискателей в Узбекистане.

Система автоматически обнаруживает вакансии через Google Search API, обрабатывает страницы с помощью Google Gemini API, проводит многоуровневую дедупликацию, проверяет актуальность, рассчитывает AI Match совместимость с профилем соискателя и генерирует сопроводительные письма на узбекском, русском и английском языках.

---

## 🚀 Возможности платформы

### Для соискателей
- **Интеллектуальный поиск**: фильтрация по городам (Ташкент, Самарканд, Бухара и др.), уровню зарплаты, формату (Remote / офис), требуемому опыту и сферам.
- **AI Match (Совместимость 0-100%)**: моментальный расчет совпадения стека навыков и опыта с требованиями вакансии.
- **AI Cover Letter Generator**: создание персонализированного сопроводительного письма на узбекском (`O'zbekcha`), русском или английском языках с учетом деталей вакансии.
- **Закладки и профиль**: сохранение интересных вакансий и управление навыками.
- **Мобильная версия**: адаптивный интерфейс с нижней панелью навигации (Home, Search, Saved, Profile).

### Для работодателей и модераторов (Admin Panel)
- **AI Scanner**: автономный сбор вакансий из сети по расписанию или вручную, с выводом логов в терминал в реальном времени.
- **Многоуровневая дедупликация**: проверка нормализованных URL, хешей описания (SHA-256) и сходства названий/компаний.
- **Очередь ручной модерации (Pending Review)**: просмотр AI Quality Score, подтверждение или отклонение публикаций в 1 клик.
- **Управление поисковыми запросами**: настройка ключевых слов и приоритетов Google Search прямо из админки.
- **Диагностика интеграций (`/admin/settings/integrations`)**: кнопки «Test connection» для проверки Gemini, Google Search, PostgreSQL, Email, Auth и Cron с замером задержки (latency).
- **Система жалоб**: автоматический перевод вакансий в статус `PENDING_REVIEW` при накоплении жалоб.

### Безопасность
- **Защита от SSRF**: строгая проверка DNS и блокировка приватных подсетей (RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, loopback 127.0.0.1, AWS/GCP metadata `169.254.169.254`).
- **Защита от Prompt Injection**: изоляция спарсенного веб-контента в специальных тегах с системными инструкциями игнорирования любых команд из внешних страниц.
- **Rate Limiting**: защита от перегрузки для гостей, пользователей и админ-эндпоинтов.
- **Защита секретов**: API-ключи никогда не попадают в клиентский бандл.

---

## 🛠 Технологический стек

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Next.js Server Actions & API Routes, Zod Validation
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Google Gemini API (официальный SDK `@google/genai`)
- **Search**: Google Custom Search JSON API
- **Auth**: NextAuth.js (Credentials + Google OAuth)
- **Email**: Nodemailer (SMTP)
- **Тесты**: Vitest

---

## 📦 Быстрый старт и установка

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd uzbjobs
npm install --legacy-peer-deps
```

### 2. Настройка переменных окружения

Скопируйте пример файла конфигурации:

```bash
cp .env.example .env
```

Заполните переменные в `.env`:

```env
# База данных PostgreSQL (Neon, Supabase, Railway или локальный)
DATABASE_URL="postgresql://postgres:password@localhost:5432/uzbjobs?schema=public"

# Google Gemini API
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-2.5-flash"

# Google Programmable Search Engine
GOOGLE_SEARCH_API_KEY="AIzaSy..."
GOOGLE_SEARCH_ENGINE_ID="0123456789abcdef0"

# Аутентификация
AUTH_SECRET="super-secret-random-32-character-key"
NEXTAUTH_URL="http://localhost:3000"

# Защита фонового запуска
CRON_SECRET="your-secure-cron-secret-token"
```

### 3. Инициализация базы данных и сид

```bash
# Генерация Prisma клиента
npx prisma generate

# Применение миграций / синхронизация схемы
npx prisma db push

# Наполнение тестовыми вакансиями и учетной записью администратора
npm run prisma:seed
```

Данные администратора по умолчанию после сида:
- **Email**: `admin@uzbjobs.uz`
- **Пароль**: `admin123456`

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте в браузере: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Инструкция по получению API ключей

### 1. Google Gemini API Key
1. Перейдите на [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Нажмите **Create API key**.
3. Скопируйте полученный ключ в `GEMINI_API_KEY` в вашем `.env`.

### 2. Google Search API (Custom Search JSON API)
1. Откройте [Google Cloud Console](https://console.cloud.google.com/apis/library/customsearch.googleapis.com) и включите **Custom Search API**.
2. В разделе **Credentials** создайте API Key и укажите его в `GOOGLE_SEARCH_API_KEY`.
3. Перейдите в [Programmable Search Engine](https://programmablesearchengine.google.com/).
4. Нажмите **Add** и укажите поиск по всему интернету ("Search the entire web").
5. Скопируйте **Search engine ID (CX)** в `GOOGLE_SEARCH_ENGINE_ID`.

### 3. PostgreSQL Database
- **Neon (Рекомендуется для serverless)**: Создайте бесплатный проект на [neon.tech](https://neon.tech) и скопируйте `DATABASE_URL` (с параметром `?sslmode=require`).
- **Supabase**: Создайте проект на [supabase.com](https://supabase.com) и скопируйте строку подключения PostgreSQL.
- **Railway**: Добавьте плагин PostgreSQL в [railway.app](https://railway.app).

### 4. Настройка Google OAuth 2.0 (Вход через Google)
Для включения входа и регистрации через Google:

1. Перейдите в [Google Cloud Console -> Credentials](https://console.cloud.google.com/apis/credentials).
2. Нажмите **Create Credentials** -> **OAuth client ID**.
3. Если окно запроса согласия (OAuth consent screen) еще не настроено, выберите тип **External**, укажите название приложения (*UzbJobs*) и ваш контактный email.
4. Выберите тип приложения: **Web application** (Веб-приложение).
5. Укажите **Authorized JavaScript origins** (Разрешенные источники JavaScript):
   - Для разработки: `http://localhost:3000`
   - Для продакшна: `https://uzbjobs.vercel.app`
6. Укажите **Authorized redirect URIs** (Разрешенные URI перенаправления):
   - Для разработки: `http://localhost:3000/api/auth/callback/google`
   - Для продакшна: `https://uzbjobs.vercel.app/api/auth/callback/google`
7. Нажмите **Create**.
8. Скопируйте **Client ID** и **Client Secret** в ваш `.env` (и в Environment Variables на панели Vercel):
   ```env
   GOOGLE_CLIENT_ID="ваш-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="ваш-client-secret"
   AUTH_SECRET="произвольная-случайная-строка-из-32-символов"
   ```
9. Проверьте статус подключения на странице администратора: `/admin/settings/integrations`.

---

## ⚙️ Фоновые задачи (Cron)

Сканер вакансий и проверка устаревших объявлений могут запускаться автоматически через внешний планировщик (например, Vercel Cron, GitHub Actions или cron на сервере):

```bash
curl -X POST https://your-domain.uz/api/cron/scan \
  -H "Authorization: Bearer your-secure-cron-secret-token"
```

---

## 🧪 Запуск тестов

Проект оснащен набором автоматических тестов для проверки безопасности, SSRF, дедупликации, AI Zod валидатора и rate limiting:

```bash
npm test
```

---

## 🚢 Production Deployment

### Развертывание на Vercel
1. Загрузите код в GitHub/GitLab репозиторий.
2. Подключите репозиторий в [Vercel](https://vercel.com).
3. В настройках проекта (**Settings -> Environment Variables**) добавьте все переменные из `.env.example`.
4. Нажмите **Deploy**.

---

## 🩺 Диагностика (Health Check)

Эндпоинт `/api/health` доступен для систем мониторинга:
```json
{
  "status": "ok",
  "database": "connected",
  "gemini": "connected",
  "googleSearch": "connected",
  "auth": "configured"
}
```
*Секретные ключи не раскрываются.*
