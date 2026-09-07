import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";

export const SECTIONS = [
  "Predict",
  "Compare",
  "Batch & FASTA",
  "History",
  "Performance",
  "Motifs",
  "Real Data",
  "About",
] as const;

export type SectionId = (typeof SECTIONS)[number];

interface NavProps {
  active: SectionId;
  onNavigate: (section: SectionId) => void;
}

function ocid(section: SectionId): string {
  return `nav.tab.${section.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
}

export default function Nav({ active, onNavigate }: NavProps) {
  const reduceMotion = useReducedMotion();

  return (
    <nav aria-label="Primary" className="border-t bg-card/60">
      <div className="flex gap-1.5 overflow-x-auto px-4 py-2 sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((section) => {
          const isActive = section === active;
          return (
            <motion.button
              key={section}
              type="button"
              data-ocid={ocid(section)}
              onClick={() => onNavigate(section)}
              aria-current={isActive ? "page" : undefined}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm"
                  transition={{
                    duration: reduceMotion ? 0 : 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              )}
              {section}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
