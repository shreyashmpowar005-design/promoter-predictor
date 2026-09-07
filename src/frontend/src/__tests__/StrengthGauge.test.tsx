import StrengthGauge from "@/components/StrengthGauge";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseReducedMotion } = vi.hoisted(() => ({
  mockUseReducedMotion: vi.fn(),
}));

// Force reduced motion so the count-up jumps straight to the target value,
// making the displayed percentage deterministic instead of mid-animation.
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useReducedMotion: () => mockUseReducedMotion(),
  };
});

/**
 * Coverage for the strength display invariants that must survive the model
 * bias/intercept fix. The fix changes the raw model scores and therefore the
 * percentage shown, but the display layer's label thresholds, clamping, and
 * progressbar semantics are accepted behavior that should remain unchanged.
 */
describe("StrengthGauge", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(true);
  });

  it("labels a low score as Weak", () => {
    render(<StrengthGauge score={20} />);
    // The active label is shown in the count-up readout ("Weak · 20%"), distinct
    // from the static Weak/Moderate/Strong scale legend below the bar.
    expect(screen.getByText(/Weak ·/)).toBeInTheDocument();
    expect(screen.queryByText(/Moderate ·/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Strong ·/)).not.toBeInTheDocument();
  });

  it("labels a mid-range score as Moderate", () => {
    render(<StrengthGauge score={55} />);
    expect(screen.getByText(/Moderate ·/)).toBeInTheDocument();
  });

  it("labels a high score as Strong", () => {
    render(<StrengthGauge score={85} />);
    expect(screen.getByText(/Strong ·/)).toBeInTheDocument();
  });

  it("clamps scores above 100 down to 100", () => {
    render(<StrengthGauge score={150} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText(/Strong ·/)).toBeInTheDocument();
  });

  it("clamps scores below 0 up to 0", () => {
    render(<StrengthGauge score={-10} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText(/Weak ·/)).toBeInTheDocument();
  });

  it("exposes the clamped score on the progressbar", () => {
    render(<StrengthGauge score={42} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
  });
});
