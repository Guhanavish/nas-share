/**
 * Animate the favicon subtly: nodes connect/pulse with sage accent when tab is visible
 */
export function initFaviconAnimation() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!favicon) return;

  const connectedSvg = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="%230C0D0C"/><circle cx="9" cy="16" r="4.5" fill="none" stroke="%23A3B899" stroke-width="2"/><circle cx="23" cy="16" r="4.5" fill="none" stroke="%23A3B899" stroke-width="2"/><line x1="13.5" y1="16" x2="18.5" y2="16" stroke="%23A3B899" stroke-width="2" stroke-linecap="round"/></svg>`;
  const activeSvg = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="%230C0D0C"/><circle cx="9" cy="16" r="4.5" fill="%23A3B899"/><circle cx="23" cy="16" r="4.5" fill="%23A3B899"/><line x1="13.5" y1="16" x2="18.5" y2="16" stroke="%23A3B899" stroke-width="2" stroke-linecap="round"/></svg>`;

  let isPulse = false;
  const timer = setInterval(() => {
    if (document.hidden) return;
    isPulse = !isPulse;
    favicon.href = isPulse ? activeSvg : connectedSvg;
  }, 5000);

  return () => clearInterval(timer);
}
