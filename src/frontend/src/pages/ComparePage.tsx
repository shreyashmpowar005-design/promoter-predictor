import Section from "@/components/Section";
import SequenceInput from "@/components/SequenceInput";
import StrengthGauge from "@/components/StrengthGauge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { promoterModel } from "@/lib/ml";
import { generateRandomSequence, sanitizeSequence } from "@/lib/sequence";
import { cn } from "@/lib/utils";
import { CheckCircle2, Shuffle } from "lucide-react";
import { useState } from "react";

interface CandidateState {
  sequence: string;
  score: number | null;
  error: string | null;
}

function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, ((score - 0.2) / 1.0) * 100));
}

function CandidatePanel({
  label,
  state,
  onChange,
  isStronger,
}: {
  label: string;
  state: CandidateState;
  onChange: (value: string) => void;
  isStronger: boolean;
}) {
  const percent = state.score === null ? 0 : normalizeScore(state.score);

  return (
    <Card
      className={cn(
        "hover-lift glow-hover relative transition-all duration-300",
        isStronger && "border-primary ring-2 ring-primary/30",
      )}
    >
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">{label}</h3>
          {isStronger && (
            <span
              data-ocid={`compare.stronger.${label.toLowerCase()}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />✓ stronger
              candidate
            </span>
          )}
        </div>

        <SequenceInput
          value={state.sequence}
          onChange={onChange}
          error={state.error}
        />

        <div className="border-t pt-4">
          <StrengthGauge score={percent} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ComparePage() {
  const [candidateA, setCandidateA] = useState<CandidateState>(() => ({
    sequence: generateRandomSequence(),
    score: null,
    error: null,
  }));
  const [candidateB, setCandidateB] = useState<CandidateState>(() => ({
    sequence: generateRandomSequence(),
    score: null,
    error: null,
  }));

  const handleChangeA = (value: string) =>
    setCandidateA((prev) => ({ ...prev, sequence: value, error: null }));
  const handleChangeB = (value: string) =>
    setCandidateB((prev) => ({ ...prev, sequence: value, error: null }));

  const handleCompare = () => {
    let nextA: CandidateState = { ...candidateA, score: null };
    let nextB: CandidateState = { ...candidateB, score: null };

    try {
      const sanitizedA = sanitizeSequence(candidateA.sequence);
      nextA = {
        ...nextA,
        sequence: sanitizedA,
        score: promoterModel.predict(sanitizedA),
        error: null,
      };
    } catch (e) {
      nextA = {
        ...nextA,
        error: e instanceof Error ? e.message : "Invalid sequence.",
      };
    }

    try {
      const sanitizedB = sanitizeSequence(candidateB.sequence);
      nextB = {
        ...nextB,
        sequence: sanitizedB,
        score: promoterModel.predict(sanitizedB),
        error: null,
      };
    } catch (e) {
      nextB = {
        ...nextB,
        error: e instanceof Error ? e.message : "Invalid sequence.",
      };
    }

    setCandidateA(nextA);
    setCandidateB(nextB);
  };

  const handleRandomizeBoth = () => {
    setCandidateA({
      sequence: generateRandomSequence(),
      score: null,
      error: null,
    });
    setCandidateB({
      sequence: generateRandomSequence(),
      score: null,
      error: null,
    });
  };

  const bothScored = candidateA.score !== null && candidateB.score !== null;
  const strongerIsA = bothScored && candidateA.score! > candidateB.score!;
  const strongerIsB = bothScored && candidateB.score! > candidateA.score!;

  return (
    <div className="space-y-10">
      <Section
        title="Compare promoter candidates"
        subtitle="Score two 35 bp promoter sequences side by side and identify the stronger candidate for your expression construct."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <CandidatePanel
            label="Candidate A"
            state={candidateA}
            onChange={handleChangeA}
            isStronger={strongerIsA}
          />
          <CandidatePanel
            label="Candidate B"
            state={candidateB}
            onChange={handleChangeB}
            isStronger={strongerIsB}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            data-ocid="compare_button"
            className="press glow-hover"
            onClick={handleCompare}
          >
            Compare strength
          </Button>
          <Button
            type="button"
            variant="outline"
            data-ocid="compare_randomize_button"
            className="press glow-hover"
            onClick={handleRandomizeBoth}
          >
            <Shuffle className="size-4" aria-hidden="true" />
            Randomize both
          </Button>
        </div>
      </Section>
    </div>
  );
}
