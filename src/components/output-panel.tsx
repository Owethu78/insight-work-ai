import { useState, type ReactNode } from "react";
import { Copy, Download, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DisclaimerBanner } from "@/components/responsible-ai";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  } catch {
    toast.error("Could not access the clipboard");
  }
}

export function exportTxt(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Exported to TXT");
}

interface ActionBarProps {
  text: string;
  filename: string;
  editing?: boolean | undefined;
  onToggleEdit?: (() => void) | undefined;
}

export function ActionBar({ text, filename, editing, onToggleEdit }: ActionBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => void copyText(text)}>
        <Copy className="size-3.5" /> Copy to Clipboard
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportTxt(text, filename)}>
        <Download className="size-3.5" /> Export to TXT
      </Button>
      {onToggleEdit ? (
        <Button variant={editing ? "default" : "outline"} size="sm" onClick={onToggleEdit}>
          {editing ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
          {editing ? "Done Editing" : "Edit Output"}
        </Button>
      ) : null}
    </div>
  );
}

interface OutputShellProps {
  title: string;
  subtitle?: string | undefined;
  filename: string;
  text: string;
  isEmpty: boolean;
  emptyHint: string;
  actionsSlot?: ReactNode | undefined;
  children: ReactNode;
}

export function OutputShell({
  title,
  subtitle,
  filename,
  text,
  isEmpty,
  emptyHint,
  actionsSlot,
  children,
}: OutputShellProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {!isEmpty ? (actionsSlot ?? <ActionBar text={text} filename={filename} />) : null}
      </header>

      {isEmpty ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 p-8 text-center">
          <p className="text-sm font-medium text-secondary-foreground">No output yet</p>
          <p className="max-w-sm text-xs text-muted-foreground">{emptyHint}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">{children}</div>
      )}

      <DisclaimerBanner />
    </section>
  );
}

interface EditableTextOutputProps {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}

export function EditableTextOutput({ value, onChange, rows = 20 }: EditableTextOutputProps) {
  return (
    <Textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="resize-y whitespace-pre-wrap font-mono text-[13px] leading-relaxed"
    />
  );
}

export function useEditing(initial = false) {
  return useState(initial);
}
