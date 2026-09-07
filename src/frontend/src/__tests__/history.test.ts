import {
  addPrediction,
  clearHistory,
  exportCsv,
  getHistory,
  getRecents,
  removePrediction,
} from "@/lib/history";
import { beforeEach, describe, expect, it } from "vitest";

const SEQ_A = "TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC";
const SEQ_B = "TTTACAGCTAGCTCAGTCCTAGGTATTATGCTAGC";

describe("history store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", () => {
    expect(getHistory()).toEqual([]);
  });

  it("adds a prediction and returns the created entry", () => {
    const entry = addPrediction({
      sequence: SEQ_A,
      score: 0.75,
      gcContent: 48.6,
      motifs: ["TATA box"],
    });
    expect(entry.sequence).toBe(SEQ_A);
    expect(entry.score).toBe(0.75);
    expect(entry.gcContent).toBe(48.6);
    expect(entry.motifs).toEqual(["TATA box"]);
    expect(entry.id).toBeTruthy();
    expect(entry.timestamp).toBeTruthy();
    expect(getHistory()).toHaveLength(1);
  });

  it("prepends newest entries first", () => {
    addPrediction({ sequence: SEQ_A, score: 0.5, gcContent: 40, motifs: [] });
    addPrediction({ sequence: SEQ_B, score: 0.9, gcContent: 50, motifs: [] });
    const history = getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].sequence).toBe(SEQ_B);
  });

  it("persists across reads via localStorage", () => {
    addPrediction({ sequence: SEQ_A, score: 0.5, gcContent: 40, motifs: [] });
    // A fresh read reflects the persisted state.
    expect(getHistory()).toHaveLength(1);
    expect(getRecents(5)).toHaveLength(1);
  });

  it("removes a single prediction by id", () => {
    const a = addPrediction({
      sequence: SEQ_A,
      score: 0.5,
      gcContent: 40,
      motifs: [],
    });
    addPrediction({ sequence: SEQ_B, score: 0.9, gcContent: 50, motifs: [] });
    const remaining = removePrediction(a.id);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].sequence).toBe(SEQ_B);
  });

  it("clears all history", () => {
    addPrediction({ sequence: SEQ_A, score: 0.5, gcContent: 40, motifs: [] });
    clearHistory();
    expect(getHistory()).toEqual([]);
  });

  it("exports history as CSV with a header row", () => {
    addPrediction({
      sequence: SEQ_A,
      score: 0.75,
      gcContent: 48.6,
      motifs: ["TATA box", "-10 element"],
    });
    const csv = exportCsv();
    const lines = csv.split("\n");
    expect(lines[0]).toBe("sequence,score,gcContent,motifs,timestamp");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain(SEQ_A);
    expect(lines[1]).toContain("0.75");
    expect(lines[1]).toContain("TATA box;-10 element");
  });

  it("exports an empty CSV with only the header when no history exists", () => {
    const csv = exportCsv();
    expect(csv.split("\n")).toEqual([
      "sequence,score,gcContent,motifs,timestamp",
    ]);
  });
});
