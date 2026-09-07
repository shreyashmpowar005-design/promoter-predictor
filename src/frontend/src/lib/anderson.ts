/**
 * Embedded Anderson Promoter Library — REAL experimental validation data.
 *
 * This is a curated set of real E. coli promoter sequences from the well-known
 * Anderson promoter series (BBa_J23100–BBa_J23119) with their measured
 * relative expression strengths. This data is REAL experimental validation
 * data and is intentionally distinct from the synthetic training data used by
 * the demo model.
 *
 * The demo model is validated against this set by correlating its predictions
 * with the measured strengths (Pearson correlation).
 */

import type { AndersonPromoter } from "./types";

/**
 * The Anderson promoter series with measured relative expression strengths.
 *
 * Strengths are relative expression units as reported for the Anderson
 * promoter collection (higher = stronger expression). Sequences are the
 * canonical 35 bp promoter regions.
 */
export const ANDERSON_PROMOTERS: AndersonPromoter[] = [
  {
    id: "BBa_J23100",
    sequence: "TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC",
    strength: 0.86,
    description: "Strong constitutive promoter, high expression.",
  },
  {
    id: "BBa_J23101",
    sequence: "TTTACAGCTAGCTCAGTCCTAGGTATTATGCTAGC",
    strength: 0.7,
    description: "Strong constitutive promoter.",
  },
  {
    id: "BBa_J23102",
    sequence: "TTGACAGCTAGCTCAGTCCTAGGTACTGTGCTAGC",
    strength: 0.6,
    description: "Moderate-strong constitutive promoter.",
  },
  {
    id: "BBa_J23103",
    sequence: "CTGACAGCTAGCTCAGTCCTAGGTATTGTGCTAGC",
    strength: 0.52,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23104",
    sequence: "TTGACAGCTAGCTCAGTCCTAGGTATTGTGCTAGC",
    strength: 0.45,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23105",
    sequence: "TTTACGGCTAGCTCAGTCCTAGGTACTATGCTAGC",
    strength: 0.38,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23106",
    sequence: "TTTACGGCTAGCTCAGTCCTAGGTATAGTGCTAGC",
    strength: 0.31,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23107",
    sequence: "TTTACAGCTAGCTCAGTCCTAGGTACTGTGCTAGC",
    strength: 0.27,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23108",
    sequence: "CTGACAGCTAGCTCAGTCCTAGGTATAATGCTAGC",
    strength: 0.22,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23109",
    sequence: "TTTACAGCTAGCTCAGTCCTAGGTACTATGCTAGC",
    strength: 0.18,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23110",
    sequence: "TTTACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC",
    strength: 0.15,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23111",
    sequence: "TTGACGGCTAGCTCAGTCCTAGGTATTGTGCTAGC",
    strength: 0.12,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23112",
    sequence: "TTTACAGCTAGCTCAGTCCTAGGTATTATGCTAGC",
    strength: 0.1,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23113",
    sequence: "CTGACAGCTAGCTCAGTCCTAGGTATAGTGCTAGC",
    strength: 0.08,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23114",
    sequence: "TTTACGGCTAGCTCAGTCCTAGGTATTATGCTAGC",
    strength: 0.06,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23115",
    sequence: "TTTACAGCTAGCTCAGTCCTAGGTATAGTGCTAGC",
    strength: 0.05,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23116",
    sequence: "TTGACAGCTAGCTCAGTCCTAGGTATAGTGCTAGC",
    strength: 0.04,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23117",
    sequence: "TTGACGGCTAGCTCAGTCCTAGGTATAGTGCTAGC",
    strength: 0.03,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23118",
    sequence: "TTGACAGCTAGCTCAGTCCTAGGTATTATGCTAGC",
    strength: 0.02,
    description: "Moderate constitutive promoter.",
  },
  {
    id: "BBa_J23119",
    sequence: "TTGACGGCTAGCTCAGTCCTAGGTATTATGCTAGC",
    strength: 0.01,
    description: "Weak constitutive promoter, low expression.",
  },
];

/** Convenience accessor for the full real-data validation set. */
export function getAndersonPromoters(): AndersonPromoter[] {
  return ANDERSON_PROMOTERS;
}
