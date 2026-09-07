import Section from "@/components/Section";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { promoterModel } from "@/lib/ml";
import type { MotifWeight } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

/**
 * 3-mers that resemble TATA-box / -10-element-like core promoter patterns in
 * the demo model. These are highlighted in the table to draw attention to the
 * A/T-rich motifs the model associates with strong promoter activity.
 */
const PROMOTER_LIKE_MOTIFS = new Set(["TAT", "ATA", "AAT", "TAA"]);

/** Human-readable explanation shown in the tooltip for each highlighted motif. */
const MOTIF_EXPLANATIONS: Record<string, string> = {
  TAT: "A/T-rich core-promoter-like pattern; resembles the TATA box / -10 element consensus.",
  ATA: "A/T-rich core-promoter-like pattern; resembles the TATA box / -10 element consensus.",
  AAT: "A/T-rich core-promoter-like pattern; resembles the TATA box / -10 element consensus.",
  TAA: "A/T-rich core-promoter-like pattern; resembles the TATA box / -10 element consensus.",
};

function formatWeight(weight: number): string {
  return weight >= 0 ? `+${weight.toFixed(3)}` : weight.toFixed(3);
}

export default function MotifsPage() {
  const motifs = useMemo<MotifWeight[]>(
    () => promoterModel.getTopMotifs(10),
    [],
  );

  // Scale bars against the largest absolute weight so the strongest motif
  // fills the track and weaker ones are proportionally shorter.
  const maxAbsWeight = useMemo(
    () => Math.max(...motifs.map((m) => Math.abs(m.weight)), 1e-6),
    [motifs],
  );

  // Treat null (SSR / first render) as "animate" so the entrance still plays.
  const reduceMotion = useReducedMotion() === true;

  return (
    <Section
      title="Top Predictive 3-mers"
      subtitle="The 3-nucleotide features the demo model learned to associate with promoter strength, ranked by their learned regression weight. Positive weights indicate motifs that boost predicted strength; negative weights indicate motifs that suppress it."
    >
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Learned motif weights
          </CardTitle>
          <CardDescription>
            Sorted by learned weight (descending). Highlighted motifs resemble
            TATA-box / -10-element-like core promoter patterns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Motif</TableHead>
                <TableHead className="w-[30%] text-right">
                  Learned Weight
                </TableHead>
                <TableHead className="w-[40%]">Visualization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {motifs.map((motif, index) => {
                const isPromoterLike = PROMOTER_LIKE_MOTIFS.has(motif.motif);
                const isPositive = motif.weight >= 0;
                const width = `${Math.max(
                  6,
                  (Math.abs(motif.weight) / maxAbsWeight) * 100,
                )}%`;

                return (
                  <motion.tr
                    key={motif.motif}
                    data-ocid={`motifs.row.${index + 1}`}
                    className="group transition-colors hover:bg-muted/50"
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, y: 10, backgroundColor: "transparent" }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: reduceMotion ? 0 : index * 0.07,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              data-ocid={`motifs.motif.${index + 1}`}
                              className="font-mono text-sm font-semibold tracking-wide"
                            >
                              {motif.motif}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isPromoterLike
                              ? MOTIF_EXPLANATIONS[motif.motif]
                              : `Learned regression weight of ${formatWeight(motif.weight)} for this 3-mer feature.`}
                          </TooltipContent>
                        </Tooltip>
                        {isPromoterLike && (
                          <Badge
                            variant="secondary"
                            className="bg-accent/15 text-accent-foreground"
                          >
                            Core promoter-like
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatWeight(motif.weight)}
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex h-5 w-full min-w-0 items-center"
                        aria-label={`Visualization of weight ${formatWeight(motif.weight)}`}
                      >
                        <motion.div
                          data-ocid={`motifs.bar.${index + 1}`}
                          className={cn(
                            "h-3 origin-left rounded-full",
                            isPositive ? "bg-gauge-strong" : "bg-gauge-weak",
                          )}
                          style={{ width }}
                          initial={reduceMotion ? false : { scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            delay: reduceMotion ? 0 : index * 0.07 + 0.15,
                            duration: 0.6,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-gradient-subtle shadow-subtle">
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Why these motifs matter:
            </span>{" "}
            The highlighted A/T-rich 3-mers (TAT, ATA, AAT, TAA) resemble the
            TATA box and -10 element (Pribnow box) consensus sequences that
            recruit RNA polymerase during transcription initiation. In this demo
            model, these core-promoter-like patterns carry some of the highest
            learned weights, consistent with their known role as key
            determinants of promoter strength. This is a synthetic model trained
            on simulated data — not a validated experimental result.
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}
