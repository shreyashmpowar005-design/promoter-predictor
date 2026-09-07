import StrengthGauge from "@/components/StrengthGauge";
import { Button } from "@/components/ui/button";
import { useCountUp } from "@/hooks/useCountUp";
import type { PredictionResult } from "@/lib/types";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

interface ResultCardProps {
  result: PredictionResult;
  /** Predicted strength as a percentage (0-100). */
  percent: number;
}

const BASE_CLASS: Record<string, string> = {
  A: "text-nuc-a",
  T: "text-nuc-t",
  G: "text-nuc-g",
  C: "text-nuc-c",
};

export default function ResultCard({ result, percent }: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const reduceMotion = useReducedMotion();
  const display = useCountUp(percent);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "promoter-strength-prediction.png";
      link.href = dataUrl;
      link.click();
    } catch {
      // PNG export failed; the on-screen card remains available.
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        ref={cardRef}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border bg-card p-6 shadow-subtle hover-lift"
        data-ocid="result_card"
      >
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Promoter strength prediction
          </p>
          <motion.p
            key={Math.round(display)}
            initial={reduceMotion ? false : { scale: 0.92, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-1 font-display text-5xl font-bold text-gradient count-up"
          >
            {Math.round(display)}%
          </motion.p>
          <p className="text-sm text-muted-foreground">
            relative expression strength
          </p>
        </div>

        <StrengthGauge score={percent} />

        <div className="mt-5 space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              DNA sequence
            </p>
            <p className="break-all rounded-lg bg-muted p-3 font-mono text-sm leading-relaxed">
              {result.sequence
                .split("")
                .map((base, i) => ({ base, key: `${base}-${i}` }))
                .map(({ base, key }) => (
                  <span key={key} className={BASE_CLASS[base] ?? ""}>
                    {base}
                  </span>
                ))}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">GC content</p>
              <p className="font-mono font-semibold">
                {result.gcContent.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Motifs detected</p>
              <p className="font-mono font-semibold">{result.motifs.length}</p>
            </div>
          </div>

          {result.motifs.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Detected motifs
              </p>
              <div className="flex flex-wrap gap-2">
                {result.motifs.map((motif) => (
                  <span
                    key={`${motif.name}-${motif.start}`}
                    className="rounded-full border bg-secondary px-3 py-1 text-xs font-medium"
                  >
                    {motif.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="pt-2 text-center text-[11px] text-muted-foreground">
            Synthetic Promoter Strength Predictor · Biotechnology Engineering
            Mini Project
          </p>
        </div>
      </motion.div>

      <Button
        type="button"
        variant="outline"
        onClick={handleDownload}
        disabled={downloading}
        data-ocid="download_png_button"
      >
        <Download />
        {downloading ? "Rendering…" : "Download Result Card as PNG"}
      </Button>
    </div>
  );
}
