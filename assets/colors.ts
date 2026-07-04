/**
 * Memo brand color palette.
 * Use these constants for brand-specific UI elements.
 */

export const MemoColors = {
  /** Main Blue */
  mainBlue: '#2385ff',
  /** Secondary Blue */
  secondaryBlue: '#4aa8fe',
  /** White */
  white: '#ffffff',
  /** Black */
  black: '#282828',
} as const;

export type MemoColor = keyof typeof MemoColors;
