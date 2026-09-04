import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare, Send, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ModuleHeader } from "@/components/app-shell";
import { DisclaimerBanner, PrivacyNote } from "@/components/responsible-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/app-state";
import { callOpenAI, generateChatReply, simulateLatency } from "@/lib/mock-ai";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Assistant Chat — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Chat with a specialized workplace executive assistant for productivity, planning and communication help.",
      },
      { property: "og:title", content: "AI Assistant Chat — AI Workplace Assistant" },
      {
        property: "og:description",
        content: "A workplace executive assistant for planning, comms and prioritization.",
      },
    ],
  }),
  component: ChatPage,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Draft a project delay apology",
  "Summarize key risks of cloud migration",
  "Help me prioritize an overloaded week",
  "How should I structure meeting minutes?",
];

const greeting: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I'm your workplace productivity assistant. Ask me about emails, meetings, prioritization or research, or pick a suggested prompt below.",
};

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
      return (
        <em key={i} className="italic">
          {p.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function MessageBody({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-1.5 text-sm leading-relaxed">
      {content.split("\n").map((line, i) =>
        line.trim() === "" ? (
          <span key={i} className="h-1" />
        ) : (
          <p key={i} className={line.startsWith("•") || /^\d\./.test(line) ? "pl-1" : ""}>
            {renderInline(line)}
          </p>
        ),
      )}
    </div>
  );
}

function ChatPage() {
  const { apiKey, hasKey } = useAppState();
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  async function send(raw: string) {
    const content = raw.trim();
    if (!content || typing) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content };
    const history = messages.filter((m) => m.id !== "welcome").length;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      let reply: string;
      if (hasKey) {
        reply = await callOpenAI(
          apiKey,
          "You are a specialized workplace executive assistant. Give concise, structured, actionable guidance on workplace productivity topics.",
          content,
        );
      } else {
        await simulateLatency(900);
        reply = generateChatReply(content, history);
      }
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat request failed");
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      <ModuleHeader
        icon={MessagesSquare}
        title="Interactive AI Assistant"
        description="A specialized workplace executive assistant for everyday productivity questions."
      />

      <div className="flex flex-col gap-4">
        <section className="flex h-[34rem] flex-col rounded-2xl border border-border bg-card shadow-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <div>
              <p className="text-sm font-semibold text-card-foreground">Assistant</p>
              <p className="text-[11px] text-muted-foreground">
                {hasKey ? "Live mode" : "Demo mode — realistic local responses"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMessages([greeting]);
                toast.success("Chat cleared");
              }}
            >
              <Trash2 className="size-3.5" /> Clear Chat
            </Button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-secondary/50 text-card-foreground"
                  }`}
                >
                  <MessageBody content={m.content} />
                </div>
              </div>
            ))}

            {typing ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Assistant is typing
                  <span className="flex gap-1">
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border px-5 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about emails, meetings, planning or research..."
              />
              <Button type="submit" disabled={typing || !input.trim()}>
                <Send className="size-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
            <PrivacyNote className="mt-2" />
          </div>
        </section>

        <DisclaimerBanner />
      </div>
    </>
  );
}
