import Layout from "@/components/Layout";
import type { SectionId } from "@/components/Nav";
import type { HistoryEntry } from "@/lib/types";
import AboutPage from "@/pages/AboutPage";
import BatchPage from "@/pages/BatchPage";
import ComparePage from "@/pages/ComparePage";
import HistoryPage from "@/pages/HistoryPage";
import HomePage from "@/pages/HomePage";
import MotifsPage from "@/pages/MotifsPage";
import PerformancePage from "@/pages/PerformancePage";
import RealDataPage from "@/pages/RealDataPage";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("Predict");
  const [pendingSequence, setPendingSequence] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const handleSelectRecent = (entry: HistoryEntry) => {
    setPendingSequence(entry.sequence);
    setActiveSection("Predict");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Predict":
        return (
          <HomePage
            pendingSequence={pendingSequence}
            onPendingConsumed={() => setPendingSequence(null)}
          />
        );
      case "Compare":
        return <ComparePage />;
      case "Batch & FASTA":
        return <BatchPage />;
      case "History":
        return <HistoryPage />;
      case "Performance":
        return <PerformancePage />;
      case "Motifs":
        return <MotifsPage />;
      case "Real Data":
        return <RealDataPage />;
      case "About":
        return <AboutPage />;
    }
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Layout
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onSelectRecent={handleSelectRecent}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSection}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </ThemeProvider>
  );
}
