import { SEQUENCE_LENGTH, generateRandomSequence } from "@/lib/sequence";
import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

const BASE_CLASS: Record<string, string> = {
  A: "text-nuc-a",
  T: "text-nuc-t",
  G: "text-nuc-g",
  C: "text-nuc-c",
};

const LEGEND = [
  { base: "A", label: "Adenine", cls: "text-nuc-a" },
  { base: "T", label: "Thymine", cls: "text-nuc-t" },
  { base: "G", label: "Guanine", cls: "text-nuc-g" },
  { base: "C", label: "Cytosine", cls: "text-nuc-c" },
];

export default function AnimatedSequence() {
  const fullSequence = useMemo(() => generateRandomSequence(), []);
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(fullSequence.length);
      return;
    }
    const id = setInterval(() => {
      setVisible((v) => (v >= fullSequence.length ? v : v + 1));
    }, 110);
    return () => clearInterval(id);
  }, [fullSequence.length, reduceMotion]);

  const shown = fullSequence.slice(0, visible);
  const shownBases = shown
    .split("")
    .map((base, i) => ({ base, key: `${base}-${i}` }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-wide">
          Live sequence
        </span>
        <span className="font-mono" data-ocid="sequence_counter">
          {visible} / {SEQUENCE_LENGTH} bp
        </span>
      </div>

      <div
        className="flex flex-wrap gap-1 rounded-xl border bg-background/70 p-3 font-mono text-lg sm:text-xl"
        data-ocid="animated_sequence"
        aria-label="Animated DNA nucleotide sequence"
      >
        {shownBases.map(({ base, key }) => (
          <span
            key={key}
            className={`${BASE_CLASS[base] ?? "text-foreground"} animate-fade-in-up`}
          >
            {base}
          </span>
        ))}
        <span className="text-muted-foreground/40" aria-hidden="true">
          {"·".repeat(Math.max(0, fullSequence.length - visible))}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {LEGEND.map((item) => (
          <span key={item.base} className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block h-3 w-3 rounded-sm ${item.cls}`}
              aria-hidden="true"
            />
            <span className="font-mono font-semibold">{item.base}</span>
            <span className="text-muted-foreground">{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
