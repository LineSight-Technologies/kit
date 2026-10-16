import "@testing-library/jest-dom/vitest";

// Radix and cmdk touch layout APIs jsdom does not implement.
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
if (!window.ResizeObserver) {
  class RO { observe() {} unobserve() {} disconnect() {} }
  window.ResizeObserver = RO as unknown as typeof ResizeObserver;
}
if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false;
if (!Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {};
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList;
}
