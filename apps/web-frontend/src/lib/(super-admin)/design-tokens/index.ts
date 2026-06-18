export { colors } from './colors';
export { spacing, container, breakpoints } from './spacing';
export { typography, fontFamily } from './typography';

export const designTokens = {
  colors,
  spacing,
  container,
  breakpoints,
  typography,
  fontFamily,
} as const;

export type DesignTokens = typeof designTokens;
