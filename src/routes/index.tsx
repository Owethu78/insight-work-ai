import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  NotebookPen,
  CalendarClock,
  Microscope,
  MessagesSquare,
  ArrowRight,
  ListChecks,
  Timer,
  Send,
} from "lucide-react";

import { DisclaimerBanner } from "@/components/responsible-ai";
import { useAppState, formatTimeSaved } from "@/lib/app-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "One workspace for AI-assisted emails, meeting summaries, task planning and research briefs.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Draft emails, summarize meetings, time-block your week and build research briefs in one dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/email",
    label: "Smart Email Generator",
    icon: Mail,
    text: "Tone-matched emails with subject line, structure and a clear CTA.",
  },
  {
    to: "/meetings",
    label: "Meeting Notes Summarizer",
    icon: NotebookPen,
    text: "Executive summary, decisions and an owned action-item table.",
  },
  {
    to: "/tasks",
    label: "AI Task Planner",
    icon: CalendarClock,
    text: "Eisenhower prioritization and a time-blocked schedule.",
  },
  {
    to: "/research",
    label: "AI Research Assistant",
    icon: Microscope,
    text: "Highlights, insights, recommendations and risk caveats.",
  },
  {
    to: "/chat",
    label: "Interactive AI Assistant",
    icon: MessagesSquare,
    text: "Chat with a specialized workplace executive assistant.",
  },
] as const;

function Dashboard() {
  const { stats, hasKey } = useAppState();

  const metrics = [
    { label: "Tasks Planned", value: String(stats.tasksPlanned), icon: ListChecks },
    { label: "Emails Drafted", value: String(stats.emailsDrafted), icon: Send },
    { label: "Time Saved", value: formatTimeSaved(stats.minutesSaved), icon: Timer },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DisclaimerBanner />

      <section className="rounded-2xl border border-border bg-sidebar p-6 text-sidebar-foreground shadow-card sm:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-sidebar-foreground/60">
          Welcome back, Alex
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-sidebar-primary-foreground sm:text-3xl">
          Your AI workplace productivity workspace
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sidebar-foreground/80">
          Five AI modules for the work that eats your week: writing, summarizing, planning and
          researching. {hasKey ? "Live generation is enabled." : "Running in demo mode — every module works out of the box, no API key required."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/email"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Draft an email <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 rounded-lg border border-sidebar-border px-4 py-2 text-sm font-medium text-sidebar-primary-foreground transition-colors hover:bg-sidebar-accent"
          >
            Plan my day
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
              <m.icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold leading-tight text-card-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Quick launch</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-elevated"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
                <t.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-card-foreground">{t.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.text}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-accent-foreground">
                Open module
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
