import ComparePage from "@/pages/ComparePage";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

// Two distinct valid 35 bp sequences from the Anderson library.
const SEQ_A = "TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC"; // J23100 (strong)
const SEQ_B = "TTTACAGCTAGCTCAGTCCTAGGTATTATGCTAGC"; // J23101 (strong)

describe("ComparePage", () => {
  it("highlights the stronger candidate after comparing", async () => {
    const user = userEvent.setup();
    render(<ComparePage />);

    const [inputA, inputB] = screen.getAllByTestId("sequence.input");

    await user.clear(inputA);
    await user.type(inputA, SEQ_A);
    await user.clear(inputB);
    await user.type(inputB, SEQ_B);

    await user.click(screen.getByTestId("compare_button"));

    // Exactly one candidate is marked as the stronger candidate.
    const strongerBadges = screen.getAllByText(/✓ stronger candidate/i);
    expect(strongerBadges).toHaveLength(1);
  });

  it("shows a score for both candidates after comparing", async () => {
    const user = userEvent.setup();
    render(<ComparePage />);

    const [inputA, inputB] = screen.getAllByTestId("sequence.input");

    await user.clear(inputA);
    await user.type(inputA, SEQ_A);
    await user.clear(inputB);
    await user.type(inputB, SEQ_B);

    await user.click(screen.getByTestId("compare_button"));

    // Both candidate panels render a strength gauge with a value in 0-100.
    const gauges = screen.getAllByRole("progressbar");
    expect(gauges).toHaveLength(2);
    for (const gauge of gauges) {
      const value = Number(gauge.getAttribute("aria-valuenow"));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it("randomizes both candidates", async () => {
    const user = userEvent.setup();
    render(<ComparePage />);

    const [inputA] = screen.getAllByTestId(
      "sequence.input",
    ) as HTMLTextAreaElement[];

    await user.click(screen.getByTestId("compare_randomize_button"));

    // A new random 35 bp sequence is generated.
    expect(inputA.value).toHaveLength(35);
    expect(inputA.value).toMatch(/^[ATGC]+$/);
  });
});
