import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Sparkles, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { InputPanel, ModuleHeader, TwoPanel } from "@/components/app-shell";
import { PrivacyNote } from "@/components/responsible-ai";
import { ActionBar, EditableTextOutput, OutputShell } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAppState } from "@/lib/app-state";
import {
  generateTaskPlan,
  samples,
  simulateLatency,
  taskPlanToText,
  type Quadrant,
  type TaskPlan,
} from "@/lib/mock-ai";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner & Scheduler — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Prioritize tasks with Eisenhower Matrix logic and get a time-blocked daily or weekly schedule.",
      },
      { property: "og:title", content: "AI Task Planner & Scheduler — AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Turn a messy task list into a prioritized, time-blocked schedule.",
      },
    ],
  }),
  component: TasksPage,
});

const quadrantOrder: Quadrant[] = [
  "Urgent & Important",
  "Important, Not Urgent",
  "Urgent, Not Important",
  "Neither Urgent nor Important",
];

const quadrantTone: Record<Quadrant, string> = {
  "Urgent & Important": "border-destructive/40 text-destructive",
  "Important, Not Urgent": "border-primary/40 text-accent-foreground",
  "Urgent, Not Important": "border-warning/50 text-warning-foreground",
  "Neither Urgent nor Important": "border-border text-muted-foreground",
};

function TasksPage() {
  const { bump } = useAppState();
  const [raw, setRaw] = useState("");
  const [hours, setHours] = useState(6);
  const [view, setView] = useState<"Daily" | "Weekly">("Daily");
  const [plan, setPlan] = useState<TaskPlan | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const text = plan ? taskPlanToText(plan) : "";

  async function handleGenerate() {
    if (!raw.trim()) {
      toast.error("Add a few tasks or goals first");
      return;
    }
    setLoading(true);
    await simulateLatency(650);
    const next = generateTaskPlan(raw, hours, view);
    setPlan(next);
    setDraft(taskPlanToText(next));
    setEditing(false);
    setLoading(false);
    bump({ tasksPlanned: next.blocks.length, minutesSaved: 15 });
    toast.success("Schedule generated!");
  }

  const days = plan ? [...new Set(plan.blocks.map((b) => b.day))] : [];

  return (
    <>
      <ModuleHeader
        icon={CalendarClock}
        title="AI Task Planner & Scheduler"
        description="Eisenhower prioritization plus realistic duration estimates and time-blocked scheduling."
      />

      <TwoPanel
        left={
          <InputPanel title="Inputs & Configuration">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tasks">Tasks / goals (one per line)</Label>
              <Textarea
                id="tasks"
                rows={10}
                placeholder={"Finalize board report - deadline Friday\nReview audit findings\n..."}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label>Available hours per day</Label>
                <span className="text-xs font-medium text-accent-foreground">{hours}h</span>
              </div>
              <Slider
                min={2}
                max={10}
                step={1}
                value={[hours]}
                onValueChange={(v) => setHours(v[0] ?? 6)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Working view</Label>
              <ToggleGroup
                type="single"
                value={view}
                onValueChange={(v) => v && setView(v as "Daily" | "Weekly")}
                className="w-full"
              >
                <ToggleGroupItem value="Daily" className="flex-1">
                  Daily
                </ToggleGroupItem>
                <ToggleGroupItem value="Weekly" className="flex-1">
                  Weekly
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void handleGenerate()} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Generate Schedule
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setRaw(samples.tasks);
                  toast.success("Sample tasks loaded");
                }}
              >
                <Wand2 className="size-4" /> Load Sample Tasks
              </Button>
            </div>

            <PrivacyNote />
          </InputPanel>
        }
        right={
          <OutputShell
            title="Prioritized Schedule"
            subtitle={plan ? `${plan.view} view · ${hours}h capacity` : undefined}
            filename="task-schedule"
            text={editing ? draft : text}
            isEmpty={!plan}
            emptyHint="Add tasks and generate a time-blocked plan. Load Sample Tasks to try it instantly."
            actionsSlot={
              <ActionBar
                text={editing ? draft : text}
                filename="task-schedule"
                editing={editing}
                onToggleEdit={() => setEditing((v) => !v)}
              />
            }
          >
            {editing ? (
              <EditableTextOutput value={draft} onChange={setDraft} />
            ) : plan ? (
              <>
                {days.map((day) => (
                  <div key={day} className="rounded-xl border border-border p-4">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                      {day}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {plan.blocks
                        .filter((b) => b.day === day)
                        .map((b) => (
                          <li
                            key={`${b.day}-${b.start}-${b.task}`}
                            className="flex flex-wrap items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2"
                          >
                            <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                              {b.start} – {b.end}
                            </span>
                            <span className="flex-1 text-sm text-card-foreground">{b.task}</span>
                            <Badge variant="outline" className={quadrantTone[b.quadrant]}>
                              {b.quadrant}
                            </Badge>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}

                <div className="grid gap-3 sm:grid-cols-2">
                  {quadrantOrder.map((q) => (
                    <div key={q} className="rounded-xl border border-border bg-secondary/40 p-3">
                      <p className="text-xs font-semibold text-card-foreground">{q}</p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                        {plan.quadrants[q].length ? (
                          plan.quadrants[q].map((t) => <li key={t}>{t}</li>)
                        ) : (
                          <li>None</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                    Planner Notes
                  </h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-card-foreground">
                    {plan.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </OutputShell>
        }
      />
    </>
  );
}
