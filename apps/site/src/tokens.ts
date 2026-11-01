/**
 * NASend Brand & Motion Tokens — GRAPHITE & SAGE
 * 
 * Palette:
 * Primary background:   #0C0D0C
 * Secondary surface:    #1B1D1B
 * Elevated surface:     #252825
 * Deep contrast:        #080A08
 * Subtle borders:       #343934
 * Strong borders:       #414741
 * Primary text:         #F2F3F0
 * Secondary text:       #929690
 * Signature sage:       #A3B899
 * 
 * Typography:
 * Primary UI:           Geist
 * Display:              Space Grotesk
 * Monospace:            ui-monospace, SFMono-Regular, "Geist Mono", monospace
 */

export const TOKENS = {
  brand: {
    name: "nasend",
    voice: "Plain, precise, technical, calm.",
    crockfordAlphabet: "ABCDEFGHJKMNPQRSTVWXYZ23456789",
    sampleCode: "K7M2-Q9XD",
  },
  colors: {
    bg: {
      primary: "#0C0D0C",
      secondary: "#1B1D1B",
      elevated: "#252825",
      deep: "#080A08",
    },
    border: {
      subtle: "#343934",
      strong: "#414741",
    },
    text: {
      primary: "#F2F3F0",
      secondary: "#929690",
    },
    // Signature Sage Accent (approx 10% visual distribution)
    accent: {
      primary: "#A3B899",
      hover: "#B5C8AC",
      active: "#8DA283",
      subtle: "rgba(163, 184, 153, 0.12)",
      border: "rgba(163, 184, 153, 0.35)",
      glow: "rgba(163, 184, 153, 0.2)",
    },
  },
  typography: {
    fontSans: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontDisplay: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, "Geist Mono", Menlo, Consolas, monospace',
  },
  spacing: {
    scale: [0, 4, 8, 12, 16, 24, 32, 48, 64, 80, 96],
    maxContent: "max-w-5xl mx-auto px-6",
  },
  motion: {
    duration: {
      fast: 0.18,       // 150–220ms: hover, micro-interactions
      button: 0.22,     // 180–250ms: buttons, focus states
      normal: 0.28,     // 200–350ms: card transitions, drawers
      page: 0.35,       // 250–450ms: page transitions
      reveal: 0.55,     // 450–650ms: section scroll reveals
      intro: 0.7,       // Intro sequence duration (spec item 1)
    },
    distance: {
      reveal: 12,
      micro: 4,
    },
    stagger: {
      tight: 0.04,
      base: 0.08,
    },
    ease: {
      standard: [0.16, 1, 0.3, 1] as const,
      decelerate: [0.05, 0.7, 0.1, 1] as const,
      spring: { type: "spring", stiffness: 380, damping: 28 },
    },
  },
} as const;
