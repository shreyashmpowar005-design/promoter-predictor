/**
 * DNA sequence utilities for the Synthetic Promoter Strength Predictor.
 *
 * Pure TypeScript, no React dependencies. Provides validation, GC-content
 * computation, promoter-motif detection, random sequence generation, TATA-box
 * insertion, and 3-mer feature extraction.
 */

import type { PromoterMotif } from "./types";

/** Canonical length of a promoter sequence used by the model. */
export const SEQUENCE_LENGTH = 35;

/** The four DNA bases accepted by the model. */
export const DNA_BASES = ["A", "T", "G", "C"] as const;

/** Recognized promoter motifs with their consensus patterns and roles. */
export const PROMOTER_MOTIFS: ReadonlyArray<{
  name: string;
  pattern: string;
  description: string;
}> = [
  {
    name: "TATA box",
    pattern: "TATAAT",
    description:
      "Core promoter element recognized by RNA polymerase; key determinant of promoter strength.",
  },
  {
    name: "-10 element",
    pattern: "TATAAT",
    description:
      "Pribnow box at the -10 position where the DNA duplex begins to open.",
  },
  {
    name: "-35 element",
    pattern: "TTGACA",
    description:
      "Consensus -35 element recognized by the sigma factor during promoter recognition.",
  },
  {
    name: "UP element",
    pattern: "AAAATTT",
    description:
      "Upstream element rich in A/T that enhances RNA polymerase binding.",
  },
  {
    name: "Extended -10",
    pattern: "TGNTATAAT",
    description:
      "Extended -10 element that compensates for a weak -35 element.",
  },
];

/**
 * Sanitize and validate a DNA sequence.
 *
 * - Trims surrounding whitespace.
 * - Uppercases lowercase input.
 * - Rejects any character other than A, T, G, C with a descriptive error.
 * - Enforces the canonical 35 bp length.
 *
 * @throws {Error} with a helpful message when the sequence is invalid.
 */
export function sanitizeSequence(input: string): string {
  const trimmed = input.trim().toUpperCase();
  if (trimmed.length === 0) {
    throw new Error("Sequence is empty. Enter a DNA sequence to analyze.");
  }
  const invalid = trimmed.match(/[^ATGC]/);
  if (invalid) {
    throw new Error(
      `Invalid character "${invalid[0]}" at position ${trimmed.indexOf(invalid[0]) + 1}. Only the DNA bases A, T, G, and C are accepted.`,
    );
  }
  if (trimmed.length !== SEQUENCE_LENGTH) {
    throw new Error(
      `Sequence must be exactly ${SEQUENCE_LENGTH} bp long; received ${trimmed.length} bp.`,
    );
  }
  return trimmed;
}

/** Compute the GC content of a sequence as a percentage (0-100). */
export function computeGcContent(sequence: string): number {
  if (sequence.length === 0) return 0;
  let gc = 0;
  for (const base of sequence) {
    if (base === "G" || base === "C") gc += 1;
  }
  return (gc / sequence.length) * 100;
}

/**
 * Detect known promoter motifs within a sequence.
 *
 * Returns every motif whose consensus pattern appears as a substring, with
 * start/end positions. The TATA box and -10 element share the same consensus
 * pattern, so both may be reported when the pattern is present.
 */
export function detectMotifs(sequence: string): PromoterMotif[] {
  const found: PromoterMotif[] = [];
  for (const motif of PROMOTER_MOTIFS) {
    let index = sequence.indexOf(motif.pattern);
    while (index !== -1) {
      found.push({
        name: motif.name,
        pattern: motif.pattern,
        description: motif.description,
        start: index,
        end: index + motif.pattern.length,
      });
      index = sequence.indexOf(motif.pattern, index + 1);
    }
  }
  return found;
}

/** A small deterministic PRNG (mulberry32) for reproducible sequence generation. */
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

/**
 * Generate a random 35 bp DNA sequence.
 *
 * @param seed Optional seed for deterministic output. When omitted, a random
 *   seed is used.
 */
export function generateRandomSequence(seed?: number): string {
  const rand = mulberry32(seed ?? Math.floor(Math.random() * 2 ** 31));
  let sequence = "";
  for (let i = 0; i < SEQUENCE_LENGTH; i += 1) {
    sequence += DNA_BASES[Math.floor(rand() * DNA_BASES.length)];
  }
  return sequence;
}

/**
 * Insert a TATA box motif into a sequence at the canonical -10 position.
 *
 * The TATAAT consensus is placed near the 3' end (positions 24-29 of a 35 bp
 * sequence), approximating the -10 element location relative to the
 * transcription start site.
 */
export function insertTataMotif(sequence: string): string {
  const sanitized = sanitizeSequence(sequence);
  const tata = "TATAAT";
  const start = SEQUENCE_LENGTH - 11; // positions 24-29
  return (
    sanitized.slice(0, start) + tata + sanitized.slice(start + tata.length)
  );
}

/**
 * Extract a 64-dimensional 3-mer feature vector from a sequence.
 *
 * A 35 bp sequence contains 33 overlapping 3-mers. Each 3-mer is one of 4³ =
 * 64 possible combinations. The feature vector counts the occurrences of each
 * 3-mer in the sequence (a count vector), indexed by a deterministic mapping
 * from the 3-mer string to an integer 0-63.
 */
export function extractKmerFeatures(sequence: string): number[] {
  const sanitized = sanitizeSequence(sequence);
  const features = new Array<number>(64).fill(0);
  for (let i = 0; i <= sanitized.length - 3; i += 1) {
    const kmer = sanitized.slice(i, i + 3);
    features[kmerToIndex(kmer)] += 1;
  }
  return features;
}

/** Map a 3-mer string to its 0-63 feature index deterministically. */
export function kmerToIndex(kmer: string): number {
  let index = 0;
  for (let i = 0; i < 3; i += 1) {
    const base = kmer[i];
    const value = base === "A" ? 0 : base === "T" ? 1 : base === "G" ? 2 : 3;
    index = index * 4 + value;
  }
  return index;
}

/** Map a 0-63 feature index back to its 3-mer string. */
export function indexToKmer(index: number): string {
  let value = index;
  let kmer = "";
  for (let i = 0; i < 3; i += 1) {
    const digit = value % 4;
    kmer =
      (digit === 0 ? "A" : digit === 1 ? "T" : digit === 2 ? "G" : "C") + kmer;
    value = Math.floor(value / 4);
  }
  return kmer;
}
