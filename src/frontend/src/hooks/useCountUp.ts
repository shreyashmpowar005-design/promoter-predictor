import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Animates a number from 0 up to `target` using an ease-out cubic curve.
 *
 * Honors `prefers-reduced-motion`: when reduced motion is preferred the value
 * jumps straight to `target` so content is never hidden behind the animation.
 */
export function useCountUp(target: number, duration = 700): number {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (reduceMotion) {
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduceMotion]);

  return value;
}
