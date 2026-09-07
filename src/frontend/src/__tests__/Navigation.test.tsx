import App from "@/App";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * Characterization baseline for the 8-section navigation. The upcoming
 * animation work adds animated transitions and staggered content entrance
 * between sections; these tests protect the functional contract that every
 * section still renders its content when navigated to.
 */
describe("App navigation across all sections", () => {
  it("renders each of the 8 sections when navigated to", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Predict is the default section.
    expect(screen.getByTestId("nav.tab.predict")).toHaveAttribute(
      "aria-current",
      "page",
    );

    const cases: Array<{ tab: string; heading: RegExp }> = [
      { tab: "compare", heading: /Compare promoter candidates/i },
      { tab: "batch_fasta", heading: /Batch & FASTA prediction/i },
      { tab: "history", heading: /Prediction History/i },
      { tab: "performance", heading: /Model performance/i },
      { tab: "motifs", heading: /Top Predictive 3-mers/i },
      { tab: "real_data", heading: /Real Data Validation/i },
      { tab: "about", heading: /About this project/i },
    ];

    for (const { tab, heading } of cases) {
      await user.click(screen.getByTestId(`nav.tab.${tab}`));
      expect(
        await screen.findByRole("heading", { name: heading }),
      ).toBeInTheDocument();
      expect(screen.getByTestId(`nav.tab.${tab}`)).toHaveAttribute(
        "aria-current",
        "page",
      );
    }

    // Returning to Predict still works after visiting every other section.
    await user.click(screen.getByTestId("nav.tab.predict"));
    expect(screen.getByTestId("nav.tab.predict")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders the hero with its key content on the default route", () => {
    const { container } = render(<App />);

    // The hero section is present with its layered content.
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Predict a promoter's expression strength/i,
      }),
    ).toBeInTheDocument();
    // The SDG badge is part of the hero.
    expect(
      screen.getByText(/SDG 9 · Industry, Innovation/i),
    ).toBeInTheDocument();
    // The animated DNA helix SVG is rendered (it is aria-hidden/decorative).
    expect(
      container.querySelector("svg[aria-label='Animated DNA double helix']"),
    ).toBeInTheDocument();
  });
});
