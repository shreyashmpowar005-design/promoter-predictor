/**
 * Browser-localStorage-backed prediction history store.
 *
 * Pure TypeScript with no React dependencies. Persists prediction history to
 * localStorage so it survives page reloads. Provides add, list, clear, and CSV
 * export operations plus a recents list.
 */

import type { HistoryEntry } from "./types";

const STORAGE_KEY = "promoter-predictor.history.v1";
const MAX_ENTRIES = 100;

/** Read the current history from localStorage. */
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persist the given history to localStorage. */
function persist(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage may be unavailable (e.g. private mode); fail silently.
  }
}

/** Generate a unique id for a history entry. */
function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Add a prediction to history and return the created entry.
 *
 * Newest entries are prepended. The store is capped at MAX_ENTRIES.
 */
export function addPrediction(input: {
  sequence: string;
  score: number;
  gcContent: number;
  motifs: string[];
}): HistoryEntry {
  const entry: HistoryEntry = {
    id: makeId(),
    sequence: input.sequence,
    score: input.score,
    gcContent: input.gcContent,
    motifs: input.motifs,
    timestamp: new Date().toISOString(),
  };
  const entries = [entry, ...getHistory()].slice(0, MAX_ENTRIES);
  persist(entries);
  return entry;
}

/** Remove a single history entry by id. */
export function removePrediction(id: string): HistoryEntry[] {
  const entries = getHistory().filter((entry) => entry.id !== id);
  persist(entries);
  return entries;
}

/** Clear all prediction history. */
export function clearHistory(): void {
  persist([]);
}

/** Return the most recent `count` history entries. */
export function getRecents(count = 5): HistoryEntry[] {
  return getHistory().slice(0, count);
}

/** Export the full history as a CSV string. */
export function exportCsv(): string {
  const header = "sequence,score,gcContent,motifs,timestamp";
  const rows = getHistory().map((entry) => {
    const motifs = entry.motifs.join(";");
    return [
      entry.sequence,
      entry.score,
      entry.gcContent,
      motifs,
      entry.timestamp,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");
  });
  return [header, ...rows].join("\n");
}

/** Trigger a browser download of the history as a CSV file. */
export function downloadCsv(filename = "promoter-predictions.csv"): void {
  if (typeof window === "undefined") return;
  const csv = exportCsv();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
