import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Sparkles, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { InputPanel, ModuleHeader, TwoPanel } from "@/components/app-shell";
import { PrivacyNote } from "@/components/responsible-ai";
import { ActionBar, EditableTextOutput, OutputShell } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState } from "@/lib/app-state";
import {
  callOpenAI,
  generateEmail,
  samples,
  simulateLatency,
  type Length,
  type Tone,
} from "@/lib/mock-ai";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Generate professional workplace emails with subject line, structured body, clear call-to-action and tone control.",
      },
      { property: "og:title", content: "Smart Email Generator — AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Draft tone-matched workplace emails with a clear CTA in seconds.",
      },
    ],
  }),
  component: EmailPage,
});

const tones: Tone[] = ["Formal", "Friendly", "Persuasive", "Conciliatory"];
const lengths: Length[] = ["Short", "Balanced", "Detailed"];

function EmailPage() {
  const { apiKey, hasKey, bump } = useAppState();
  const [topic, setTopic] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [lengthIndex, setLengthIndex] = useState(1);
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const length = lengths[lengthIndex] ?? "Balanced";

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Add some topic or context first");
      return;
    }
    setLoading(true);
    try {
      let result: string;
      if (hasKey) {
        result = await callOpenAI(
          apiKey,
          "You are a professional workplace email writer. Always return a subject line, an appropriate salutation, a structured body, a clear call-to-action and a sign-off.",
          `Write a ${tone.toLowerCase()} email of ${length.toLowerCase()} length to ${recipient || "the recipient"} about: ${topic}`,
        );
      } else {
        await simulateLatency(700);
        result = generateEmail({ topic, recipient, tone, length });
      }
      setOutput(result);
      setEditing(false);
      bump({ emailsDrafted: 1, minutesSaved: 12 });
      toast.success("Email drafted!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ModuleHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Turn rough context into a polished, tone-matched email with a clear call-to-action."
      />

      <TwoPanel
        left={
          <InputPanel title="Inputs & Configuration">
            <div className="flex flex-col gap-2">
              <Label htmlFor="topic">Topic / Context</Label>
              <Textarea
                id="topic"
                rows={7}
                placeholder="e.g. The Q3 dashboard release slipped by a week; we need sign-off on the revised launch comms."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="recipient">Recipient name / role</Label>
              <Input
                id="recipient"
                placeholder="e.g. Dana Whitfield, VP of Operations"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label>Length</Label>
                <span className="text-xs font-medium text-accent-foreground">{length}</span>
              </div>
              <Slider
                min={0}
                max={2}
                step={1}
                value={[lengthIndex]}
                onValueChange={(v) => setLengthIndex(v[0] ?? 1)}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                {lengths.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={() => void handleGenerate()} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Generate Email
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setTopic(samples.emailTopic);
                  setRecipient(samples.emailRecipient);
                  setTone("Conciliatory");
                  setLengthIndex(1);
                  toast.success("Sample data loaded");
                }}
              >
                <Wand2 className="size-4" /> Load Sample Data
              </Button>
            </div>

            <PrivacyNote />
          </InputPanel>
        }
        right={
          <OutputShell
            title="Generated Email"
            subtitle={hasKey ? "Live generation" : "Realistic demo generation"}
            filename="ai-email-draft"
            text={output}
            isEmpty={!output}
            emptyHint="Add your topic and recipient, then generate a draft. Use Load Sample Data to try it in one click."
            actionsSlot={
              <ActionBar
                text={output}
                filename="ai-email-draft"
                editing={editing}
                onToggleEdit={() => setEditing((v) => !v)}
              />
            }
          >
            {editing ? (
              <EditableTextOutput value={output} onChange={setOutput} />
            ) : (
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-secondary/40 p-4 font-mono text-[13px] leading-relaxed text-card-foreground">
                {output}
              </pre>
            )}
          </OutputShell>
        }
      />
    </>
  );
}
