import { useCountUp } from "@/hooks/useCountUp";

interface GeneExpressionProps {
  /** Predicted strength as a percentage (0-100). */
  score: number;
}

interface Element {
  x: number;
  width: number;
  label: string;
  sub: string;
  fill: string;
  text: string;
}

const ELEMENTS: Element[] = [
  {
    x: 10,
    width: 110,
    label: "Promoter",
    sub: "35 bp",
    fill: "oklch(var(--nuc-a) / 0.18)",
    text: "oklch(var(--nuc-a))",
  },
  {
    x: 150,
    width: 90,
    label: "RBS",
    sub: "Shine-Dalgarno",
    fill: "oklch(var(--nuc-t) / 0.18)",
    text: "oklch(var(--nuc-t))",
  },
  {
    x: 270,
    width: 130,
    label: "GFP",
    sub: "Reporter",
    fill: "oklch(var(--nuc-g) / 0.22)",
    text: "oklch(var(--nuc-g))",
  },
  {
    x: 430,
    width: 110,
    label: "Terminator",
    sub: "rho-independent",
    fill: "oklch(var(--nuc-c) / 0.18)",
    text: "oklch(var(--nuc-c))",
  },
];

export default function GeneExpression({ score }: GeneExpressionProps) {
  const clamped = Math.max(0, Math.min(100, score));
  // Drive the glow ramp off the animated count-up so the GFP glow ramps up
  // smoothly as the prediction result reveals.
  const display = useCountUp(clamped);
  const glowOpacity = 0.25 + (display / 100) * 0.6;
  const glowBlur = 4 + (display / 100) * 14;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Gene expression construct</span>
        <span className="text-xs text-muted-foreground">
          GFP glow scales with predicted strength
        </span>
      </div>
      <svg
        viewBox="0 0 560 120"
        className="w-full"
        role="img"
        aria-label="Gene expression construct: promoter, RBS, GFP reporter gene, and terminator"
      >
        <defs>
          <filter id="gfp-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={glowBlur} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ELEMENTS.map((el, i) => (
          <g key={el.label}>
            <rect
              x={el.x}
              y={34}
              width={el.width}
              height={52}
              rx={10}
              fill={el.fill}
              stroke={el.text}
              strokeWidth="1.5"
              filter={el.label === "GFP" ? "url(#gfp-glow)" : undefined}
              opacity={el.label === "GFP" ? glowOpacity : 1}
            />
            <text
              x={el.x + el.width / 2}
              y={58}
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill={el.text}
            >
              {el.label}
            </text>
            <text
              x={el.x + el.width / 2}
              y={74}
              textAnchor="middle"
              fontSize="9"
              fill="oklch(var(--muted-foreground))"
            >
              {el.sub}
            </text>
            {i < ELEMENTS.length - 1 && (
              <path
                d={`M ${el.x + el.width + 4} 60 L ${ELEMENTS[i + 1].x - 4} 60`}
                stroke="oklch(var(--muted-foreground))"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />
            )}
          </g>
        ))}

        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              fill="oklch(var(--muted-foreground))"
            />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
