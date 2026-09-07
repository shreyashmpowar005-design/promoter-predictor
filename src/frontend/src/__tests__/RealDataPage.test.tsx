import { getAndersonPromoters } from "@/lib/anderson";
import RealDataPage from "@/pages/RealDataPage";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

/**
 * Characterization baseline for the Real Data Validation page. The upcoming
 * animation work adds count-up animations to the stat cards and draw-in
 * animations to the scatter plot; these tests protect the functional contract
 * that the stat values and the promoter table still render correctly.
 */
describe("RealDataPage", () => {
  it("renders the real-data stat cards with the expected values", async () => {
    render(<RealDataPage />);

    const promoters = getAndersonPromoters();

    // The "Real promoters tested" stat card reflects the embedded library size.
    // The stat cards count up to their target on load, so wait for the count-up
    // animation to reach the promoter count.
    await waitFor(() => {
      expect(screen.getByTestId("stat_card.promoters")).toHaveTextContent(
        String(promoters.length),
      );
    });

    // The Pearson correlation stat card renders a finite numeric value.
    const correlationCard = screen.getByTestId("stat_card.correlation");
    const correlation = Number(
      correlationCard.textContent?.match(/-?\d+\.\d{3}/)?.[0],
    );
    expect(Number.isFinite(correlation)).toBe(true);

    // Mean measured and mean predicted stat cards render finite values.
    for (const id of ["stat_card.measured", "stat_card.predicted"]) {
      const card = screen.getByTestId(id);
      const value = Number(card.textContent?.match(/-?\d+\.\d{3}/)?.[0]);
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("renders a table row for every Anderson promoter", () => {
    render(<RealDataPage />);

    const promoters = getAndersonPromoters();
    // The first and last promoter IDs are present in the table.
    expect(screen.getByText(promoters[0].id)).toBeInTheDocument();
    expect(
      screen.getByText(promoters[promoters.length - 1].id),
    ).toBeInTheDocument();
    // The table renders one row per promoter.
    expect(screen.getAllByTestId(/^promoter\.row\./)).toHaveLength(
      promoters.length,
    );
  });

  it("labels the synthetic vs real data distinction", () => {
    render(<RealDataPage />);

    expect(screen.getByTestId("data_type_badge.synthetic")).toHaveTextContent(
      "Synthetic training data",
    );
    expect(screen.getByTestId("data_type_badge.real")).toHaveTextContent(
      "Real experimental validation data",
    );
  });
});
