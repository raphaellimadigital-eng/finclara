import "@testing-library/jest-dom/vitest";

// jsdom não implementa ResizeObserver — usado por components/GridMosaico.tsx pra recalcular o
// layout em mosaico quando o container é redimensionado.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
