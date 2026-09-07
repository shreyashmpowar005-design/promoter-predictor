import {
  SYNTHETIC_SEQUENCE_COUNT,
  pearsonCorrelation,
  promoterModel,
} from "@/lib/ml";
import { SEQUENCE_LENGTH, generateRandomSequence } from "@/lib/sequence";
import { describe, expect, it } from "vitest";

const VALID_35BP = "TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC";

describe("promoterModel", () => {
  it("predicts a finite numeric score for a valid 35 bp sequence", () => {
    const score = promoterModel.predict(VALID_35BP);
    expect(typeof score).toBe("number");
    expect(Number.isFinite(score)).toBe(true);
  });

  it("predicts deterministically for the same sequence", () => {
    const a = promoterModel.predict(VALID_35BP);
    const b = promoterModel.predict(VALID_35BP);
    expect(a).toBe(b);
  });

  it("reports performance metrics on the held-out test set", () => {
    const perf = promoterModel.getPerformance();
    // R² can be arbitrarily negative for a weak model; assert it is a finite
    // number rather than bounding it.
    expect(Number.isFinite(perf.r2)).toBe(true);
    expect(perf.rmse).toBeGreaterThanOrEqual(0);
    expect(perf.trainCount).toBeGreaterThan(0);
    expect(perf.testCount).toBeGreaterThan(0);
    expect(perf.testPoints.length).toBe(perf.testCount);
    // Training count should be ~80% of the synthetic set.
    expect(perf.trainCount).toBeLessThan(SYNTHETIC_SEQUENCE_COUNT);
  });

  it("returns top motifs sorted by learned weight descending", () => {
    const motifs = promoterModel.getTopMotifs(10);
    expect(motifs).toHaveLength(10);
    for (let i = 1; i < motifs.length; i += 1) {
      expect(motifs[i - 1].weight).toBeGreaterThanOrEqual(motifs[i].weight);
    }
    // Every motif is a valid 3-mer.
    for (const m of motifs) {
      expect(m.motif).toMatch(/^[ATGC]{3}$/);
    }
  });

  it("predicts a score for a random sequence", () => {
    const seq = generateRandomSequence(7);
    expect(seq).toHaveLength(SEQUENCE_LENGTH);
    expect(Number.isFinite(promoterModel.predict(seq))).toBe(true);
  });
});

describe("pearsonCorrelation", () => {
  it("returns 0 for empty or mismatched arrays", () => {
    expect(pearsonCorrelation([], [])).toBe(0);
    expect(pearsonCorrelation([1, 2], [1])).toBe(0);
  });

  it("returns 1 for perfectly correlated data", () => {
    expect(pearsonCorrelation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 5);
  });

  it("returns -1 for perfectly anti-correlated data", () => {
    expect(pearsonCorrelation([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1, 5);
  });
});
