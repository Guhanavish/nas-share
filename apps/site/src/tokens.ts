/**
 * Nasend Brand & Motion Tokens
 * 
 * Brand Voice: Plain, precise, technical, calm.
 * Motion Rule: Motion shows state change, spatial relationships, or hierarchy.
 * Every animation maps directly to a product action: pairing, connecting, transferring, encrypting, discovering.
 */

export const TOKENS = {
  brand: {
    name: "nasend", // Lowercase wordmark with custom tracking
    voice: "Plain, precise, technical, calm.",
    crockfordAlphabet: "ABCDEFGHJKMNPQRSTVWXYZ23456789",
    sampleCode: "K7M2-Q9XD",
  },
  colors: {
    // 4-step neutral scale
    bg: {
      base: "#0e1117",
      subtle: "#161b22",
      surface: "#21262d",
      border: "#30363d",
    },
    text: {
      primary: "#f0f6fc",
      muted: "#8b949e",
    },
    // Single accent hue - reserved ONLY for the logo mark, primary actions, and live-state indicators
    accent: {
      primary: "#38bdf8",
      hover: "#7dd3fc",
      active: "#0284c7",
      subtle: "rgba(56, 189, 248, 0.12)",
      border: "rgba(56, 189, 248, 0.35)",
    },
  },
  spacing: {
    scale: [0, 8, 16, 24, 32, 48, 64, 96],
    maxContent: "max-w-4xl mx-auto px-6",
  },
  typography: {
    fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  // Part B: Motion System - Exactly three durations and two easing curves (Items 11-14)
  motion: {
    duration: {
      fast: 0.15,   // 150ms: micro-interactions, button presses, tooltips
      normal: 0.3,  // 300ms: state transitions, modal/drawer reveals, packet moves
      slow: 0.6,    // 600ms: structural path morphing, entry reveals
    },
    ease: {
      standard: [0.16, 1, 0.3, 1] as const,     // standard cubic bezier
      decelerate: [0.05, 0.7, 0.1, 1] as const, // arrivals and element entries
    },
  },
} as const;
