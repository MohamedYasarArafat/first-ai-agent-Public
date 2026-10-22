"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";

type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

type MessageMetadata = {
  usage?: Partial<TokenUsage>;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type IconName =
  | "sparkles"
  | "mic"
  | "trash"
  | "layout"
  | "chart"
  | "bag"
  | "code"
  | "shield"
  | "github"
  | "external"
  | "monitor"
  | "copy"
  | "stop"
  | "send"
  | "alert"
  | "check"
  | "refresh";

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    sparkles: (
      <>
        <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" />
        <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="3" width="6" height="12" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6" />
      </>
    ),
    layout: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 4v5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l1 12H4L5 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </>
    ),
    code: (
      <>
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4m-2-10-4 12" />
      </>
    ),
    shield: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 1 1 8 0v3" />
      </>
    ),
    github: (
      <>
        <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.2-1.5 6.2-6.7a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.2-.4-3.8 1.4a13.1 13.1 0 0 0-7 0C5.4 1.1 4.2 1.5 4.2 1.5a4.8 4.8 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7A3.4 3.4 0 0 0 8 18v4" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7-9 9" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    ),
    monitor: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="13" height="13" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </>
    ),
    stop: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="2" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    alert: (
      <>
        <path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4m0 4h.01" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.6 9A7 7 0 0 1 17 6l3 6M4 12l3 6a7 7 0 0 0 11.4-3" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const EXAMPLES = [
  {
    title: "Developer portfolio",
    description: "Showcase work with a standout layout",
    icon: "layout" as const,
    prompt:
      "Design a modern personal portfolio for a React developer with a bold hero, skills, featured projects, and a contact section. Use a clean light theme with violet accents.",
  },
  {
    title: "SaaS landing page",
    description: "Clear messaging and conversion sections",
    icon: "chart" as const,
    prompt:
      "Create a premium SaaS landing page for a productivity app. Include a navigation bar, bold headline, product mockup, benefits, testimonials, and pricing cards.",
  },
  {
    title: "Online store",
    description: "A product-first shopping experience",
    icon: "bag" as const,
    prompt:
      "Design an elegant online store for a minimal lifestyle brand. Include a product grid, category filters, product cards, a shopping bag icon, and a warm neutral color palette.",
  },
  {
    title: "Admin dashboard",
    description: "Useful data, clean structure",
    icon: "layout" as const,
    prompt:
      "Build a clean analytics dashboard for a small business with summary cards, a revenue chart, recent activity, and a responsive sidebar. Use accessible colors and clear visual hierarchy.",
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isListening, setIsListening] = useState(false);
  const [toast, setToast] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );
  const { messages, sendMessage, status, error, clearError, stop } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  const usageTotals = useMemo<TokenUsage>(() => {
    return messages.reduce<TokenUsage>(
      (total, message) => {
        if (message.role !== "assistant") return total;
        const metadata = message.metadata as MessageMetadata | undefined;
        const usage = metadata?.usage;
        if (!usage) return total;
        total.inputTokens += usage.inputTokens ?? 0;
        total.outputTokens += usage.outputTokens ?? 0;
        total.totalTokens += usage.totalTokens ?? 0;
        return total;
      },
      { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    );
  }, [messages]);

  const latestAssistantMessage = useMemo(
    () =>
      [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );
  const latestAssistantText = useMemo(() => {
    if (!latestAssistantMessage) return "";
    return latestAssistantMessage.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");
  }, [latestAssistantMessage]);

  const htmlPreview = useMemo(() => {
    const fencedHtml = latestAssistantText.match(/```html\s*([\s\S]*?)```/i);
    if (fencedHtml?.[1]) return fencedHtml[1].trim();
    if (/^\s*(<!doctype html|<html[\s>])/i.test(latestAssistantText)) {
      return latestAssistantText.trim();
    }
    return "";
  }, [latestAssistantText]);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 2800);
  }, []);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function startVoiceInput() {
    if (isListening) {
      stopVoice();
      return;
    }

    const speechWindow = window as SpeechWindow;
    const SpeechAPI =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechAPI) {
      notify(
        "Voice input is not supported here. Try Chrome on HTTPS or localhost.",
      );
      return;
    }

    const originalPrompt = prompt.trim();
    const recognition = new SpeechAPI();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => {
      setIsListening(true);
      notify("Listening… speak your website idea.");
    };
    recognition.onresult = (event) => {
      const transcript: string[] = [];
      for (let index = 0; index < event.results.length; index += 1) {
        transcript.push(event.results[index][0].transcript);
      }
      setPrompt(
        [originalPrompt, transcript.join(" ").trim()]
          .filter(Boolean)
          .join(" ")
          .slice(0, 2000),
      );
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
      notify("Voice input stopped. Check your microphone permission.");
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      notify("Could not start voice input. Please try again.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userPrompt = prompt.trim();
    if (!userPrompt || isLoading) {
      if (!userPrompt)
        notify("Describe your website first, or choose an example prompt.");
      return;
    }
    if (isListening) stopVoice();
    clearError();
    setPrompt("");
    setActiveTab("preview");
    try {
      await sendMessage({ text: userPrompt });
    } catch {
      notify("Could not send your prompt. Please try again.");
    }
  }

  async function copyOutput() {
    if (!latestAssistantText) return;
    try {
      await navigator.clipboard.writeText(latestAssistantText);
      notify("AI response copied to clipboard.");
    } catch {
      notify("Clipboard access was blocked by your browser.");
    }
  }

  const statusLabel = error
    ? "Generation failed"
    : status === "streaming"
      ? "Generating"
      : status === "submitted"
        ? "Preparing"
        : latestAssistantText
          ? "Ready"
          : "Waiting for prompt";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090909] text-white selection:bg-violet-500/30">
      <div className="pointer-events-none absolute -left-24 top-32 h-96 w-96 rounded-full bg-violet-500/[0.035] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-72 h-80 w-80 rounded-full bg-violet-500/[0.025] blur-3xl" />

      <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-white/10 bg-[#0d0d0d]/95 px-5 backdrop-blur-xl sm:px-8 lg:px-[5.2%]">
        <a
          href="#top"
          className="flex items-center gap-3"
          aria-label="Yasora AI home"
        >
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-black">
            <img
              src="/1024x1024.png"
              alt="Yasora AI"
              className="h-full w-full object-contain"
            />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight">
              Yasar<span className="text-gray-200">.ai</span>
            </span>
            <span className="block text-[9px] font-bold tracking-[0.19em] text-gray-500">
              YOUR WEBSITE CREATION AGENT
            </span>
          </span>
        </a>
        <nav className="flex items-center gap-3 text-sm font-medium text-gray-400 sm:gap-6">
          <a
            className="hidden transition hover:text-gray-200 sm:inline"
            href="#workspace"
          >
            Workspace
          </a>
          <a
            className="hidden transition hover:text-gray-200 md:inline"
            href="#how-it-works"
          >
            How it works
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-xs font-bold text-gray-200 transition hover:border-[#FF9F0A] hover:text-gray-200 sm:px-4 sm:text-sm"
            href="https://github.com/MohamedYasarArafat"
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="github" className="h-4 w-4" /> GitHub{" "}
            <Icon name="external" className="h-3 w-3" />
          </a>
        </nav>
      </header>

      <div
        id="top"
        className="relative z-10 mx-auto max-w-[1320px] px-4 pb-10 pt-9 sm:px-6 sm:pt-12 lg:px-8 lg:pt-14"
      >
        <section className="mx-auto mb-9 max-w-3xl text-center sm:mb-11">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#171717] px-3 py-2 text-[11px] font-extrabold tracking-wide text-gray-200">
            <span className="h-2 w-2 rounded-full bg-[#FF9F0A] shadow-[0_0_0_4px_rgba(255,159,10,0.12)]" />{" "}
            AI-POWERED WEBSITE WORKSPACE
          </div>
          <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-[-0.055em] text-white sm:text-5xl lg:text-[58px]">
            From idea to{" "}
            <span className="bg-gradient-to-r bg-[#FF9F0A] bg-clip-text text-transparent">
              website.
            </span>
            <br />
            Just describe it.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Turn your ideas into website concepts with AI. Describe what you
            imagine, refine the details, and bring your next project to life.
          </p>
        </section>

        <section
          id="workspace"
          className="grid items-stretch gap-5 xl:grid-cols-2"
        >
          <section className="min-w-0 overflow-hidden rounded-[22px] border border-white/10 bg-[#111111] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <h2 className="flex items-center gap-3 text-sm font-extrabold">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#1b1b1b] text-gray-200">
                  <Icon name="sparkles" />
                </span>
                Describe your website
              </h2>
              <span className="text-[10px] font-bold tracking-wider text-gray-500">
                STEP 01 / 02
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-gray-200">
                  <label htmlFor="website-prompt">Your prompt</label>
                  <span className="font-medium tabular-nums text-gray-500">
                    {prompt.length} / 2000
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#141414] p-3 transition focus-within:border-[#FF9F0A] focus-within:bg-[#111111] focus-within:ring-4 focus-within:ring-violet-100/70">
                  <textarea
                    id="website-prompt"
                    value={prompt}
                    onChange={(event) =>
                      setPrompt(event.target.value.slice(0, 2000))
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        (event.metaKey || event.ctrlKey)
                      ) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    maxLength={2000}
                    rows={6}
                    placeholder="A clean, modern portfolio website for a creative developer. Use a warm neutral palette, bold typography, and a project gallery…"
                    className="min-h-[145px] w-full resize-y bg-transparent px-1 py-1 text-sm leading-6 text-gray-100 outline-none placeholder:text-gray-500"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={startVoiceInput}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${isListening ? "border-[#FF9F0A] bg-[#1a1a1a] text-gray-200" : "border-white/10 bg-[#151515] text-gray-300 hover:border-[#FF9F0A] hover:text-gray-200"}`}
                        aria-pressed={isListening}
                      >
                        <Icon name="mic" />{" "}
                        {isListening ? "Stop recording" : "Voice input"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrompt("")}
                        title="Clear prompt"
                        aria-label="Clear prompt"
                        className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-[#111111] text-gray-400 transition hover:border-[#FF9F0A] hover:text-gray-200"
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                    {isLoading ? (
                      <button
                        type="button"
                        onClick={stop}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#242424] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#FF9F0A]"
                      >
                        <Icon name="stop" /> Stop generation
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!prompt.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#242424] px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#FF9F0A] hover:shadow-[#FF9F0A]/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        <Icon name="sparkles" /> Generate website
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-gray-500">
                  Tip: press Ctrl + Enter (or ⌘ + Enter on Mac) to generate.
                </p>
              </form>

              {error && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-xl border border-white/15 bg-[#141414] p-3 text-xs text-gray-200"
                >
                  <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      We couldn&apos;t finish that request.
                    </p>
                    <p className="mt-1 break-words">
                      {error.message || "Please try again."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearError}
                    className="font-bold underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="mb-3 mt-7 text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-500">
                Need a little inspiration?
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {EXAMPLES.map((example) => (
                  <button
                    type="button"
                    key={example.title}
                    onClick={() => setPrompt(example.prompt)}
                    className="group flex min-w-0 items-start gap-3 rounded-2xl border border-white/10 bg-[#111111] p-3 text-left transition hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-md hover:shadow-black/5"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#1b1b1b] text-gray-200 transition group-hover:bg-violet-700">
                      <Icon name={example.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-extrabold text-gray-100">
                        {example.title}
                      </span>
                      <span className="mt-1 block text-[11px] leading-4 text-gray-400">
                        {example.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 text-[10px] leading-5 text-gray-500">
                <Icon name="shield" className="h-4 w-4 shrink-0" /> Never
                include passwords, API keys, or other secrets in your prompt.
              </div>
            </div>
          </section>

          <section className="flex h-[calc(100vh-110px)] min-h-0 min-w-0 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#111111] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
              <h2 className="flex items-center gap-3 text-sm font-extrabold">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#1b1b1b] text-gray-200">
                  <Icon name="monitor" />
                </span>
                Your creation
              </h2>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isLoading ? "animate-pulse bg-[#FF9F0A]" : error ? "bg-[#141414]0" : "bg-[#141414]0"}`}
                  />
                  {statusLabel}
                </span>
                <div className="flex rounded-xl bg-[#1b1b1b] p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${activeTab === "preview" ? "bg-[#111111] text-gray-100 shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("code")}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${activeTab === "code" ? "bg-[#111111] text-gray-100 shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Response
                  </button>
                </div>
              </div>
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
              {!latestAssistantText && !isLoading ? (
                <div className="flex min-h-[390px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#111111] px-6 py-10 text-center">
                  <div className="relative mb-6 h-28 w-32">
                    <div className="absolute left-2 top-5 h-20 w-20 -rotate-6 rounded-xl border border-white/10 bg-[#111111] p-3 shadow-lg shadow-violet-900/5">
                      <div className="mb-3 flex gap-1">
                        <i className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                        <i className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                        <i className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                      </div>
                      <div className="mb-2 h-1.5 w-10 rounded bg-gray-200" />
                      <div className="mb-2 h-1.5 w-12 rounded bg-[#1b1b1b]" />
                      <div className="h-1.5 w-8 rounded bg-[#1b1b1b]" />
                    </div>
                    <div className="absolute right-1 top-1 h-24 w-20 rotate-6 rounded-xl border border-white/10 bg-[#111111] p-3 shadow-xl shadow-violet-900/10">
                      <div className="mb-3 flex gap-1">
                        <i className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                        <i className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                        <i className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                      </div>
                      <div className="mb-2 h-1.5 w-10 rounded bg-gray-300" />
                      <div className="mb-2 h-1.5 w-12 rounded bg-[#1b1b1b]" />
                      <div className="mb-2 h-1.5 w-8 rounded bg-[#1b1b1b]" />
                      <div className="h-1.5 w-10 rounded bg-[#1b1b1b]" />
                    </div>
                    <span className="absolute -right-1 top-0 text-2xl text-gray-200">
                      ✳
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold tracking-tight text-gray-100">
                    Your next idea starts here
                  </h3>
                  <p className="mt-2 max-w-xs text-xs leading-6 text-gray-400">
                    Write a prompt or choose an example. Your AI response will
                    appear in this panel.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-lg border border-white/10 bg-[#111111] px-2.5 py-1.5 text-[10px] text-gray-400">
                      ✦ Layout ideas
                    </span>
                    <span className="rounded-lg border border-white/10 bg-[#111111] px-2.5 py-1.5 text-[10px] text-gray-400">
                      ⌘ Code output
                    </span>
                    <span className="rounded-lg border border-white/10 bg-[#111111] px-2.5 py-1.5 text-[10px] text-gray-400">
                      ↗ Responsive design
                    </span>
                  </div>
                </div>
              ) : isLoading && !latestAssistantText ? (
                <div className="flex min-h-[390px] flex-col items-center justify-center rounded-2xl bg-[#141414] px-6 text-center">
                  <span className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-[#FF9F0A]" />
                  <h3 className="text-sm font-extrabold text-gray-100">
                    Creating your response…
                  </h3>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-gray-400">
                    Your prompt has been sent to the AI model. New content will
                    stream here.
                  </p>
                </div>
              ) : activeTab === "preview" ? (
                htmlPreview ? (
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111111]">
                    <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#141414] px-3 py-2.5">
                      <i className="h-2 w-2 rounded-full bg-gray-400" />
                      <i className="h-2 w-2 rounded-full bg-gray-300" />
                      <i className="h-2 w-2 rounded-full bg-gray-400" />
                      <span className="ml-2 flex-1 rounded-md border border-white/10 bg-[#111111] px-3 py-1 text-center text-[10px] text-gray-500">
                        AI-generated website preview
                      </span>
                    </div>
                    <iframe
                      title="AI-generated website preview"
                      sandbox=""
                      srcDoc={htmlPreview}
                      className="h-[480px] w-full bg-[#111111]"
                    />
                  </div>
                ) : (
                  <div className="min-h-[390px] rounded-xl border border-white/10 bg-[#111111] p-5 sm:p-6">
                    <div className="mb-4 flex items-center gap-2 text-xs font-bold text-gray-400">
                      <Icon name="sparkles" className="h-4 w-4 text-gray-200" />{" "}
                      Latest AI response
                    </div>
                    <div className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-200">
                      {latestAssistantText ||
                        "The model is preparing a response…"}
                    </div>
                    {!htmlPreview && latestAssistantText && (
                      <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-5 text-gray-500">
                        To show a live website here, have the API return a
                        complete HTML document or an HTML code block. Use the
                        Response tab to inspect the full output.
                      </p>
                    )}
                  </div>
                )
              ) : (
                <pre className="min-h-[390px] max-h-[580px] overflow-auto rounded-xl bg-[#242424] p-5 text-xs leading-6 text-gray-200">
                  <code>
                    {latestAssistantText ||
                      "The model is preparing a response…"}
                  </code>
                </pre>
              )}

              {latestAssistantText && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] leading-5 text-gray-500">
                    AI-generated output. Review generated code before using it
                    in production.
                  </p>
                  <button
                    type="button"
                    onClick={copyOutput}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-[11px] font-bold text-gray-300 transition hover:border-[#FF9F0A] hover:text-gray-200"
                  >
                    <Icon name="copy" className="h-3.5 w-3.5" /> Copy response
                  </button>
                </div>
              )}

              {isLoading && latestAssistantText && (
                <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-gray-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF9F0A]" />{" "}
                  Streaming response…
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-px border-t border-white/10 bg-[#1b1b1b]">
              <div className="bg-[#111111] px-3 py-3 text-center sm:px-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 sm:text-[10px]">
                  Input tokens
                </p>
                <p className="mt-1 text-sm font-extrabold tabular-nums text-gray-200">
                  {formatNumber(usageTotals.inputTokens)}
                </p>
              </div>
              <div className="bg-[#111111] px-3 py-3 text-center sm:px-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 sm:text-[10px]">
                  Output tokens
                </p>
                <p className="mt-1 text-sm font-extrabold tabular-nums text-gray-200">
                  {formatNumber(usageTotals.outputTokens)}
                </p>
              </div>
              <div className="bg-[#111111] px-3 py-3 text-center sm:px-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 sm:text-[10px]">
                  Session total
                </p>
                <p className="mt-1 text-sm font-extrabold tabular-nums text-gray-200">
                  {formatNumber(usageTotals.totalTokens)}
                </p>
              </div>
            </div>
          </section>
        </section>

        <footer
          id="how-it-works"
          className="mt-6 flex flex-col gap-3 text-[11px] text-gray-500 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            Designed & built as an AI agent experiment by{" "}
            <strong className="font-bold text-gray-300">
              Mohamed Yasar Arafat
            </strong>
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              className="transition hover:text-gray-200"
              href="https://mohamedyasararafat.github.io/yasar---Portfolio/"
              target="_blank"
              rel="noreferrer"
            >
              Portfolio ↗
            </a>
            <a
              className="transition hover:text-gray-200"
              href="https://www.linkedin.com/in/mohamed-yasar-arafat-64b4b0293/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
            <span>Next.js · AI SDK · Gemini</span>
          </div>
        </footer>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-slate-700 bg-[#252525] px-4 py-3 text-center text-xs font-medium text-white shadow-2xl"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
