# Design Brief

## Direction
Genomic Precision — a modern biotech/AI research dashboard for predicting synthetic promoter strength, combining clean scientific tooling with an AI-analytics interface.

## Tone
Refined scientific minimalism — crisp light surfaces with a confident green biotech accent, professional and trustworthy, never cartoonish or gradient-heavy.

## Differentiation
DNA nucleotide color-coding (A/T/G/C distinct hues) and a weak→strong strength gauge woven through the UI make every data element feel biologically meaningful rather than generic.

## Color Palette
| Token      | OKLCH (light)  | Role                       |
| ---------- | -------------- | -------------------------- |
| background | 0.985 0.008 160| cool green-tinted off-white|
| foreground | 0.17 0.025 160 | deep green-black text      |
| card       | 1.0 0.004 160  | white elevated surface     |
| primary    | 0.5 0.16 155   | biotech green accent       |
| accent     | 0.45 0.13 245  | blue secondary accent      |
| warning    | 0.72 0.15 85   | amber tertiary accent      |
| muted      | 0.95 0.014 160 | soft gray-green surface    |
| nuc-a/g/c/t| 155/245/320/85 | nucleotide base colors     |
| gauge-weak/mid/strong| 25/85/155| strength scale red→green   |

## Typography
- Display: Space Grotesk — headings, hero, section titles
- Body: Satoshi — UI labels, paragraphs, table text
- Mono: JetBrains Mono — DNA sequences, metrics
- Scale: hero `text-4xl md:text-5xl font-bold tracking-tight`, h2 `text-2xl font-semibold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-sm text-base`

## Elevation & Depth
Light surfaces layered on a faint grid background; cards use subtle and elevated shadows to separate header, content, and floating panels without heavy borders.

## Structural Zones
| Zone    | Background        | Border   | Notes                                |
| ------- | ----------------- | -------- | ------------------------------------ |
| Header  | card (white)      | border-b | sticky, app title + dark-mode toggle |
| Sidebar | sidebar (tinted)  | border-r | nav rail on desktop, drawer on mobile|
| Content | background + grid | —        | cards on bg, muted bands alternate   |
| Footer  | muted/40          | border-t | credits + synthetic-data disclaimer  |

## Spacing & Rhythm
Generous section gaps (space-y-8/10), card padding p-5/p-6, tight micro-spacing inside data blocks; mobile stacks panels vertically, tables scroll horizontally.

## Component Patterns
- Buttons: rounded-lg, primary green solid, secondary outline, hover lift via shadow
- Cards: rounded-xl, white bg, shadow-subtle, border-border
- Badges: rounded-full pill, nucleotide or status color-coded

## Motion — Sequenced Data Reveal
One choreographed system: content enters in a staggered cascade, data visualizes itself, and interactive elements answer with precise tactile feedback. Subtle, reduced-motion-safe, never obscures content.

### Motion Tokens
| Token            | Value                             | Use                     |
| ---------------- | --------------------------------- | ----------------------- |
| --ease-out-expo  | cubic-bezier(0.16, 1, 0.3, 1)     | entrance, lifts, bars   |
| --ease-standard  | cubic-bezier(0.4, 0, 0.2, 1)      | hovers, transitions     |
| --ease-in-out    | cubic-bezier(0.65, 0, 0.35, 1)    | chart draw, decorative  |
| --dur-fast/md/slow/enter | 150/300/600/700ms       | interaction → entrance |
| --stagger-step   | 70ms                              | cascade pacing          |

### Entrance
- `animate-fade-in-up` (700ms expo) on sections; `animate-fade-in`, `animate-scale-in`, `animate-slide-in-left/right` on cards, tables, stat blocks
- `.stagger-1`…`.stagger-8` apply 70ms incremental delay for cascading reveal per page load
- Hero: layered — title fade-in-up, helix scale-in, grid + glow fade-in

### Micro-interactions
- `.hover-lift`: translateY(-3px) + elevated shadow on hover
- `.press`: scale(0.98) + translateY(1px) on active
- `.glow-hover`: green `--glow-ring` on focus-visible/hover for inputs, nav pills, predict button
- Theme toggle: cross-fade light↔dark via `transition-smooth`

### Data Visualization
- `.chart-draw`: SVG stroke-dashoffset reveal for recharts (1.2s in-out)
- `.count-up`: tabular-nums + JS count-up for stat cards
- `.bar-grow`: scaleY grow (600ms expo) for Motifs bars and table rows
- `.animate-gauge-fill`: width transition (600ms expo) for StrengthGauge

### Decorative & Reduced Motion
- `.animate-pulse-soft` on live/demo indicators, `.animate-shimmer` on demo badges, `.animate-spin-slow` on loading, existing `nucleotide-float` + `gauge-pulse`
- Global `prefers-reduced-motion: reduce` collapses durations to ~0, zeroes stagger delays, disables chart-draw/bar-grow

## Constraints
- Modern light theme default with full dark-mode toggle
- Green primary, blue + amber secondary accents only
- No excessive gradients or cartoon graphics; subtle scientific animation only
- Clearly label synthetic/demo data vs real experimental data
- Do NOT build Three.js 3D DNA helix or an onboarding tour overlay
## Signature Detail
Nucleotide-colored promoter sequences rendered in JetBrains Mono with a live weak→strong gauge — the biological DNA element is the visual anchor of the entire dashboard.
