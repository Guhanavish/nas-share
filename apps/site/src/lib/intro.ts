export const INTRO_HEADLINE_DELAY = 0.5; // 500ms

export function hasIntroPlayed(): boolean {
  try {
    return typeof window !== "undefined" && Boolean(sessionStorage.getItem("nasend:intro"));
  } catch {
    return false;
  }
}

export function markIntroPlayed(): void {
  try {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("nasend:intro", "true");
    }
  } catch {
    // sessionStorage unavailable or restricted
  }
}
