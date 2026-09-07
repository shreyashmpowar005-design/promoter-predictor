import AnimatedSequence from "@/components/AnimatedSequence";
import DnaHelix from "@/components/DnaHelix";
import { motion, useReducedMotion } from "motion/react";

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden rounded-2xl border bg-gradient-subtle p-6 sm:p-10"
      data-ocid="hero"
    >
      {/* Animated gradient / glow background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-24 -right-16 size-72 rounded-full bg-accent/20 blur-3xl animate-pulse-soft" />
      </div>

      <div className="relative grid items-center gap-8 lg:grid-cols-2">
        <motion.div
          className="space-y-5"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <span
              className="h-2 w-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            SDG 9 · Industry, Innovation &amp; Infrastructure
          </motion.span>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
          >
            Predict a promoter&apos;s expression strength{" "}
            <span className="text-gradient">before you clone it</span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl text-muted-foreground"
          >
            Enter a 35 bp promoter sequence and our in-browser ridge-regression
            model estimates its relative expression strength — helping you
            prioritize constructs before spending time and resources in the lab.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatedSequence />
          </motion.div>
        </motion.div>

        <motion.div
          className="flex justify-center lg:justify-end"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <DnaHelix />
        </motion.div>
      </div>
    </section>
  );
}
