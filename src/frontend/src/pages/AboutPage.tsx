import Disclaimer from "@/components/Disclaimer";
import Section from "@/components/Section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Beaker,
  Dna,
  FlaskConical,
  LineChart,
  Microscope,
  ScanSearch,
} from "lucide-react";

const PIPELINE_STEPS = [
  {
    icon: Dna,
    title: "DNA promoter sequence",
    description:
      "You provide a candidate promoter sequence — the short regulatory region upstream of a gene that controls how strongly that gene is expressed.",
  },
  {
    icon: ScanSearch,
    title: "Sequence feature extraction",
    description:
      "The sequence is broken into overlapping 3-nucleotide features (3-mers) that capture local sequence context relevant to transcription initiation.",
  },
  {
    icon: LineChart,
    title: "Machine-learning prediction",
    description:
      "A ridge regression model, trained on ~500 synthetic sequences, maps those features to an estimated expression strength.",
  },
  {
    icon: FlaskConical,
    title: "Predicted expression strength",
    description:
      "The model returns a relative strength score you can use to rank and shortlist candidates before committing to lab work.",
  },
];

const FUTURE_DATA_SOURCES = [
  {
    icon: Microscope,
    title: "GFP fluorescence / OD600",
    description:
      "Reporter-gene fluorescence normalised to culture density provides a direct, quantitative readout of promoter output.",
  },
  {
    icon: Beaker,
    title: "β-galactosidase activity",
    description:
      "Enzyme activity assays (e.g. Miller units) give a well-established, reproducible measure of promoter strength.",
  },
  {
    icon: FlaskConical,
    title: "Other measured expression values",
    description:
      "Any experimentally measured expression metric — RNA abundance, protein yield, or other reporter systems — can serve as training labels.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <Section
        title="About this project"
        subtitle="A computational screening tool for promoter candidates, built as a Biotechnology Engineering mini project."
      >
        <Card data-ocid="about.overview.card" className="hover-lift glow-hover">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Why screen promoters computationally?
            </CardTitle>
            <CardDescription>
              Cloning and testing every promoter candidate in the lab is slow
              and expensive. This tool lets you rank candidates before you
              commit to bench work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              A promoter is a short DNA sequence that controls how strongly a
              gene is expressed. Choosing a promoter with the right strength is
              a common task in synthetic biology — but testing candidates
              experimentally, one by one, takes time and resources.
            </p>
            <p>
              This project screens promoter candidates{" "}
              <span className="font-medium text-foreground">
                computationally, before laboratory cloning and testing
              </span>
              . By predicting relative expression strength from the DNA sequence
              alone, it helps you focus experimental effort on the most
              promising candidates.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="How the pipeline works"
        subtitle="From raw DNA sequence to a predicted expression strength in four steps."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {PIPELINE_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.title}
                data-ocid={`about.pipeline.step.${index + 1}`}
                className={`gap-3 hover-lift glow-hover stagger-${index + 1}`}
              >
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="space-y-1">
                    <CardTitle className="font-display text-base">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium uppercase tracking-wide text-primary">
                      Step {index + 1}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section
        title="The demo machine-learning model"
        subtitle="A lightweight, fully in-browser model — no backend required."
      >
        <Card data-ocid="about.model.card" className="hover-lift glow-hover">
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              The current model is a{" "}
              <span className="font-medium text-foreground">
                ridge regression
              </span>{" "}
              trained on{" "}
              <span className="font-medium text-foreground">
                ~500 synthetic promoter sequences
              </span>
              . Each sequence is represented by its{" "}
              <span className="font-medium text-foreground">
                3-mer features
              </span>{" "}
              — the frequency of every possible three-nucleotide window — which
              the model uses to estimate expression strength.
            </p>
            <p>
              Because the training data is procedurally generated, this is a{" "}
              <span className="font-medium text-foreground">
                demonstration model
              </span>{" "}
              that illustrates the screening workflow rather than a
              lab-validated predictor. All computation runs client-side in your
              browser.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="The path to experimental data"
        subtitle="Future versions can replace synthetic training data with real measurements."
      >
        <Card data-ocid="about.future.card" className="hover-lift glow-hover">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              From synthetic to experimentally validated
            </CardTitle>
            <CardDescription>
              The same pipeline can be retrained on measured promoter strengths,
              turning the demo into a genuinely predictive tool.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {FUTURE_DATA_SOURCES.map((source) => {
                const Icon = source.icon;
                return (
                  <div
                    key={source.title}
                    className="rounded-xl border bg-background/60 p-4 hover-lift glow-hover"
                  >
                    <span className="mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon className="size-4" />
                    </span>
                    <h4 className="font-display text-sm font-semibold text-foreground">
                      {source.title}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {source.description}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By training on experimentally measured expression values, future
              versions of this tool could provide predictions that are directly
              comparable to laboratory results — while keeping the same
              sequence-to-strength workflow.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Project context"
        subtitle="A Biotechnology Engineering mini project."
      >
        <Card data-ocid="about.context.card" className="hover-lift glow-hover">
          <CardContent className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p>
                This tool was developed as a{" "}
                <span className="font-medium text-foreground">
                  Biotechnology Engineering mini project
                </span>{" "}
                to demonstrate how machine learning can support the early stages
                of synthetic biology design.
              </p>
              <p>
                It combines sequence analysis, a trained regression model, and
                an interactive interface to make promoter screening accessible
                and educational.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <ArrowRight className="size-4" />
              Educational demo
            </span>
          </CardContent>
        </Card>
      </Section>

      <Disclaimer />
    </div>
  );
}
