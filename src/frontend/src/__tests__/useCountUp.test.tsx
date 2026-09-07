import { useCountUp } from "@/hooks/useCountUp";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseReducedMotion } = vi.hoisted(() => ({
  mockUseReducedMotion: vi.fn(),
}));

// Control the reduced-motion input to the hook deterministically. motion's own
// useReducedMotion caches the matchMedia state from the test setup, so we mock
// just that hook to exercise both branches of useCountUp.
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useReducedMotion: () => mockUseReducedMotion(),
  };
});

/**
 * Coverage for the count-up animation primitive added by the animation work.
 * The stat cards and strength gauges animate their values from 0 up to the
 * target on load; this hook is the shared seam that drives those count-ups and
 * honors the prefers-reduced-motion preference.
 */
describe("useCountUp", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it("animates from 0 up to the target value", async () => {
    const { result } = renderHook(() => useCountUp(42));

    // The test rAF mock advances frames, so the count-up completes to the
    // target value.
    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it("jumps straight to the target when reduced motion is preferred", () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { result } = renderHook(() => useCountUp(42));
    expect(result.current).toBe(42);
  });
});
