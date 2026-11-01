/**
 * Nasend Design Tokens
 * Strictly minimal, neutral 4-step scale, single accent color, 8px spacing system.
 */

export const TOKENS = {
  colors: {
    // 4-step neutral scale
    bg: {
      base: "#0e1117",
      subtle: "#161b22",
      surface: "#21262d",
      border: "#30363d",
    },
    // Typography
    text: {
      primary: "#f0f6fc",
      muted: "#8b949e",
    },
    // Single accent color (for primary actions and links only)
    accent: {
      primary: "#38bdf8",
      hover: "#7dd3fc",
    },
  },
  spacing: {
    xs: "8px",
    sm: "16px",
    md: "24px",
    lg: "32px",
    xl: "48px",
    xxl: "64px",
    maxContent: "max-w-4xl mx-auto px-6",
  },
  typography: {
    fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  motion: {
    duration: 0.25,
    ease: [0.16, 1, 0.3, 1],
  },
} as const;
