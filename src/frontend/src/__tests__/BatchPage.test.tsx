import BatchPage from "@/pages/BatchPage";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

const SEQ_A = "TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC";
const SEQ_B = "TTTACAGCTAGCTCAGTCCTAGGTATTATGCTAGC";

describe("BatchPage", () => {
  it("ranks pasted sequences and ignores FASTA headers", async () => {
    const user = userEvent.setup();
    render(<BatchPage />);

    const textarea = screen.getByTestId("batch.textarea");
    await user.type(textarea, `>promoter1\n${SEQ_A}\n>promoter2\n${SEQ_B}`);

    await user.click(screen.getByTestId("batch.predict_button"));

    // Ranked results table appears with both sequences.
    expect(screen.getByText("Ranked results")).toBeInTheDocument();
    expect(screen.getByText(SEQ_A)).toBeInTheDocument();
    expect(screen.getByText(SEQ_B)).toBeInTheDocument();
    // The FASTA headers are not treated as sequences: no skipped/invalid
    // entries are reported for them.
    expect(screen.queryByText("Skipped sequences")).not.toBeInTheDocument();
    // The results are labeled as synthetic/demo model estimates.
    expect(
      screen.getByText("Synthetic / demo model estimates"),
    ).toBeInTheDocument();
  });

  it("shows an error when no sequences are provided", async () => {
    const user = userEvent.setup();
    render(<BatchPage />);

    await user.click(screen.getByTestId("batch.predict_button"));

    expect(screen.getByTestId("batch.error_state")).toBeInTheDocument();
    expect(screen.getByText(/no sequences found/i)).toBeInTheDocument();
  });

  it("flags invalid sequences as skipped", async () => {
    const user = userEvent.setup();
    render(<BatchPage />);

    const textarea = screen.getByTestId("batch.textarea");
    // One valid, one too short.
    await user.type(textarea, `${SEQ_A}\n${SEQ_B.slice(0, 10)}`);

    await user.click(screen.getByTestId("batch.predict_button"));

    // The valid sequence is scored and the invalid one is reported as skipped.
    expect(screen.getByText(SEQ_A)).toBeInTheDocument();
    expect(screen.getByText("Skipped sequences")).toBeInTheDocument();
    expect(screen.getByText(/exactly 35 bp/i)).toBeInTheDocument();
  });
});
