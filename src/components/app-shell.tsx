import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  NotebookPen,
  CalendarClock,
  Microscope,
  MessagesSquare,
  Menu,
  Settings,
  Sparkles,
  X,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAppState, formatTimeSaved } from "@/lib/app-state";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, blurb: "Overview & quick launch" },
  { to: "/email", label: "Email Generator", icon: Mail, blurb: "Draft professional emails" },
  { to: "/meetings", label: "Meeting Summarizer", icon: NotebookPen, blurb: "Notes to decisions" },
  { to: "/tasks", label: "Task Planner", icon: CalendarClock, blurb: "Prioritize & time-block" },
  { to: "/research", label: "Research Assistant", icon: Microscope, blurb: "Structured briefs" },
  { to: "/chat", label: "AI Assistant", icon: MessagesSquare, blurb: "Chat with your assistant" },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <span className="grid size-9 place-items-center rounded-lg bg-sidebar-primary">
          <Sparkles className="size-4 text-sidebar-primary-foreground" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-primary-foreground">AI Workplace</p>
          <p className="text-[11px] text-sidebar-foreground/70">Productivity Assistant</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="mt-0.5 size-4 shrink-0" />
              <span className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span
                  className={`text-[11px] ${active ? "text-sidebar-primary-foreground/75" : "text-sidebar-foreground/55"}`}
                >
                  {item.blurb}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3">
        <p className="text-[11px] font-semibold text-sidebar-primary-foreground">Demo mode</p>
        <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/70">
          Realistic mock generation runs locally. Add an API key in Settings for live calls.
        </p>
      </div>
    </div>
  );
}

function SettingsDialog() {
  const { apiKey, setApiKey, hasKey } = useAppState();
  const [draft, setDraft] = useState(apiKey);
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft(apiKey);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="size-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Optionally connect an OpenAI API key for live generation. Without a key, the app uses
            realistic built-in mock generation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="api-key">OpenAI API key (optional)</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="sk-..."
            value={draft}
            autoComplete="off"
            onChange={(e) => setDraft(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            Stored only in this browser&apos;s local storage and sent directly to OpenAI. Leave empty
            to stay in mock mode.
          </p>
        </div>

        <DialogFooter>
          {hasKey ? (
            <Button
              variant="ghost"
              onClick={() => {
                setApiKey("");
                setDraft("");
                toast.success("API key removed — using mock mode");
                setOpen(false);
              }}
            >
              Remove key
            </Button>
          ) : null}
          <Button
            onClick={() => {
              setApiKey(draft.trim());
              toast.success(draft.trim() ? "API key saved — live mode enabled" : "Mock mode active");
              setOpen(false);
            }}
          >
            Save settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HeaderStats() {
  const { stats } = useAppState();
  const items = [
    { label: "Tasks", value: String(stats.tasksPlanned) },
    { label: "Emails", value: String(stats.emailsDrafted) },
    { label: "Saved", value: formatTimeSaved(stats.minutesSaved) },
  ];
  return (
    <div className="hidden items-center gap-4 rounded-xl border border-border bg-card px-4 py-1.5 lg:flex">
      {items.map((i) => (
        <div key={i.label} className="text-center">
          <p className="text-sm font-semibold leading-tight text-card-foreground">{i.value}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{i.label}</p>
        </div>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { hasKey } = useAppState();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-elevated">
            <button
              aria-label="Close navigation"
              className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold text-card-foreground sm:text-base">
                AI Workplace Productivity Assistant
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Email, meetings, planning and research — in one workspace
              </p>
            </div>

            <HeaderStats />

            <Badge
              variant="outline"
              className={hasKey ? "border-success/40 text-success" : "border-border text-muted-foreground"}
            >
              <KeyRound className="size-3" />
              {hasKey ? "Live" : "Demo"}
            </Badge>

            <SettingsDialog />

            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              AM
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function ModuleHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function TwoPanel({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

export function InputPanel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
      {children}
    </section>
  );
}
