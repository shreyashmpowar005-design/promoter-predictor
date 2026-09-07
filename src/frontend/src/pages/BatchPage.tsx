import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { promoterModel } from "@/lib/ml";
import { sanitizeSequence } from "@/lib/sequence";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

interface BatchResult {
  rank: number;
  sequence: string;
  score: number;
}

interface InvalidEntry {
  index: number;
  raw: string;
  message: string;
}

/** Split raw pasted text into candidate sequence lines, ignoring FASTA headers. */
function parseLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith(">"));
}

/** Read an uploaded file's text content. */
function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(new Error("Unable to read the selected file."));
    reader.readAsText(file);
  });
}

export default function BatchPage() {
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [invalid, setInvalid] = useState<InvalidEntry[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const content = await readFile(file);
      setInput(content);
      setFileName(file.name);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to read the file.");
    }
  };

  const handlePredict = () => {
    const lines = parseLines(input);
    if (lines.length === 0) {
      setError(
        "No sequences found. Paste one sequence per line or upload a .fasta, .fa, or .txt file.",
      );
      setResults([]);
      setInvalid([]);
      setProcessedCount(0);
      return;
    }

    const valid: BatchResult[] = [];
    const flagged: InvalidEntry[] = [];

    lines.forEach((line, index) => {
      try {
        const sanitized = sanitizeSequence(line);
        const score = promoterModel.predict(sanitized);
        valid.push({ rank: 0, sequence: sanitized, score });
      } catch (e) {
        flagged.push({
          index: index + 1,
          raw: line,
          message: e instanceof Error ? e.message : "Invalid sequence.",
        });
      }
    });

    valid.sort((a, b) => b.score - a.score);
    valid.forEach((entry, i) => {
      entry.rank = i + 1;
    });

    setResults(valid);
    setInvalid(flagged);
    setProcessedCount(valid.length);
    setError(null);
  };

  const handleClear = () => {
    setInput("");
    setFileName(null);
    setResults([]);
    setInvalid([]);
    setProcessedCount(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-10">
      <Section
        title="Batch & FASTA prediction"
        subtitle="Score multiple 35 bp promoter sequences at once. Paste sequences one per line, or upload a .fasta, .fa, or .txt file — FASTA header lines beginning with '>' are ignored automatically."
      >
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="batch-sequences">Sequences (one per line)</Label>
              <Textarea
                id="batch-sequences"
                data-ocid="batch.textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  "ATGCGTTACGTAGCTAGCTAGCTAGCTAGCTAGCTA\nTTGACATATAATGCGCTAGCTAGCTAGCTAGCTAGCTA"
                }
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                data-ocid="batch.predict_button"
                onClick={handlePredict}
                className="press glow-hover"
              >
                Predict batch
              </Button>
              <Button
                type="button"
                variant="outline"
                data-ocid="batch.clear_button"
                onClick={handleClear}
                className="press glow-hover"
              >
                Clear
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".fasta,.fa,.txt"
                data-ocid="batch.upload_input"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
                id="batch-file"
              />
              <Label
                htmlFor="batch-file"
                className="cursor-pointer rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Upload file
              </Label>
              {fileName && (
                <span className="text-sm text-muted-foreground">
                  Loaded: {fileName}
                </span>
              )}
            </div>

            {error && (
              <p
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                data-ocid="batch.error_state"
              >
                {error}
              </p>
            )}
          </CardContent>
        </Card>
      </Section>

      {results.length > 0 && (
        <Section
          title="Ranked results"
          subtitle="Predicted promoter strength, ranked from strongest to weakest."
        >
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {processedCount}
                  </span>{" "}
                  sequence{processedCount === 1 ? "" : "s"} scored
                  {invalid.length > 0 && (
                    <span className="text-warning">
                      {" "}
                      · {invalid.length} invalid skipped
                    </span>
                  )}
                </p>
                <span
                  className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  data-ocid="batch.synthetic_label"
                >
                  Synthetic / demo model estimates
                </span>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">Rank</TableHead>
                      <TableHead>Sequence</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((entry, index) => (
                      <motion.tr
                        key={entry.rank}
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1],
                          delay: reduceMotion ? 0 : index * 0.05,
                        }}
                        className="hover-lift glow-hover cursor-default"
                      >
                        <TableCell className="text-center font-mono text-muted-foreground">
                          {entry.rank}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {entry.sequence}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {entry.score.toFixed(3)}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </Section>
      )}

      {invalid.length > 0 && (
        <Section
          title="Skipped sequences"
          subtitle="The following entries could not be scored and were excluded from the ranking."
        >
          <Card>
            <CardContent className="space-y-3 pt-6">
              {invalid.map((entry) => (
                <div
                  key={entry.index}
                  className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm"
                  data-ocid={`batch.invalid.${entry.index}`}
                >
                  <p className="font-medium text-warning">
                    Line {entry.index}: {entry.message}
                  </p>
                  <p className="mt-0.5 break-all font-mono text-xs text-muted-foreground">
                    {entry.raw}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>
      )}
    </div>
  );
}
