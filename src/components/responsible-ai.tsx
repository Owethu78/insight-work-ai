import { ShieldCheck, Lock } from "lucide-react";

export function DisclaimerBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 ${className}`}
    >
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-warning-foreground/70" />
      <p className="text-xs leading-relaxed text-warning-foreground/90">
        <span className="font-semibold">Disclaimer:</span> AI-generated outputs are assistance tools
        and must be reviewed and validated by a human prior to official workplace distribution or
        decision-making.
      </p>
    </div>
  );
}

export function PrivacyNote({ className = "" }: { className?: string }) {
  return (
    <p className={`flex items-center gap-1.5 text-[11px] text-muted-foreground ${className}`}>
      <Lock className="size-3 shrink-0" />
      Data processed locally for demonstration. Do not submit sensitive personal identifiable
      information (PII).
    </p>
  );
}
