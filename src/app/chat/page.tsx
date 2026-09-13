"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  Bot,
  User,
  Copy,
  Check,
  Briefcase,
  TrendingUp,
  Building2,
  HelpCircle,
  FileCheck,
  Compass,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-full",
    role: "assistant",
    content:
      "Ассалому алейкум! Здравствуйте! 👋 Я ваш персональный **ИИ-консультант по карьере платформы UzbJobs**.\n\nЯ знаю всё о рынке труда в Узбекистане, ведущих работодателях (Uzum, Payme, CLICK, EPAM, TBC Bank, Yandex и др.), реальных зарплатах и требованиях к кандидатам.\n\n### Чем я могу вам помочь сегодня?\n1. **Подобрать вакансии** по вашему стеку (Frontend, Python, DevOps, Flutter, QA, Design и др.)\n2. **Узнать рыночные зарплаты** в Ташкенте, Самарканде и на удаленке\n3. **Оценить или составить резюме** под конкретную вакансию\n4. **Подготовиться к собеседованию** (типичные вопросы, тестовые задания)\n\nНапишите ваш вопрос или выберите одну из подсказок слева!",
    createdAt: new Date(),
  },
];

const CATEGORY_QUESTIONS = [
  {
    title: "🔍 Поиск работы",
    questions: [
      "Какие сейчас самые высокооплачиваемые IT-вакансии в Ташкенте?",
      "Найди предложения работы для Middle Python разработчика",
      "Есть ли открытые вакансии с возможностью удаленной работы?",
      "Какие вакансии открыты для Junior специалистов?",
    ],
  },
  {
    title: "💰 Зарплаты и рынок",
    questions: [
      "Сколько зарабатывает Senior Frontend разработчик в Узбекистане?",
      "Какая средняя зарплата у DevOps инженера в Ташкенте?",
      "Стоит ли просить зарплату в долларах США или в сумах?",
    ],
  },
  {
    title: "📝 Резюме и собеседования",
    questions: [
      "Помоги составить убедительное саммари для резюме",
      "Какие вопросы чаще всего задают на собеседовании в банки и финтех?",
      "Как правильно отвечать на вопрос о желаемой зарплате?",
    ],
  },
  {
    title: "🏢 Компании Узбекистана",
    questions: [
      "Какие условия работы и бенефиты предлагают в Uzum и Payme?",
      "Как устроиться в международную компанию вроде EPAM или Exadel?",
      "В чем преимущества работы в IT Park Узбекистан?",
    ],
  },
];

function ChatPageContent() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const payload = newHistory
        .filter((m) => m.id !== "welcome-full")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Не удалось получить ответ");
      }

      const assistantMsg: Message = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: `⚠️ ${err.message || "Произошла ошибка при обращении к ИИ. Попробуйте еще раз."}`,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Check for link pattern: [Text](URL)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        const text = match[1];
        const href = match[2];
        parts.push(
          <Link
            key={match.index}
            href={href}
            className="text-primary font-semibold underline underline-offset-2 hover:opacity-80 transition"
          >
            {text}
          </Link>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      // Check bold syntax inside string parts
      const processedParts = parts.map((part, pIdx) => {
        if (typeof part === "string") {
          const boldRegex = /\*\*([^*]+)\*\*/g;
          const boldParts = [];
          let bLastIndex = 0;
          let bMatch;
          while ((bMatch = boldRegex.exec(part)) !== null) {
            if (bMatch.index > bLastIndex) {
              boldParts.push(part.substring(bLastIndex, bMatch.index));
            }
            boldParts.push(<strong key={bMatch.index}>{bMatch[1]}</strong>);
            bLastIndex = bMatch.index + bMatch[0].length;
          }
          if (bLastIndex < part.length) {
            boldParts.push(part.substring(bLastIndex));
          }
          return <React.Fragment key={pIdx}>{boldParts}</React.Fragment>;
        }
        return part;
      });

      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold mt-2.5 mb-1 text-foreground">
            {line.replace("### ", "")}
          </h4>
        );
      }

      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <li key={idx} className="ml-4 list-disc my-1">
            {processedParts}
          </li>
        );
      }

      return (
        <p key={idx} className={line.trim() === "" ? "h-2" : "my-1.5 leading-relaxed"}>
          {processedParts}
        </p>
      );
    });
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Карьерный консультант</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Интеллектуальный чат UzbJobs
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Задавайте любые вопросы о вакансиях, зарплатах, резюме и компаниях в Узбекистане
          </p>
        </div>

        <button
          onClick={() => setMessages(INITIAL_MESSAGES)}
          className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition self-start sm:self-auto"
        >
          <Trash2 className="h-4 w-4" />
          Новый диалог
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Topic Suggestions */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-primary" /> Популярные вопросы
            </h3>

            <div className="space-y-4 text-xs">
              {CATEGORY_QUESTIONS.map((cat, cIdx) => (
                <div key={cIdx} className="space-y-1.5">
                  <span className="font-semibold text-muted-foreground block text-[11px]">
                    {cat.title}
                  </span>
                  <div className="space-y-1">
                    {cat.questions.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSend(q)}
                        className="w-full text-left p-2 rounded-lg bg-background hover:bg-primary/10 hover:text-primary transition text-[11px] leading-snug border border-transparent hover:border-primary/20"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Chat Interface */}
        <main className="lg:col-span-3 flex flex-col h-[75vh] max-h-[750px] rounded-2xl border bg-card shadow-sm overflow-hidden text-card-foreground">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm mt-0.5">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted/40 text-foreground border rounded-tl-sm"
                    }`}
                  >
                    <div>{renderFormattedText(m.content)}</div>

                    {!isUser && m.id !== "welcome-full" && (
                      <div className="mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>UzbJobs AI Assistant</span>
                        <button
                          onClick={() => copyToClipboard(m.content, m.id)}
                          className="flex items-center gap-1 hover:text-foreground transition"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Скопировано</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Копировать ответ</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground mt-0.5">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted/40 border px-5 py-3.5 flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>ИИ готовит ответ по рынку Узбекистана...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts on Mobile */}
          <div className="lg:hidden px-4 py-2 border-t bg-muted/20 overflow-x-auto flex gap-2 no-scrollbar">
            {CATEGORY_QUESTIONS[0].questions.slice(0, 3).map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap rounded-lg border bg-card px-3 py-1 text-[11px] text-foreground hover:bg-muted transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="border-t bg-card p-3 sm:p-4">
            <div className="flex items-end gap-2 rounded-2xl border bg-background p-2 focus-within:ring-2 focus-within:ring-primary/40 transition">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Задайте вопрос: например, 'Подбери вакансии для React разработчика' или 'Как подготовиться к интервью в Uzum'..."
                className="w-full resize-none bg-transparent px-2 py-1 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span>Нажмите Enter для отправки, Shift + Enter для новой строки</span>
              <span className="font-semibold text-primary">UzbJobs AI</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
