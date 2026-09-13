import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "UzbJobs — Работа в Узбекистане | AI-платформа поиска вакансий",
    template: "%s — UzbJobs",
  },
  description:
    "Умный поиск актуальных вакансий в Ташкенте и по всему Узбекистану. AI-анализ совместимости резюме, генерация сопроводительных писем и агрегация предложений с помощью Google Gemini.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://uzbjobs.vercel.app"
  ),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "UzbJobs — Работа в Узбекистане | AI-платформа поиска вакансий",
    description:
      "Найдите идеальную работу в Ташкенте и Узбекистане. Автоматический поиск, AI-скоринг и умный подбор вакансий.",
    type: "website",
    locale: "ru_RU",
    url: "https://uzbjobs.vercel.app",
    siteName: "UzbJobs",
  },
  twitter: {
    card: "summary_large_image",
    title: "UzbJobs — Работа в Узбекистане",
    description:
      "Найдите работу мечты в Узбекистане с помощью AI. Вакансии Ташкента, Самарканда и Remote.",
  },
  alternates: {
    canonical: "https://uzbjobs.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
