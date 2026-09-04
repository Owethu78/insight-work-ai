import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Microscope, Sparkles, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { InputPanel, ModuleHeader, TwoPanel } from "@/components/app-shell";
import { PrivacyNote } from "@/components/responsible-ai";
import { ActionBar, EditableTextOutput, OutputShell } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState } from "@/lib/app-state";
import {
  generateResearchBrief,
  researchBriefToText,
  samples,
  simulateLatency,
  type FocusArea,
  type ResearchBrief,
} from "@/lib/mock-ai";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Turn topics or raw notes into a structured brief with highlights, insights, recommendations and risks.",
      },
      { property: "og:title", content: "AI Research Assistant — AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Executive-ready research briefs from raw notes in seconds.",
      },
    ],
  }),
  component: ResearchPage,
});

const focusAreas: FocusArea[] = ["Market Analysis", "Technical Summary", "Executive Brief"];

function ResearchPage() {
  const { bump } = useAppState();
  const [input, setInput] = useState("");
  const [focus, setFocus] = useState<FocusArea>("Executive Brief");
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const text = brief ? researchBriefToText(brief) : "";

  async function handleGenerate() {
    if (!input.trim()) {
      toast.error("Add a topic or paste some notes first");
      return;
    }
    setLoading(true);
    await simulateLatency(750);
    const next = generateResearchBrief(input, focus);
    setBrief(next);
    setDraft(researchBriefToText(next));
    setEditing(false);
    setLoading(false);
    bump({ minutesSaved: 25 });
    toast.success("Research brief ready!");
  }

  const sections = brief
    ? [
        { title: "Key Highlights", items: brief.highlights },
        { title: "Industry Insights", items: brief.insights },
        { title: "Strategic Recommendations", items: brief.recommendations },
        { title: "Potential Risks & Caveats", items: brief.risks },
      ]
    : [];

  return (
    <>
      <ModuleHeader
        icon={Microscope}
        title="AI Research Assistant"
        description="Synthesize a topic or raw article into a structured, decision-ready brief."
      />

      <TwoPanel
        left={
          <InputPanel title="Inputs & Configuration">
            <div className="flex flex-col gap-2">
              <Label htmlFor="research">Topic or raw article / notes</Label>
              <Textarea
                id="research"
                rows={12}
                placeholder="e.g. Evaluating a migration of our core platform to managed cloud infrastructure..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Focus area</Label>
              <Select value={focus} onValueChange={(v) => setFocus(v as FocusArea)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {focusAreas.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void handleGenerate()} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Generate Brief
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setInput(samples.research);
                  toast.success("Demo data loaded");
                }}
              >
                <Wand2 className="size-4" /> Load Demo Data
              </Button>
            </div>

            <PrivacyNote />
          </InputPanel>
        }
        right={
          <OutputShell
            title="Research Brief"
            subtitle={brief ? `${brief.topic} · ${brief.focus}` : undefined}
            filename="research-brief"
            text={editing ? draft : text}
            isEmpty={!brief}
            emptyHint="Add a topic or paste notes, pick a focus area, then generate the brief."
            actionsSlot={
              <ActionBar
                text={editing ? draft : text}
                filename="research-brief"
                editing={editing}
                onToggleEdit={() => setEditing((v) => !v)}
              />
            }
          >
            {editing ? (
              <EditableTextOutput value={draft} onChange={setDraft} />
            ) : (
              sections.map((s) => (
                <div key={s.title} className="rounded-xl border border-border bg-secondary/40 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                    {s.title}
                  </h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-card-foreground">
                    {s.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </OutputShell>
        }
      />
    </>
  );
}
