import Section from "@/components/Section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCountUp } from "@/hooks/useCountUp";
import { getAndersonPromoters } from "@/lib/anderson";
import { pearsonCorrelation, promoterModel } from "@/lib/ml";
import type { AndersonPromoter } from "@/lib/types";
import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BASE_CLASS: Record<string, string> = {
  A: "text-nuc-a",
  T: "text-nuc-t",
  G: "text-nuc-g",
  C: "text-nuc-c",
};

interface ValidationPoint {
  id: string;
  measured: number;
  predicted: number;
}

/** Min-max normalize an array to the 0-1 range for display comparability. */
function normalizeToUnit(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  if (span === 0) return values.map(() => 0.5);
  return values.map((v) => (v - min) / span);
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function SequenceCell({ sequence }: { sequence: string }) {
  return (
    <span className="font-mono text-xs leading-relaxed">
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

export default function RealDataPage() {
  const reduceMotion = useReducedMotion();

  const { promoters, points, correlation, meanMeasured, meanPredicted } =
    useMemo(() => {
      const promoters: AndersonPromoter[] = getAndersonPromoters();
      const measured = promoters.map((p) => p.strength);
      const rawPredicted = promoters.map((p) =>
        promoterModel.predict(p.sequence),
      );
      const predicted = normalizeToUnit(rawPredicted);

      const points: ValidationPoint[] = promoters.map((p, i) => ({
        id: p.id,
        measured: p.strength,
        predicted: predicted[i],
      }));

      return {
        promoters,
        points,
        correlation: pearsonCorrelation(measured, predicted),
        meanMeasured: mean(measured),
        meanPredicted: mean(predicted),
      };
    }, []);

  const countPromoters = useCountUp(promoters.length);
  const countCorrelation = useCountUp(correlation);
  const countMeasured = useCountUp(meanMeasured);
  const countPredicted = useCountUp(meanPredicted);

  return (
    <div className="space-y-8">
      <Section
        title="Real Data Validation"
        subtitle="Validate the synthetic model against the embedded Anderson Promoter Library — a curated set of real E. coli promoter sequences with experimentally measured relative expression strengths."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" data-ocid="data_type_badge.synthetic">
            Synthetic training data
          </Badge>
          <span className="text-muted-foreground">vs</span>
          <Badge data-ocid="data_type_badge.real">
            Real experimental validation data
          </Badge>
        </div>
      </Section>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="hover-lift glow-hover shadow-subtle"
          data-ocid="stat_card.promoters"
        >
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Real promoters tested
            </p>
            <p className="count-up mt-2 font-display text-3xl font-bold text-gradient">
              {Math.round(countPromoters)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Anderson series BBa_J23100–J23119
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover-lift glow-hover shadow-subtle"
          data-ocid="stat_card.correlation"
        >
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pearson correlation
            </p>
            <p className="count-up mt-2 font-display text-3xl font-bold text-gradient">
              {countCorrelation.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              measured vs model predicted
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover-lift glow-hover shadow-subtle"
          data-ocid="stat_card.measured"
        >
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mean measured strength
            </p>
            <p className="count-up mt-2 font-display text-3xl font-bold">
              {countMeasured.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              relative expression units
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover-lift glow-hover shadow-subtle"
          data-ocid="stat_card.predicted"
        >
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mean predicted strength
            </p>
            <p className="count-up mt-2 font-display text-3xl font-bold">
              {countPredicted.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              normalized model output
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scatter plot */}
      <Card
        className="hover-lift glow-hover shadow-subtle"
        data-ocid="scatter_card"
      >
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Measured vs predicted strength
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Each point is a real Anderson promoter. The dashed line marks the
            ideal 1:1 agreement.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                />
                <XAxis
                  type="number"
                  dataKey="measured"
                  name="Measured"
                  domain={[0, 1]}
                  tickCount={6}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => v.toFixed(1)}
                  label={{
                    value: "Measured strength (relative units)",
                    position: "insideBottom",
                    offset: -12,
                    fontSize: 12,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="predicted"
                  name="Predicted"
                  domain={[0, 1]}
                  tickCount={6}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => v.toFixed(1)}
                  label={{
                    value: "Model predicted (normalized)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fontSize: 12,
                  }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0].payload as ValidationPoint;
                    return (
                      <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                        <p className="font-medium">{point.id}</p>
                        <p className="mt-1 text-muted-foreground">
                          Measured:{" "}
                          <span className="font-mono text-foreground">
                            {point.measured.toFixed(3)}
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          Predicted:{" "}
                          <span className="font-mono text-foreground">
                            {point.predicted.toFixed(3)}
                          </span>
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  segment={[
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                  ]}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                />
                <Scatter
                  data={points}
                  fill="var(--chart-1)"
                  fillOpacity={0.75}
                  isAnimationActive={!reduceMotion}
                  animationBegin={200}
                  animationDuration={900}
                  animationEasing="ease-out"
                  data-ocid="chart_point"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed promoter table */}
      <Card
        className="hover-lift glow-hover shadow-subtle"
        data-ocid="promoter_table_card"
      >
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Detailed promoter table
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real Anderson promoters with measured and model-predicted strength.
            Scroll horizontally on small screens.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sequence (35 bp)</TableHead>
                  <TableHead className="text-right">Measured</TableHead>
                  <TableHead className="text-right">Predicted</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoters.map((p, i) => {
                  const point = points[i];
                  return (
                    <motion.tr
                      key={p.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                        delay: reduceMotion ? 0 : 0.1 + i * 0.04,
                      }}
                      className="hover-lift glow-hover cursor-default"
                      data-ocid={`promoter.row.${i + 1}`}
                    >
                      <TableCell className="font-mono font-medium">
                        {p.id}
                      </TableCell>
                      <TableCell>
                        <SequenceCell sequence={p.sequence} />
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {p.strength.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {point.predicted.toFixed(3)}
                      </TableCell>
                      <TableCell className="max-w-56 whitespace-normal text-muted-foreground">
                        {p.description}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Honest limitation statement */}
      <Card
        className="border-warning/40 bg-warning/5"
        data-ocid="limitation_card"
      >
        <CardContent className="space-y-3 pt-6">
          <h3 className="font-display text-lg font-semibold">
            Honest limitation statement
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The Anderson Promoter Library provides only {promoters.length} real,
            experimentally measured promoters. This is a small validation set
            and should be treated as a <strong>check</strong> on the synthetic
            model's behavior — not as a full independent training dataset. The
            model itself was trained entirely on <strong>synthetic</strong>,
            procedurally generated sequences, so its agreement with real data
            here is indicative but not conclusive. Robust conclusions would
            require a substantially larger, independent experimental dataset
            spanning diverse promoter architectures.
          </p>
          <p className="text-xs text-muted-foreground">
            Pearson correlation (r = {correlation.toFixed(3)}) quantifies the
            linear agreement between measured and predicted strength across this
            small set.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
