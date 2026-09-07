import { useMemo } from "react";

const WIDTH = 320;
const HEIGHT = 400;
const AMPLITUDE = 52;
const PERIOD = 96;
const PHASE_SHIFT = Math.PI;

export default function DnaHelix() {
  const strand1 = useMemo(() => {
    let d = "";
    for (let y = 24; y <= HEIGHT - 24; y += 4) {
      const x = WIDTH / 2 + AMPLITUDE * Math.sin((y / PERIOD) * Math.PI * 2);
      d += `${d ? "L" : "M"}${x.toFixed(1)},${y} `;
    }
    return d;
  }, []);

  const strand2 = useMemo(() => {
    let d = "";
    for (let y = 24; y <= HEIGHT - 24; y += 4) {
      const x =
        WIDTH / 2 +
        AMPLITUDE * Math.sin((y / PERIOD) * Math.PI * 2 + PHASE_SHIFT);
      d += `${d ? "L" : "M"}${x.toFixed(1)},${y} `;
    }
    return d;
  }, []);
  const rungs = useMemo(() => {
    const points: { y: number; x1: number; x2: number; key: string }[] = [];
    for (let y = 28; y <= HEIGHT - 28; y += 22) {
      const x1 = WIDTH / 2 + AMPLITUDE * Math.sin((y / PERIOD) * Math.PI * 2);
      const x2 =
        WIDTH / 2 +
        AMPLITUDE * Math.sin((y / PERIOD) * Math.PI * 2 + PHASE_SHIFT);
      points.push({ y, x1, x2, key: `rung-${y}` });
    }
    return points;
  }, []);

  return (
    <div className="relative animate-nucleotide-float" aria-hidden="true">
      <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-2xl" />
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full max-w-[320px]"
        role="img"
        aria-label="Animated DNA double helix"
      >
        <defs>
          <linearGradient id="helix-strand-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(var(--nuc-a))" />
            <stop offset="100%" stopColor="oklch(var(--nuc-g))" />
          </linearGradient>
          <linearGradient id="helix-strand-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(var(--nuc-t))" />
            <stop offset="100%" stopColor="oklch(var(--nuc-c))" />
          </linearGradient>
        </defs>

        {rungs.map((rung) => (
          <line
            key={rung.key}
            x1={rung.x1}
            y1={rung.y}
            x2={rung.x2}
            y2={rung.y}
            stroke="oklch(var(--border))"
            strokeWidth="2"
            opacity="0.7"
          />
        ))}

        <path
          d={strand1}
          fill="none"
          stroke="url(#helix-strand-a)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d={strand2}
          fill="none"
          stroke="url(#helix-strand-b)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
