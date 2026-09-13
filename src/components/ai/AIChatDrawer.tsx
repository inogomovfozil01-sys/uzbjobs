"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Trash2,
  Maximize2,
  Bot,
  User,
  Copy,
  Check,
  Briefcase,
  TrendingUp,
  FileText,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Привет! 👋 Я ваш персональный **ИИ-консультант по карьере UzbJobs**.\n\nЯ могу помочь вам:\n- Подобрать актуальные вакансии в Ташкенте, Самарканде или удаленно\n- Составить или усилить резюме и сопроводительное письмо\n- Узнать реальные зарплатные вилки по вашей специальности\n- Подготовиться к техническому или HR собеседованию\n\nО чем хотите спросить?",
    createdAt: new Date(),
  },
];

const PROMPT_SUGGESTIONS = [
  "💼 Подбери вакансии с окладом от $2000",
  "💰 Сколько платят Middle/Senior в Ташкенте?",
  "📝 Помоги улучшить резюме разработчика",
  "🎯 Как пройти собеседование в Uzum или Payme?",
  "🇺🇿 IT sohasida qanday ish topsa bo'ladi?",
];

export function AIChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      textareaRef.current?.focus();
    }
  }, [isOpen, messages, loading]);

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
        .filter((m) => m.id !== "welcome")
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

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to format basic markdown (links, bold, lists) safely
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
            onClick={() => setIsOpen(false)}
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

      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <li key={idx} className="ml-4 list-disc my-0.5">
            {processedParts}
          </li>
        );
      }

      return (
        <p key={idx} className={line.trim() === "" ? "h-2" : "my-1 leading-relaxed"}>
          {processedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Открыть AI-чат по карьере"
          title="Чат с ИИ-консультантом UzbJobs"
          className="group relative flex items-center gap-2 rounded-full bg-primary p-3.5 text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-primary/30"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <div className="relative">
                <Bot className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <span className="hidden sm:inline text-xs font-bold tracking-tight pr-1">
                Чат с ИИ
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-20 md:bottom-20 md:right-6 md:left-auto z-50 flex flex-col w-auto md:w-[420px] h-[580px] max-h-[82vh] rounded-2xl border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-card-foreground">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground leading-none">
                  UzbJobs AI
                </h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Карьерный консультант онлайн
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/chat"
                onClick={() => setIsOpen(false)}
                title="Открыть на весь экран"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <Maximize2 className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={clearChat}
                title="Очистить историю чата"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Закрыть чат"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted/60 text-foreground border rounded-tl-sm"
                    }`}
                  >
                    <div>{renderFormattedText(m.content)}</div>

                    {!isUser && m.id !== "welcome" && (
                      <button
                        onClick={() => copyToClipboard(m.content, m.id)}
                        title="Скопировать ответ"
                        className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span>Скопировано</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Копировать</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted/60 border px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>ИИ готовит ответ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          {messages.length <= 2 && !loading && (
            <div className="px-4 pb-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5">
                Быстрые вопросы:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(chip)}
                    className="rounded-lg border bg-background/80 hover:bg-primary/10 hover:border-primary/40 px-2.5 py-1 text-[11px] text-foreground transition text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="border-t bg-card p-3">
            <div className="flex items-end gap-2 rounded-xl border bg-background p-1.5 focus-within:ring-2 focus-within:ring-primary/40 transition">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Задайте вопрос о карьере или вакансиях..."
                className="w-full resize-none bg-transparent px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none max-h-24"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>Enter для отправки • Shift+Enter новая строка</span>
              <span className="font-medium text-primary">UzbJobs AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
