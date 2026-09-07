import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// Generated components use data-ocid attributes for test hooks. Configure
// Testing Library to treat them as test ids so we can query them semantically.
configure({ testIdAttribute: "data-ocid" });

// next-themes uses window.matchMedia to detect the system color scheme.
// jsdom does not implement it, so provide a minimal stub.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// recharts' ResponsiveContainer observes its parent element for size changes.
// jsdom does not implement ResizeObserver, so provide a minimal stub.
if (typeof window !== "undefined" && !window.ResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: ResizeObserverStub,
  });
}

// Motion and useCountUp drive their animations through requestAnimationFrame.
// jsdom registers the callback but never advances a frame, so count-up values
// stay at their starting value and content gated behind AnimatePresence exit
// transitions never mounts. Fire each frame asynchronously with a timestamp far
// enough ahead that one-shot animations (count-ups, entrance/exit transitions)
// complete deterministically in tests.
let rafId = 0;
window.requestAnimationFrame = (cb: FrameRequestCallback) => {
  rafId += 1;
  const id = rafId;
  setTimeout(() => {
    cb(performance.now() + 10000);
  }, 0);
  return id;
};
window.cancelAnimationFrame = () => {};
