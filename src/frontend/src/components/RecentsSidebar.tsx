import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getRecents } from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";
import { History } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

interface RecentsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (entry: HistoryEntry) => void;
}

export default function RecentsSidebar({
  open,
  onOpenChange,
  onSelect,
}: RecentsSidebarProps) {
  const [recents, setRecents] = useState<HistoryEntry[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (open) setRecents(getRecents(10));
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="size-4" />
            Recent predictions
          </SheetTitle>
          <SheetDescription>
            Your most recent promoter strength predictions.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
          {recents.length === 0 ? (
            <div
              className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground"
              data-ocid="recents.empty_state"
            >
              No predictions yet. Run a prediction to see it here.
            </div>
          ) : (
            recents.map((entry, i) => (
              <motion.button
                key={entry.id}
                type="button"
                data-ocid={`recents.item.${i}`}
                onClick={() => onSelect(entry)}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="w-full rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    {entry.sequence}
                  </span>
                  <span className="ml-2 shrink-0 font-mono text-sm font-semibold text-primary">
                    {Math.round(entry.score * 100)}%
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>GC {entry.gcContent.toFixed(0)}%</span>
                  {entry.motifs.length > 0 && (
                    <span>· {entry.motifs.join(", ")}</span>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
