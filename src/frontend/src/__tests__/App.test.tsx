import App from "@/App";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("App theme toggle", () => {
  it("switches between light and dark mode", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initially light mode: the toggle offers to switch to dark.
    const toggle = await screen.findByTestId("theme.toggle");
    expect(toggle).toHaveAttribute("aria-label", "Switch to dark mode");

    await user.click(toggle);

    // After clicking, the toggle offers to switch back to light.
    expect(
      await screen.findByRole("button", { name: "Switch to light mode" }),
    ).toBeInTheDocument();
  });

  it("renders the nav tabs and navigates between sections", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Predict tab is active by default.
    const predictTab = screen.getByTestId("nav.tab.predict");
    expect(predictTab).toHaveAttribute("aria-current", "page");

    // Navigate to the Compare tab.
    await user.click(screen.getByTestId("nav.tab.compare"));
    expect(
      await screen.findByText("Compare promoter candidates"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("nav.tab.compare")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
