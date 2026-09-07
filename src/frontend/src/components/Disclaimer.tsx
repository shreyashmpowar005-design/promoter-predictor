export default function Disclaimer() {
  return (
    <div className="animate-fade-in-up rounded-xl border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-foreground">
        Scientific disclaimer
      </h3>
      <p>
        This tool predicts promoter strength using a synthetic, in-browser
        machine-learning model trained on procedurally generated sequences. All
        predictions are for educational and demonstration purposes only and are
        not a substitute for experimental measurement. Results must be validated
        empirically in the laboratory before use in any research, clinical, or
        commercial application.
      </p>
    </div>
  );
}
