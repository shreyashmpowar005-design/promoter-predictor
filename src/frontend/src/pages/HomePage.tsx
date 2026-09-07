import PredictPage from "@/pages/PredictPage";

interface HomePageProps {
  pendingSequence?: string | null;
  onPendingConsumed?: () => void;
}

/**
 * HomePage is the Predict section entry that App.tsx routes to. It delegates
 * to the PredictPage dashboard, which owns the prediction workflow.
 */
export default function HomePage({
  pendingSequence,
  onPendingConsumed,
}: HomePageProps) {
  return (
    <PredictPage
      pendingSequence={pendingSequence}
      onPendingConsumed={onPendingConsumed}
    />
  );
}
