export type BreakPointTypes = "desktop" | "mobile";

export type Breakpoints = Record<BreakPointTypes, number>;

export const breakpoints: Breakpoints = {
  desktop: 1200,
  mobile: 880,
};

export const media: Record<BreakPointTypes, string> = {
  desktop: `@media (min-width: ${breakpoints.mobile}px)`,
  mobile: `@media (max-width: ${breakpoints.mobile}px)`,
};
