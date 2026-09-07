import PredictPage from "@/pages/PredictPage";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

const VALID_35BP = "TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC";

describe("PredictPage", () => {
  beforeEach(() => {
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
