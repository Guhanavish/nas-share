import { TOKENS } from "../tokens";

const CROCKFORD_CHARS = TOKENS.brand.crockfordAlphabet;
const CROCKFORD_SET = new Set(CROCKFORD_CHARS.split(""));
const CROCKFORD_RE = /^[ABCDEFGHJKMNPQRSTVWXYZ23456789]{4}-?[ABCDEFGHJKMNPQRSTVWXYZ23456789]{4}$/;

/**
 * Normalizes code: uppercase, strips whitespace and dashes, filters non-Crockford characters, max 8 chars
 */
export function normalizeCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .split("")
    .filter((ch) => CROCKFORD_SET.has(ch))
    .join("")
    .slice(0, 8);
}

/**
 * Validates whether the code matches the canonical Crockford Base32 pattern
 */
export function isValidCode(input: string): boolean {
  return CROCKFORD_RE.test(input.toUpperCase().trim());
}

/**
 * Formats input into XXXX-XXXX
 */
export function formatCode(input: string): string {
  const norm = normalizeCode(input);
  if (norm.length <= 4) return norm;
  return `${norm.slice(0, 4)}-${norm.slice(4)}`;
}

/**
 * Generates an 8-character Crockford Base32 pairing code using crypto.getRandomValues
 */
export function generateCode(): string {
  const randomBytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 8; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let res = "";
  for (let i = 0; i < 8; i++) {
    res += CROCKFORD_CHARS[randomBytes[i] % CROCKFORD_CHARS.length];
  }
  return `${res.slice(0, 4)}-${res.slice(4)}`;
}
