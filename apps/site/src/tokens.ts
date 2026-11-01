/**
 * Nasend Design System & Motion Tokens
 * Centralized design tokens for colors, transport semantics, spacing, springs, and motion timings.
 */

export const TOKENS = {
  colors: {
    // Dark-first surface & background hierarchy
    bg: {
      ink: '#060810',
      canvas: '#080c16',
      panel: '#0b101e',
      panelElevated: '#111827',
      card: '#0f172a',
      cardGlass: 'rgba(15, 23, 42, 0.65)',
      cardGlassBorder: 'rgba(255, 255, 255, 0.08)',
      cardGlassHighlight: 'rgba(255, 255, 255, 0.14)',
    },
    // Typography tokens
    text: {
      snow: '#f8fafc',
      pureWhite: '#ffffff',
      fog: '#94a3b8',
      muted: '#64748b',
      subtle: '#475569',
    },
    // Core brand mesh gradients
    brand: {
      cyan: '#38bdf8',
      indigo: '#818cf8',
      emerald: '#34d399',
      amber: '#fbbf24',
    },
    // Transport semantics
    transport: {
      lan: {
        primary: '#14b8a6', // Teal 500
        light: '#2dd4bf',   // Teal 400
        glow: 'rgba(45, 212, 191, 0.35)',
        badge: 'rgba(20, 184, 166, 0.15)',
        border: 'rgba(45, 212, 191, 0.4)',
        label: 'Local Direct (mDNS / Wi-Fi)',
      },
      wan: {
        primary: '#9333ea', // Violet 600
        light: '#c084fc',   // Violet 400
        glow: 'rgba(192, 132, 252, 0.35)',
        badge: 'rgba(147, 51, 234, 0.15)',
        border: 'rgba(192, 132, 252, 0.4)',
        label: 'Encrypted Relay (Cloudflare DO)',
      },
    },
    // System status accents
    status: {
      online: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#38bdf8',
    },
  },
  spacing: {
    sectionPadding: 'py-24 sm:py-32',
    containerMax: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    cardPadding: 'p-6 sm:p-8',
  },
  motion: {
    // Standard durations (ms)
    duration: {
      instant: 0.15,
      fast: 0.25,
      normal: 0.4,
      slow: 0.7,
      scenic: 1.2,
      aurora: 22,
    },
    // Spring physics presets for micro-interactions
    spring: {
      bouncy: { stiffness: 400, damping: 25 },
      snappy: { stiffness: 300, damping: 30 },
      gentle: { stiffness: 180, damping: 24 },
      magnetic: { stiffness: 250, damping: 18 },
    },
    // Easing curves
    ease: {
      outQuint: [0.22, 1, 0.36, 1],
      inOutCubic: [0.65, 0, 0.35, 1],
    },
  },
} as const;

export type ThemeTokens = typeof TOKENS;
