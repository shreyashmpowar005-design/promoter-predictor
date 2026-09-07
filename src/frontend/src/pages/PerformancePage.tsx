import Section from "@/components/Section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useCountUp } from "@/hooks/useCountUp";
import { promoterModel } from "@/lib/ml";
import type { ModelPerformance } from "@/lib/types";
import { Activity, FlaskConical, Gauge, Ruler } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  predicted: {
    label: "Predicted strength",
    color: "var(--chart-1)",
  },
} as const;

interface StatCardProps {
  label: string;
  value: number;
  format: (value: number) => string;
  hint: string;
  icon: React.ReactNode;
  ocid: string;
  delay: number;
}

function StatCard({
  label,
  value,
  format,
  hint,
  icon,
  ocid,
  delay,
}: StatCardProps) {
  const reduceMotion = useReducedMotion();
  const animated = useCountUp(value);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <Card className="hover-lift glow-hover shadow-subtle" data-ocid={ocid}>
        <CardContent className="flex items-start gap-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="count-up mt-1 font-mono text-2xl font-semibold tracking-tight">
              {format(animated)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PerformancePage() {
  const reduceMotion = useReducedMotion();
  const performance: ModelPerformance = useMemo(
    () => promoterModel.getPerformance(),
    [],
  );

  const testPoints = useMemo(
    () =>
      performance.testPoints.map((point, index) => ({
        ...point,
        id: index,
      })),
    [performance],
  );

  return (
    <div className="space-y-8">
      <Section
        title="Model performance"
        subtitle="How the in-browser regression model performs on a held-out test set of synthetic promoter sequences."
      >
        {/* Training status */}
        <Card className="bg-gradient-subtle shadow-subtle">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gauge-strong/15 text-gauge-strong">
                <Activity className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  Model trained
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Trained in-browser on ~500 synthetic sequences using 3-mer
                  feature extraction and ridge-regularized linear regression.
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-gauge-strong/15 px-3 py-1 text-sm font-medium text-gauge-strong">
              <span className="size-2 rounded-full bg-gauge-strong" />
              Ready
            </span>
          </CardContent>
        </Card>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Coefficient of determination (R²)"
            value={performance.r2}
            format={(v) => v.toFixed(3)}
            hint="Variance explained on the held-out test set"
            icon={<Gauge className="size-5" />}
            ocid="stat_card.r2"
            delay={0.05}
          />
          <StatCard
            label="Root mean squared error (RMSE)"
            value={performance.rmse}
            format={(v) => v.toFixed(3)}
            hint="Average prediction error in strength units"
            icon={<Ruler className="size-5" />}
            ocid="stat_card.rmse"
            delay={0.12}
          />
          <StatCard
            label="Training sequences"
            value={performance.trainCount}
            format={(v) => Math.round(v).toLocaleString()}
            hint={`${performance.testCount.toLocaleString()} held out for testing`}
            icon={<FlaskConical className="size-5" />}
            ocid="stat_card.train"
            delay={0.19}
          />
        </div>

        {/* Scatter plot */}
        <Card className="hover-lift shadow-subtle" data-ocid="scatter_card">
          <CardHeader>
            <CardTitle>Predicted vs. actual strength</CardTitle>
            <CardDescription>
              Performance on the held-out test set ({performance.testCount}{" "}
              sequences). Each point compares the model's predicted strength
              with the true synthetic label; the dashed line marks the ideal
              one-to-one fit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="aspect-[4/3] w-full sm:aspect-[16/9]"
            >
              <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="actual"
                  name="Actual"
                  domain={["auto", "auto"]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => value.toFixed(1)}
                  label={{
                    value: "Actual strength",
                    position: "insideBottom",
                    offset: -4,
                    fontSize: 12,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="predicted"
                  name="Predicted"
                  domain={["auto", "auto"]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => value.toFixed(1)}
                  label={{
                    value: "Predicted strength",
                    angle: -90,
                    position: "insideLeft",
                    offset: 8,
                    fontSize: 12,
                  }}
                />
                <ReferenceLine
                  segment={[
                    { x: 0, y: 0 },
                    { x: 1.5, y: 1.5 },
                  ]}
                  stroke="var(--chart-3)"
                  strokeDasharray="4 4"
                />
                <ChartTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={() => "Test point"}
                    />
                  }
                />
                <Scatter
                  data={testPoints}
                  fill="var(--chart-1)"
                  fillOpacity={0.7}
                  isAnimationActive={!reduceMotion}
                  animationDuration={900}
                  animationEasing="ease-out"
                  data-ocid="chart_point"
                />
              </ScatterChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Demo explanation */}
        <Card className="shadow-subtle">
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-display text-lg font-semibold tracking-tight">
              About this model
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This is a{" "}
              <span className="font-medium text-foreground">demo</span> model
              trained entirely in the browser on procedurally generated
              synthetic promoter sequences. Strength labels are simulated from
              sequence characteristics — GC content, TATA-box presence, and -35
              element presence — plus noise. It is{" "}
              <span className="font-medium text-foreground">not</span> a
              validated experimental model, and its metrics reflect performance
              on synthetic data only. Results must be confirmed empirically in
              the laboratory before any research, clinical, or commercial use.
            </p>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
