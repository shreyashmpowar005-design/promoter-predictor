import {
  SEQUENCE_LENGTH,
  computeGcContent,
  detectMotifs,
  extractKmerFeatures,
  generateRandomSequence,
  indexToKmer,
  insertTataMotif,
  kmerToIndex,
  sanitizeSequence,
} from "@/lib/sequence";
import { describe, expect, it } from "vitest";

const VALID_35BP = "TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC";

describe("sanitizeSequence", () => {
  it("uppercases lowercase input and trims whitespace", () => {
    expect(sanitizeSequence(`  ${VALID_35BP.toLowerCase()}  `)).toBe(
      VALID_35BP,
    );
  });

  it("rejects an empty sequence", () => {
    expect(() => sanitizeSequence("   ")).toThrow(/empty/i);
  });

  it("rejects characters other than A/T/G/C with a descriptive error", () => {
    const bad = `${VALID_35BP.slice(0, 10)}N${VALID_35BP.slice(11)}`;
    expect(() => sanitizeSequence(bad)).toThrow(/invalid character "N"/i);
  });

  it("rejects sequences that are not exactly 35 bp", () => {
    expect(() => sanitizeSequence(VALID_35BP.slice(0, 34))).toThrow(
      /exactly 35 bp/i,
    );
    expect(() => sanitizeSequence(`${VALID_35BP}A`)).toThrow(/exactly 35 bp/i);
  });
});

describe("computeGcContent", () => {
  it("returns 0 for an empty sequence", () => {
    expect(computeGcContent("")).toBe(0);
  });

  it("computes the GC percentage", () => {
    // "GC" -> 100%
    expect(computeGcContent("GC")).toBe(100);
    // "AT" -> 0%
    expect(computeGcContent("AT")).toBe(0);
    // "GCTA" -> 2 of 4 = 50%
    expect(computeGcContent("GCTA")).toBe(50);
  });
});

describe("generateRandomSequence", () => {
  it("produces a 35 bp sequence of only A/T/G/C", () => {
    const seq = generateRandomSequence(12345);
    expect(seq).toHaveLength(SEQUENCE_LENGTH);
    expect(seq).toMatch(/^[ATGC]+$/);
  });

  it("is deterministic for a given seed", () => {
    expect(generateRandomSequence(42)).toBe(generateRandomSequence(42));
  });
});

describe("insertTataMotif", () => {
  it("inserts the TATAAT consensus at the canonical -10 position", () => {
    const result = insertTataMotif(VALID_35BP);
    expect(result).toHaveLength(SEQUENCE_LENGTH);
    // TATAAT placed at positions 24-29 (0-based start 24).
    expect(result.slice(24, 30)).toBe("TATAAT");
  });

  it("sanitizes the input before inserting", () => {
    const result = insertTataMotif(VALID_35BP.toLowerCase());
    expect(result).toHaveLength(SEQUENCE_LENGTH);
    expect(result.slice(24, 30)).toBe("TATAAT");
  });
});

describe("kmer feature extraction", () => {
  it("produces a 64-dimensional count vector", () => {
    const features = extractKmerFeatures(VALID_35BP);
    expect(features).toHaveLength(64);
    // 35 bp -> 33 overlapping 3-mers.
    expect(features.reduce((sum, v) => sum + v, 0)).toBe(33);
  });

  it("maps kmer strings to indices and back", () => {
    expect(kmerToIndex("AAA")).toBe(0);
    expect(indexToKmer(0)).toBe("AAA");
    expect(indexToKmer(kmerToIndex("TAT"))).toBe("TAT");
  });
});

describe("detectMotifs", () => {
  it("detects a TATA box when the consensus is present", () => {
    const withTata = insertTataMotif(VALID_35BP);
    const motifs = detectMotifs(withTata);
    expect(motifs.some((m) => m.name === "TATA box")).toBe(true);
  });

  it("returns an empty array when no motifs are present", () => {
    // A sequence with no known consensus pattern.
    const noMotif = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    expect(detectMotifs(noMotif)).toEqual([]);
  });
});
