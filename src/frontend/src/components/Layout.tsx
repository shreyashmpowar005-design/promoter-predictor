import Hero from "@/components/Hero";
import Nav, { type SectionId } from "@/components/Nav";
import RecentsSidebar from "@/components/RecentsSidebar";
import type { HistoryEntry } from "@/lib/types";
import { Menu, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";

interface LayoutProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onSelectRecent: (entry: HistoryEntry) => void;
  children: ReactNode;
}

export default function Layout({
  activeSection,
  onNavigate,
  onSelectRecent,
  children,
}: LayoutProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [recentsOpen, setRecentsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const attributionUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  )}`;

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none fixed inset-0 bg-sci-grid opacity-40 dark:opacity-20"
        aria-hidden="true"
      />

      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <motion.button
              type="button"
              onClick={() => setRecentsOpen(true)}
              aria-label="Open recent predictions"
              data-ocid="recents.open_button"
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Menu className="size-4" />
            </motion.button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-semibold leading-tight sm:text-lg">
                Synthetic Promoter Strength Predictor
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                Biotechnology Engineering Mini Project
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            data-ocid="theme.toggle"
            whileHover={reduceMotion ? undefined : { y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? "sun" : "moon"}
                initial={
                  reduceMotion ? false : { rotate: -90, scale: 0.4, opacity: 0 }
                }
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={
                  reduceMotion
                    ? undefined
                    : { rotate: 90, scale: 0.4, opacity: 0 }
                }
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex"
              >
                {isDark ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        <Nav active={activeSection} onNavigate={onNavigate} />
      </header>

      <main className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <Hero />
        {children}
      </main>

      <footer className="relative border-t bg-card">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
          <div className="rounded-xl border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
            <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-foreground">
              Scientific disclaimer
            </h3>
            <p>
              This tool predicts promoter strength using a synthetic, in-browser
              machine-learning model trained on procedurally generated
              sequences. All predictions are for educational and demonstration
              purposes only and are not a substitute for experimental
              measurement. Results must be validated empirically in the
              laboratory before use in any research, clinical, or commercial
              application.
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={attributionUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              caffeine.ai
            </a>
            .
          </p>
        </div>
      </footer>

      <RecentsSidebar
        open={recentsOpen}
        onOpenChange={setRecentsOpen}
        onSelect={(entry) => {
          onSelectRecent(entry);
          setRecentsOpen(false);
        }}
      />
    </div>
  );
}
