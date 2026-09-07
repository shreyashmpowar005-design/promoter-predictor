import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable page section wrapper. The title fades in first, then each direct
 * child (cards, tables, stat blocks) reveals with a staggered fade/slide-in
 * using the design system's entrance + stagger utilities. Reduced-motion
 * handling is provided by the global CSS override.
 */
export default function Section({
  title,
  subtitle,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="animate-fade-in-up space-y-1">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="max-w-2xl text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="space-y-4 [&>*]:animate-fade-in-up [&>*:nth-child(2)]:stagger-2 [&>*:nth-child(3)]:stagger-3 [&>*:nth-child(4)]:stagger-4 [&>*:nth-child(5)]:stagger-5 [&>*:nth-child(6)]:stagger-6 [&>*:nth-child(7)]:stagger-7 [&>*:nth-child(8)]:stagger-8">
        {children}
      </div>
    </section>
  );
}
