import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { NotebookPen, Sparkles, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { InputPanel, ModuleHeader, TwoPanel } from "@/components/app-shell";
import { PrivacyNote } from "@/components/responsible-ai";
import { ActionBar, EditableTextOutput, OutputShell } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppState } from "@/lib/app-state";
import {
  generateMeetingSummary,
  meetingSummaryToText,
  samples,
  simulateLatency,
  type MeetingSummary,
} from "@/lib/mock-ai";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Turn raw meeting transcripts into an executive summary, key decisions and an owned action-item table.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Structured summaries, decisions and action items from messy meeting notes.",
      },
    ],
  }),
  component: MeetingsPage;
});

function MeetingsPage() {
  const { bump } = useAppState();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<MeetingSummary | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const text = result ? meetingSummaryToText(result) : "";

  async function handleGenerate() {
    if (!notes.trim()) {
      toast.error("Paste your meeting notes first");
      return;
    }
    setLoading(true);
    await simulateLatency(700);
    const summary = generateMeetingSummary(notes, title, date);
    setResult(summary);
    setDraft(meetingSummaryToText(summary));
    setEditing(false);
    setLoading(false);
    bump({ tasksPlanned: summary.actions.length, minutesSaved: 18 });
    toast.success("Meeting summarized!");
  }

  const priorityTone = (p: string) =>
    p === "High"
      ? "border-destructive/40 text-destructive"
      : p === "Medium"
        ? "border-warning/50 text-warning-foreground"
        : "border-border text-muted-foreground";

  return (
    <>
      <ModuleHeader
        icon={NotebookPen}
        title="Meeting Notes Summarizer"
        description="Extract an executive summary, decisions and owned action items from unstructured notes."
      />

      <TwoPanel
        left={
          <InputPanel title="Inputs & Configuration">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="mtitle">Meeting title</Label>
                <Input
                  id="mtitle"
                  placeholder="e.g. Q3 Platform Delivery Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="mdate">Date</Label>
                <Input
                  id="mdate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Raw transcript / unstructured notes</Label>
              <Textarea
                id="notes"
                rows={12}
                placeholder="Paste the raw transcript or your rough notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void handleGenerate()} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Summarize Notes
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setTitle(samples.meetingTitle);
                  setNotes(samples.meetingNotes);
                  toast.success("Sample notes loaded");
                }}
              >
                <Wand2 className="size-4" /> Load Sample Notes
              </Button>
            </div>

            <PrivacyNote />
          </InputPanel>
        }
        right={
          <OutputShell
            title="Structured Meeting Output"
            subtitle={result ? `${result.title} · ${result.date}` : undefined}
            filename="meeting-summary"
            text={editing ? draft : text}
            isEmpty={!result}
            emptyHint="Paste notes and summarize. Load Sample Notes fills a realistic transcript in one click."
            actionsSlot={
              <ActionBar
                text={editing ? draft : text}
                filename="meeting-summary"
                editing={editing}
                onToggleEdit={() => setEditing((v) => !v)}
              />
            }
          >
            {editing ? (
              <EditableTextOutput value={draft} onChange={setDraft} />
            ) : result ? (
              <>
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                    Executive Summary
                  </h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-card-foreground">
                    {result.summary.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                    Key Decisions Made
                  </h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-card-foreground">
                    {result.decisions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                    Action Items
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Deadline</TableHead>
                          <TableHead>Priority</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.actions.map((a) => (
                          <TableRow key={a.task}>
                            <TableCell className="max-w-72 text-sm">{a.task}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm">{a.owner}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {a.deadline}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={priorityTone(a.priority)}>
                                {a.priority}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            ) : null}
          </OutputShell>
        }
      />
    </>
  );
}
