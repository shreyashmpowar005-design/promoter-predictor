import Section from "@/components/Section";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCountUp } from "@/hooks/useCountUp";
import { clearHistory, downloadCsv, getHistory } from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";
import {
  Download,
  History,
  Percent,
  Sigma,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

const BASE_CLASS: Record<string, string> = {
  A: "text-nuc-a",
  T: "text-nuc-t",
  G: "text-nuc-g",
  C: "text-nuc-c",
};

/** Render a DNA sequence with per-base nucleotide coloring. */
function SequenceCell({ sequence }: { sequence: string }) {
  return (
    <span className="font-mono text-xs tracking-tight">
      {sequence
        .split("")
        .map((base, i) => ({ base, key: `${base}-${i}` }))
        .map(({ base, key }) => (
          <span key={key} className={BASE_CLASS[base] ?? ""}>
            {base}
          </span>
        ))}
    </span>
  );
}

/** Render the detected motifs as compact badges. */
function MotifCell({ motifs }: { motifs: string[] }) {
  if (motifs.length === 0) {
    return (
      <span className="text-muted-foreground" aria-label="No motifs detected">
        —
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {motifs.map((motif) => (
        <span
          key={motif}
          className="rounded-full border bg-secondary px-2 py-0.5 text-xs font-medium"
        >
          {motif}
        </span>
      ))}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <Card className="shadow-subtle hover-lift">
      <CardContent className="flex items-start gap-4 pt-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="count-up mt-1 font-mono text-2xl font-semibold tracking-tight">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory());
  const reduceMotion = useReducedMotion();

  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    const totalScore = entries.reduce((sum, e) => sum + e.score * 100, 0);
    const totalGc = entries.reduce((sum, e) => sum + e.gcContent, 0);
    return {
      count: entries.length,
      avgScore: totalScore / entries.length,
      avgGc: totalGc / entries.length,
    };
  }, [entries]);

  const countValue = useCountUp(stats?.count ?? 0);
  const avgScoreValue = useCountUp(stats?.avgScore ?? 0);
  const avgGcValue = useCountUp(stats?.avgGc ?? 0);

  const handleClear = () => {
    clearHistory();
    setEntries([]);
  };

  const handleExport = () => {
    downloadCsv();
  };

  return (
    <Section
      title="Prediction History"
      subtitle="Every promoter strength prediction you have run is stored in your browser and listed here, newest first. Export the full record as a CSV file or clear it at any time."
    >
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total predictions"
            value={Math.round(countValue).toLocaleString()}
            hint="Stored in browser memory"
            icon={<Sigma className="size-5" />}
          />
          <StatCard
            label="Average predicted strength"
            value={`${avgScoreValue.toFixed(1)}%`}
            hint="Mean score across all entries"
            icon={<TrendingUp className="size-5" />}
          />
          <StatCard
            label="Average GC content"
            value={`${avgGcValue.toFixed(1)}%`}
            hint="Mean GC% across all entries"
            icon={<Percent className="size-5" />}
          />
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <History className="size-4 text-primary" />
              Stored predictions
            </CardTitle>
            <CardDescription>
              {entries.length === 0
                ? "No predictions recorded yet."
                : `${entries.length} prediction${entries.length === 1 ? "" : "s"} stored in browser memory.`}
            </CardDescription>
          </div>

          {entries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                data-ocid="history.export_button"
                className="press glow-hover"
              >
                <Download />
                Export as CSV
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    data-ocid="history.clear_button"
                    className="press glow-hover"
                  >
                    <Trash2 />
                    Clear history
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Clear prediction history?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove all {entries.length} stored
                      prediction{entries.length === 1 ? "" : "s"} from your
                      browser. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="history.clear_cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClear}
                      data-ocid="history.clear_confirm_button"
                    >
                      Clear history
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {entries.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center"
              data-ocid="history.empty_state"
            >
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                <History className="size-6 text-muted-foreground" />
              </div>
              <p className="font-display text-lg font-semibold">
                No predictions yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Run a promoter strength prediction from the Predict tab and it
                will appear here automatically. Use the hamburger menu to jump
                back to your most recent predictions at any time.
              </p>
            </div>
          ) : (
            <div className="-mx-6 overflow-x-auto px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-right">#</TableHead>
                    <TableHead>Sequence</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">GC%</TableHead>
                    <TableHead>Motif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, i) => (
                    <motion.tr
                      key={entry.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: reduceMotion ? 0 : i * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="transition-colors hover:bg-muted/60"
                    >
                      <TableCell
                        className="text-right font-mono text-muted-foreground"
                        data-ocid={`history.row.${i}`}
                      >
                        {i + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <SequenceCell sequence={entry.sequence} />
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-primary">
                        {Math.round(entry.score * 100)}%
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {entry.gcContent.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <MotifCell motifs={entry.motifs} />
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </Section>
  );
}
