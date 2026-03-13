/**
 * Utilities for testing responsive behavior with matchMedia mock.
 */
import { render, type RenderOptions } from "@testing-library/react";
import { matchMediaMock } from "./matchMediaMock";

export type Viewport = "mobile" | "desktop";

const QUERY_DESKTOP = "(min-width: 1024px)";
const QUERY_MOBILE = "(max-width: 1023px)";

export function setViewport(viewport: Viewport): void {
  matchMediaMock.clear();
  matchMediaMock.useMediaQuery(
    viewport === "desktop" ? QUERY_DESKTOP : QUERY_MOBILE
  );
}

export function renderAtViewport(
  ui: React.ReactElement,
  viewport: Viewport,
  options?: Omit<RenderOptions, "wrapper">
): ReturnType<typeof render> {
  setViewport(viewport);
  return render(ui, options);
}
