import { useEffect, useRef } from "react";
import { TOKENS } from "../../tokens";
import { useActive } from "../../lib/useActive";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

/**
 * Brand Pattern derived from the Crockford Base32 Character Grid
 * Low-contrast architectural background texture with sparse character swaps.
 */
export function PairingCodeGridPattern() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const isActive = useActive(containerRef);
  const reduced = usePrefersReducedMotion();

  const chars = TOKENS.brand.crockfordAlphabet;
  const rows = 18;
  const cols = 28;
  const totalCells = rows * cols;

  useEffect(() => {
    if (reduced || !isActive) return;

    const interval = window.setInterval(() => {
      // Pick 4-6 random cells
      const swapCount = Math.floor(Math.random() * 3) + 4;
      for (let i = 0; i < swapCount; i++) {
        const targetIdx = Math.floor(Math.random() * totalCells);
        const cell = cellRefs.current[targetIdx];
        if (cell) {
          const nextChar = chars[Math.floor(Math.random() * chars.length)];
          cell.style.transition = "opacity 0.3s ease";
          cell.style.opacity = "0.2";
          setTimeout(() => {
            cell.textContent = nextChar;
            cell.style.opacity = "1";
          }, 150);
        }
      }
    }, 2400);

    return () => window.clearInterval(interval);
  }, [isActive, reduced, chars, totalCells]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-[0.05]"
      style={{
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)",
      }}
      aria-hidden="true"
    >
      <div className="font-mono text-[10px] tracking-[0.4em] leading-[2.2em] text-[#F2F3F0] grid grid-cols-[repeat(28,minmax(0,1fr))] text-center max-w-5xl mx-auto py-8">
        {Array.from({ length: totalCells }).map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            className="inline-block transition-opacity duration-300"
          >
            {chars[i % chars.length]}
          </span>
        ))}
      </div>
    </div>
  );
}
