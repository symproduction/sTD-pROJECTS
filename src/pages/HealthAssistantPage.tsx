import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  MessageSquareHeart,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { ApiNoticeBanner } from "../components/ApiNoticeBanner";
import { ApiClientError, sendHealthChat } from "../services/apiClient";
import type { ChatMessage, PageId } from "../types/medical";

interface HealthAssistantPageProps {
  aiConfigured: boolean | null;
  onToast: (type: "success" | "error" | "info", message: string) => void;
  onNavigate: (page: PageId) => void;
}

const SUGGESTED_QUESTIONS = [
  "What are common symptoms of flu?",
  "What is high blood pressure?",
  "How can I maintain a healthy lifestyle?",
  "What are common causes of headaches?",
];

export function HealthAssistantPage({
  aiConfigured,
  onToast,
  onNavigate,
}: HealthAssistantPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<{
    title: string;
    message: string;
    variant: "config" | "error";
  } | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (overrideText?: string) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed) {
      setValidationError("Please enter a health question before sending.");
      return;
    }
    if (trimmed.length > 2000) {
      setValidationError("Please keep your question under 2,000 characters.");
      return;
    }

    setValidationError(null);
    setApiError(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!overrideText) setInput("");
    setIsLoading(true);

    try {
      const response = await sendHealthChat(
        trimmed,
        messages.map((m) => ({ role: m.role, content: m.content }))
      );

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergency: response.isEmergency,
        emergencyGuidance: response.emergencyGuidance,
        suggestedFollowUps: response.suggestedFollowUps,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      if (err instanceof ApiClientError && (err.errorCode === "API_KEY_MISSING" || err.errorCode === "API_KEY_INVALID")) {
        setApiError({
          title: "AI Service Configuration Required",
          message: err.message,
          variant: "config",
        });
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to reach AI Health Assistant. Please try again.";
        setApiError({
          title: "Unable to Complete Request",
          message: msg,
          variant: "error",
        });
        onToast("error", msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setApiError(null);
    setValidationError(null);
    onToast("info", "Conversation cleared.");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
        <div className="space-y-2">
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Educational Guidance · Non-Diagnostic · Emergency Aware
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Health Assistant
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Ask general health and wellness questions in plain English. Conversations stay only in
            your current browser session.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={messages.length === 0 && !apiError}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Clear Conversation</span>
        </button>
      </div>

      {aiConfigured === false && (
        <div className="mt-6">
          <ApiNoticeBanner
            title="AI Service Not Configured"
            message="The server-side GEMINI_API_KEY environment variable is not set yet. Once configured on the server, real-time educational responses will appear here."
            variant="config"
          />
        </div>
      )}

      {apiError && (
        <div className="mt-6">
          <ApiNoticeBanner
            title={apiError.title}
            message={apiError.message}
            variant={apiError.variant}
          />
        </div>
      )}

      {/* Main Chat Container */}
      <div className="mt-6 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {/* Chat Feed */}
        <div className="min-h-[400px] max-h-[540px] overflow-y-auto p-5 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
                <MessageSquareHeart className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Start a Health Literacy Conversation
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-slate-600 dark:text-slate-400">
                Select one of the suggested questions below or type your own health topic to get a
                clear, educational explanation.
              </p>

              <div className="mt-6 grid w-full max-w-2xl gap-2.5 sm:grid-cols-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSend(q)}
                    className="min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-left text-sm font-medium text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50/60 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed sm:max-w-[78%] ${
                        isUser
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      }`}
                    >
                      {msg.isEmergency && msg.emergencyGuidance && (
                        <div
                          role="alert"
                          className="mb-3 rounded-xl border border-red-300 bg-red-50 p-3 text-red-950 dark:border-red-900 dark:bg-red-950/70 dark:text-red-100"
                        >
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle
                              className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-600 dark:text-red-400"
                              aria-hidden="true"
                            />
                            <div className="space-y-0.5 text-xs sm:text-sm">
                              <p className="font-display font-bold">
                                Emergency Warning — Seek Immediate Medical Help
                              </p>
                              <p>{msg.emergencyGuidance}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                        <div className="mt-3.5 border-t border-slate-200 pt-3 dark:border-slate-800">
                          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            Related follow-up questions
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {msg.suggestedFollowUps.map((followUp) => (
                              <button
                                key={followUp}
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleSend(followUp)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-600 dark:hover:text-blue-300"
                              >
                                {followUp}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="mt-1 px-1 font-mono text-[11px] text-slate-400 tabular-nums">
                      {isUser ? "You" : "MediAI"} · {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start">
                  <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    <span className="flex items-center gap-1" aria-hidden="true">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600" />
                    </span>
                    <span>Preparing educational guidance...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="health-chat-input" className="sr-only">
                Ask a health question
              </label>
              <input
                id="health-chat-input"
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Ask about symptoms, blood pressure, lifestyle, or preventive care..."
                disabled={isLoading}
                className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>{isLoading ? "Sending..." : "Send"}</span>
            </button>
          </div>
          {validationError && (
            <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
              {validationError}
            </p>
          )}
        </form>
      </div>

      {/* Safety Footer Note */}
      <div className="mt-5 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="flex items-start gap-2.5">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
            aria-hidden="true"
          />
          <span>
            Educational information only — does not diagnose conditions or prescribe treatments. If
            you experience chest pain, breathing difficulty, or sudden neurological symptoms, call
            emergency services immediately.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("disclaimer")}
          className="shrink-0 font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          Medical Disclaimer
        </button>
      </div>
    </div>
  );
}
