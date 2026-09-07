import PredictPage from "@/pages/PredictPage";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseReducedMotion } = vi.hoisted(() => ({
  mockUseReducedMotion: vi.fn(),
}));

// Force reduced motion so the count-up percentage jumps straight to its target
// and the result-card entrance mounts immediately. This makes the displayed
// percentage and strength label deterministic instead of mid-animation.
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useReducedMotion: () => mockUseReducedMotion(),
  };
});

const VALID_35BP = "TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC";

describe("PredictPage", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(true);
    window.localStorage.clear();
  });

  it("shows a prediction result after entering a valid sequence and predicting", async () => {
    const user = userEvent.setup();
    render(<PredictPage />);

    const input = screen.getByTestId("sequence.input");
    await user.clear(input);
    await user.type(input, VALID_35BP);

    await user.click(screen.getByTestId("predict_button"));

    // The result card appears with a numerical prediction. It is revealed
    // through an animated entrance, so wait for it to mount.
    expect(await screen.findByTestId("result_card")).toBeInTheDocument();
    expect(
      screen.getByText("Promoter strength prediction"),
    ).toBeInTheDocument();
    // GC content is shown.
    expect(screen.getByText(/GC content/i)).toBeInTheDocument();
    // Motifs detected section appears.
    expect(screen.getByText(/Motifs detected/i)).toBeInTheDocument();
  });

  it("shows a non-zero percentage and a strength label for a valid sequence", async () => {
    const user = userEvent.setup();
    render(<PredictPage />);

    const input = screen.getByTestId("sequence.input");
    await user.clear(input);
    await user.type(input, VALID_35BP);

    await user.click(screen.getByTestId("predict_button"));

    // The bias/intercept fix centers raw scores around the training-label mean
    // (~0.5-0.7) instead of near 0, so the normalized percentage must be
    // non-zero rather than clamping to 0%. The result card's headline
    // percentage is the integer `<p>` (e.g. "42%"), distinct from the gauge
    // label ("Moderate · 42%") and the GC-content figure ("54.3%").
    const resultCard = await screen.findByTestId("result_card");
    const percent = within(resultCard).getByText(/^\d+%$/);
    const value = Number.parseInt(percent.textContent ?? "", 10);
    expect(Number.isNaN(value)).toBe(false);
    expect(value).toBeGreaterThan(0);

    // A strength label (Weak, Moderate, or Strong) reflects the percentage.
    expect(
      within(resultCard).getByText(/(Weak|Moderate|Strong) ·/),
    ).toBeInTheDocument();
  });

  it("auto-uppercases lowercase input via the sequence input", async () => {
    const user = userEvent.setup();
    render(<PredictPage />);

    const input = screen.getByTestId("sequence.input");
    await user.clear(input);
    await user.type(input, VALID_35BP.toLowerCase());

    // The input value is uppercased.
    expect(input).toHaveValue(VALID_35BP);
  });

  it("shows an error for an invalid sequence", async () => {
    const user = userEvent.setup();
    render(<PredictPage />);

    const input = screen.getByTestId("sequence.input");
    await user.clear(input);
    // 34 bp is too short.
    await user.type(input, VALID_35BP.slice(0, 34));

    await user.click(screen.getByTestId("predict_button"));

    expect(screen.getByTestId("sequence.error")).toBeInTheDocument();
    expect(screen.getByText(/exactly 35 bp/i)).toBeInTheDocument();
  });

  it("inserts a TATA motif into the sequence", async () => {
    const user = userEvent.setup();
    render(<PredictPage />);

    const input = screen.getByTestId("sequence.input");
    await user.clear(input);
    await user.type(input, VALID_35BP);

    await user.click(screen.getByTestId("tata_button"));

    // TATAAT inserted at positions 24-29.
    expect(input).toHaveValue(
      `${VALID_35BP.slice(0, 24)}TATAAT${VALID_35BP.slice(30)}`,
    );
  });
});
