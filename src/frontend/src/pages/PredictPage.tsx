import GeneExpression from "@/components/GeneExpression";
import ResultCard from "@/components/ResultCard";
import SequenceInput from "@/components/SequenceInput";
import StrengthGauge from "@/components/StrengthGauge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addPrediction } from "@/lib/history";
import { promoterModel } from "@/lib/ml";
import {
  computeGcContent,
  detectMotifs,
  generateRandomSequence,
  insertTataMotif,
  sanitizeSequence,
} from "@/lib/sequence";
import type { PredictionResult } from "@/lib/types";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

interface PredictPageProps {
  pendingSequence?: string | null;
  onPendingConsumed?: () => void;
}

/** Normalize the raw model score to a 0-100 display scale. */
function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, ((score - 0.2) / 1.0) * 100));
}

const revealContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const revealItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function PredictPage({
  pendingSequence,
  onPendingConsumed,
}: PredictPageProps) {
  const [sequence, setSequence] = useState<string>(() =>
    generateRandomSequence(),
  );
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (pendingSequence) {
      setSequence(pendingSequence);
      onPendingConsumed?.();
    }
  }, [pendingSequence, onPendingConsumed]);

  const handlePredict = () => {
    try {
      const sanitized = sanitizeSequence(sequence);
      const score = promoterModel.predict(sanitized);
      const gcContent = computeGcContent(sanitized);
      const motifs = detectMotifs(sanitized);
      const next: PredictionResult = {
        sequence: sanitized,
        score,
        gcContent,
        motifs,
        timestamp: new Date().toISOString(),
      };
      addPrediction({
        sequence: sanitized,
        score,
        gcContent,
        motifs: motifs.map((m) => m.name),
      });
      setResult(next);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to predict promoter strength.",
      );
      setResult(null);
    }
  };

  const handleRandom = () => {
    setSequence(generateRandomSequence());
    setError(null);
  };

  const handleTata = () => {
    try {
      setSequence(insertTataMotif(sequence));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid sequence.");
    }
  };

  const percent = result ? normalizeScore(result.score) : 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT panel — sequence input */}
        <Card className="h-fit">
          <CardContent className="space-y-4 pt-6">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Promoter sequence
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter a 35 bp promoter sequence (A / T / G / C) to estimate its
                relative expression strength.
              </p>
            </div>

            <SequenceInput
              value={sequence}
              onChange={setSequence}
              error={error}
            />

            <div className="flex flex-wrap gap-3">
              <motion.div
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                whileFocus={reduceMotion ? undefined : { scale: 1.02 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button
                  type="button"
                  data-ocid="predict_button"
                  onClick={handlePredict}
                  className="glow-hover"
                >
                  Predict strength
                </Button>
              </motion.div>
              <Button
                type="button"
                variant="outline"
                data-ocid="random_button"
                onClick={handleRandom}
              >
                Generate random sequence
              </Button>
              <Button
                type="button"
                variant="outline"
                data-ocid="tata_button"
                onClick={handleTata}
              >
                Insert TATA motif
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              The prediction is a synthetic, in-browser model estimate for
              educational demonstration only — not experimental data.
            </p>
          </CardContent>
        </Card>

        {/* RIGHT panel — result */}
        <div className="space-y-6">
          <AnimatePresence mode="wait" initial={false}>
            {result ? (
              <motion.div
                key={result.timestamp}
                variants={revealContainer}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <motion.div variants={revealItem}>
                  <ResultCard result={result} percent={percent} />
                </motion.div>
                <motion.div variants={revealItem}>
                  <Card>
                    <CardContent className="space-y-6 pt-6">
                      <StrengthGauge score={percent} />
                      <GeneExpression score={percent} />
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="flex min-h-72 items-center justify-center">
                  <CardContent className="text-center">
                    <p className="font-display text-lg font-semibold">
                      No prediction yet
                    </p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                      Enter a promoter sequence and press{" "}
                      <span className="font-medium text-foreground">
                        Predict strength
                      </span>{" "}
                      to see the estimated relative expression, detected motifs,
                      GC content, and gene-expression visualization.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
