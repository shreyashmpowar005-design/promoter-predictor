/**
 * Shared types for the Synthetic Promoter Strength Predictor.
 *
 * These types are pure data contracts shared across the ML library, sequence
 * utilities, real-data validation set, and the prediction history store. They
 * carry no React or backend dependencies so they can be unit-tested in
 * isolation.
 */

/** A recognized promoter motif detected within a sequence. */
export interface PromoterMotif {
  /** Human-readable name, e.g. "TATA box". */
  name: string;
  /** The consensus DNA pattern matched, e.g. "TATAAT". */
  pattern: string;
  /** Short scientific description of the motif's role. */
  description: string;
  /** 0-based start index of the match within the sequence. */
  start: number;
  /** 0-based end index (exclusive) of the match within the sequence. */
  end: number;
}

/** The result of running a sequence through the trained model. */
export interface PredictionResult {
  /** The sanitized, uppercase 35 bp sequence that was scored. */
  sequence: string;
  /** Predicted promoter strength (arbitrary relative units). */
  score: number;
  /** GC content of the sequence as a percentage (0-100). */
  gcContent: number;
  /** Promoter motifs detected in the sequence. */
  motifs: PromoterMotif[];
  /** ISO timestamp of when the prediction was made. */
  timestamp: string;
}

/** A single point on the held-out test set for predicted-vs-actual plots. */
export interface TestPoint {
  /** True strength label from the synthetic training data. */
  actual: number;
  /** Model-predicted strength. */
  predicted: number;
}

/** Performance metrics reported by the trained demo model. */
export interface ModelPerformance {
  /** Coefficient of determination (R²) on the held-out test set. */
  r2: number;
  /** Root mean squared error on the held-out test set. */
  rmse: number;
  /** Number of sequences used for training. */
  trainCount: number;
  /** Number of sequences held out for testing. */
  testCount: number;
  /** Predicted-vs-actual points on the held-out test set. */
  testPoints: TestPoint[];
}

/** A learned 3-mer feature and its regression weight. */
export interface MotifWeight {
  /** The 3-mer sequence, e.g. "TAT". */
  motif: string;
  /** Learned regression weight for this 3-mer feature. */
  weight: number;
}

/** A single entry in the browser-local prediction history. */
export interface HistoryEntry {
  /** Unique id for the entry. */
  id: string;
  /** The sequence that was predicted. */
  sequence: string;
  /** Predicted promoter strength. */
  score: number;
  /** GC content percentage (0-100). */
  gcContent: number;
  /** Names of detected motifs, e.g. ["TATA box"]. */
  motifs: string[];
  /** ISO timestamp of the prediction. */
  timestamp: string;
}

/** A real promoter from the embedded Anderson Promoter Library. */
export interface AndersonPromoter {
  /** Anderson series identifier, e.g. "BBa_J23100". */
  id: string;
  /** The 35 bp promoter sequence. */
  sequence: string;
  /** Measured relative expression strength (arbitrary units). */
  strength: number;
  /** Short description of the promoter. */
  description: string;
}
