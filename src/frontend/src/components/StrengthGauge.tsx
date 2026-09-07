import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface StrengthGaugeProps {
  /** Predicted strength as a percentage (0-100). */
  score: number;
  className?: string;
}

function gaugeClass(score: number): string {
  if (score < 40) return "bg-gauge-weak";
  if (score < 70) return "bg-gauge-mid";
  return "bg-gauge-strong";
}

function gaugeText(score: number): string {
  if (score < 40) return "text-gauge-weak";
  if (score < 70) return "text-gauge-mid";
  return "text-gauge-strong";
}

function gaugeLabel(score: number): string {
  if (score < 40) return "Weak";
  if (score < 70) return "Moderate";
  return "Strong";
}

export default function StrengthGauge({
  score,
  className,
}: StrengthGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const display = useCountUp(clamped);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Predicted strength</span>
        <span
          className={cn("font-mono font-semibold count-up", gaugeText(clamped))}
        >
          {gaugeLabel(clamped)} · {Math.round(display)}%
        </span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        tabIndex={0}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Predicted promoter strength"
      >
        <div
          className={cn(
            "h-full rounded-full animate-gauge-fill",
            gaugeClass(clamped),
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Weak</span>
        <span>Moderate</span>
        <span>Strong</span>
      </div>
    </div>
  );
}
