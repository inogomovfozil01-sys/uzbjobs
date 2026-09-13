import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "UzbJobs — AI-платформа поиска работы в Узбекистане",
    template: "%s | UzbJobs",
  },
  description:
    "Умный поиск актуальных вакансий в Ташкенте и по всему Узбекистану. AI-анализ совместимости резюме, генерация сопроводительных писем и агрегация предложений с помощью Google Gemini.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "UzbJobs — AI-платформа поиска работы в Узбекистане",
    description:
      "Найдите идеальную работу в Ташкенте и Узбекистане. Автоматический поиск, AI-скоринг и умный подбор вакансий.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
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
