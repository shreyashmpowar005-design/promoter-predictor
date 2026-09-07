/**
 * Client-side demo ML model for the Synthetic Promoter Strength Predictor.
 *
 * This is a SYNTHETIC / DEMO model. It is trained entirely in the browser on
 * ~500 procedurally generated promoter sequences whose strength labels are
 * simulated from sequence characteristics and promoter motifs. It is NOT a
 * validated experimental model and must be clearly distinguished from real
 * experimental data.
 *
 * The model uses:
 *   - 3-mer feature extraction (64 features)
 *   - feature standardization (z-score using training mean/std)
 *   - ridge-regularized linear regression via the closed-form solution
 *
 * A seeded PRNG makes training deterministic and reproducible, so predictions
 * are stable across page loads. A singleton model instance trains once on
 * first use.
 */

import {
  SEQUENCE_LENGTH,
  extractKmerFeatures,
  generateRandomSequence,
  indexToKmer,
  insertTataMotif,
} from "./sequence";
import type { ModelPerformance, MotifWeight } from "./types";

/** Number of synthetic sequences used to train the demo model. */
export const SYNTHETIC_SEQUENCE_COUNT = 500;

/** Fraction of sequences held out for testing. */
const TEST_FRACTION = 0.2;

/** Ridge regularization strength (lambda). */
const RIDGE_LAMBDA = 1.0;

/** Seed for the deterministic PRNG so training is reproducible. */
const MODEL_SEED = 20240907;

/** A small deterministic PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Compute the mean of an array. */
function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Pearson correlation coefficient between two arrays. */
export function pearsonCorrelation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i] - ma;
    const y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  const denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : num / denom;
}

/** A single synthetic training example. */
interface SyntheticExample {
  sequence: string;
  features: number[];
  label: number;
}

/**
 * Generate a synthetic promoter sequence with a simulated strength label.
 *
 * The label is derived from sequence characteristics: GC content, the presence
 * of a TATA box, and the presence of a -35 element. This is a DEMO simulation,
 * not experimental measurement.
 */
function generateSyntheticExample(rand: () => number): SyntheticExample {
  // Start from a random 35 bp sequence.
  let sequence = generateRandomSequence(Math.floor(rand() * 2 ** 31));

  // ~60% of synthetic promoters carry a TATA box.
  const hasTata = rand() < 0.6;
  if (hasTata) {
    sequence = insertTataMotif(sequence);
  }

  // ~40% carry a -35 element (TTGACA) near the 5' end.
  const hasMinus35 = rand() < 0.4;
  if (hasMinus35) {
    const minus35 = "TTGACA";
    const start = 5;
    sequence =
      sequence.slice(0, start) +
      minus35 +
      sequence.slice(start + minus35.length);
  }

  // Simulated strength from sequence characteristics plus noise.
  const gc = (sequence.match(/[GC]/g) ?? []).length / SEQUENCE_LENGTH;
  let label = 0.5;
  label += hasTata ? 0.35 : 0;
  label += hasMinus35 ? 0.2 : 0;
  label += (gc - 0.5) * 0.4;
  label += (rand() - 0.5) * 0.15;

  return { sequence, features: extractKmerFeatures(sequence), label };
}

/** Closed-form ridge regression: w = (XᵀX + λI)⁻¹ Xᵀy. */
function ridgeRegression(X: number[][], y: number[], lambda: number): number[] {
  const n = X.length;
  const p = X[0].length;

  // XᵀX (p x p)
  const xtx: number[][] = Array.from({ length: p }, () =>
    new Array<number>(p).fill(0),
  );
  // Xᵀy (p)
  const xty = new Array<number>(p).fill(0);

  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < p; j += 1) {
      xty[j] += X[i][j] * y[i];
      for (let k = 0; k < p; k += 1) {
        xtx[j][k] += X[i][j] * X[i][k];
      }
    }
  }

  // Add ridge penalty to the diagonal.
  for (let j = 0; j < p; j += 1) {
    xtx[j][j] += lambda;
  }

  // Solve the linear system via Gaussian elimination with partial pivoting.
  return solveLinearSystem(xtx, xty);
}

/** Solve A x = b for a square matrix A using Gaussian elimination. */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const aug = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col += 1) {
    // Partial pivoting.
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[pivot][col])) {
        pivot = row;
      }
    }
    [aug[col], aug[pivot]] = [aug[pivot], aug[col]];

    const pivotVal = aug[col][col];
    if (Math.abs(pivotVal) < 1e-12) continue;

    for (let row = col + 1; row < n; row += 1) {
      const factor = aug[row][col] / pivotVal;
      for (let k = col; k <= n; k += 1) {
        aug[row][k] -= factor * aug[col][k];
      }
    }
  }

  // Back substitution.
  const x = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row -= 1) {
    let sum = aug[row][n];
    for (let col = row + 1; col < n; col += 1) {
      sum -= aug[row][col] * x[col];
    }
    x[row] = Math.abs(aug[row][row]) < 1e-12 ? 0 : sum / aug[row][row];
  }
  return x;
}

/** A trained demo model instance. */
export class PromoterModel {
  private weights: number[] | null = null;
  private bias = 0;
  private featureMean: number[] | null = null;
  private featureStd: number[] | null = null;
  private performance: ModelPerformance | null = null;

  /** Whether the model has been trained. */
  get isTrained(): boolean {
    return this.weights !== null;
  }

  /** Train the model on synthetic data. Idempotent after first call. */
  train(): void {
    if (this.isTrained) return;

    const rand = mulberry32(MODEL_SEED);
    const examples: SyntheticExample[] = [];
    for (let i = 0; i < SYNTHETIC_SEQUENCE_COUNT; i += 1) {
      examples.push(generateSyntheticExample(rand));
    }

    // Split into train/test.
    const testCount = Math.floor(examples.length * TEST_FRACTION);
    const testExamples = examples.slice(0, testCount);
    const trainExamples = examples.slice(testCount);

    // Standardize features using training-set statistics.
    const p = trainExamples[0].features.length;
    const featureMean = new Array<number>(p).fill(0);
    for (const ex of trainExamples) {
      for (let j = 0; j < p; j += 1) featureMean[j] += ex.features[j];
    }
    for (let j = 0; j < p; j += 1) featureMean[j] /= trainExamples.length;

    const featureStd = new Array<number>(p).fill(0);
    for (const ex of trainExamples) {
      for (let j = 0; j < p; j += 1) {
        featureStd[j] += (ex.features[j] - featureMean[j]) ** 2;
      }
    }
    for (let j = 0; j < p; j += 1) {
      featureStd[j] = Math.sqrt(featureStd[j] / trainExamples.length) || 1;
    }

    const X = trainExamples.map((ex) =>
      ex.features.map((v, j) => (v - featureMean[j]) / featureStd[j]),
    );
    const y = trainExamples.map((ex) => ex.label);

    const weights = ridgeRegression(X, y, RIDGE_LAMBDA);

    // Intercept/bias term. Because features are z-score standardized (zero
    // mean), the least-squares intercept equals the mean of the training
    // labels. Without it, raw scores would be centered near 0 while the
    // training labels average ~0.5-0.7, so predictions would clamp to 0%.
    const bias = mean(y);

    // Evaluate on the held-out test set.
    const testPoints = testExamples.map((ex) => {
      const predicted = this.predictFromFeatures(
        ex.features,
        featureMean,
        featureStd,
        weights,
        bias,
      );
      return { actual: ex.label, predicted };
    });

    const actuals = testPoints.map((p) => p.actual);
    const predicted = testPoints.map((p) => p.predicted);
    const actualMean = mean(actuals);
    const ssRes = actuals.reduce(
      (sum, a, i) => sum + (a - predicted[i]) ** 2,
      0,
    );
    const ssTot = actuals.reduce((sum, a) => sum + (a - actualMean) ** 2, 0);
    const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
    const rmse = Math.sqrt(ssRes / testPoints.length);

    this.weights = weights;
    this.bias = bias;
    this.featureMean = featureMean;
    this.featureStd = featureStd;
    this.performance = {
      r2,
      rmse,
      trainCount: trainExamples.length,
      testCount: testExamples.length,
      testPoints,
    };
  }

  private predictFromFeatures(
    features: number[],
    featureMean: number[],
    featureStd: number[],
    weights: number[],
    bias: number,
  ): number {
    let score = bias;
    for (let j = 0; j < weights.length; j += 1) {
      const standardized = (features[j] - featureMean[j]) / featureStd[j];
      score += standardized * weights[j];
    }
    return score;
  }

  /** Predict promoter strength for a 35 bp sequence. */
  predict(sequence: string): number {
    this.train();
    const features = extractKmerFeatures(sequence);
    return this.predictFromFeatures(
      features,
      this.featureMean!,
      this.featureStd!,
      this.weights!,
      this.bias,
    );
  }

  /** Return the model's performance metrics on the held-out test set. */
  getPerformance(): ModelPerformance {
    this.train();
    return this.performance!;
  }

  /**
   * Return the top predictive 3-mers sorted by learned weight (descending).
   *
   * @param limit Maximum number of motifs to return.
   */
  getTopMotifs(limit = 10): MotifWeight[] {
    this.train();
    const motifs: MotifWeight[] = this.weights!.map((weight, index) => ({
      motif: indexToKmer(index),
      weight,
    }));
    motifs.sort((a, b) => b.weight - a.weight);
    return motifs.slice(0, limit);
  }

  /** Return the full trained weight vector (64 entries). */
  getWeights(): number[] {
    this.train();
    return [...this.weights!];
  }
}

/** Singleton model instance that trains once on first use. */
export const promoterModel = new PromoterModel();
