import { motion } from "motion/react";
import { TOKENS } from "../../tokens";
import { hasIntroPlayed, markIntroPlayed } from "../../lib/intro";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

interface NasendLogoProps {
  size?: number;
  className?: string;
  animateOnMount?: boolean;
}

/**
 * Brand System: Minimal Two-Node Linked Logo Mark
 * Built from pure geometry in signature sage accent (#A3B899).
 * Strokes the two device nodes (0-450ms), then establishes the direct connection link.
 */
export function NasendLogo({
  size = 22,
  className = "",
  animateOnMount = true,
}: NasendLogoProps) {
  const { ease } = TOKENS.motion;
  const reduced = usePrefersReducedMotion();
  const shouldAnimate = animateOnMount && !reduced && !hasIntroPlayed();

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Two Linked Nodes SVG Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#A3B899] shrink-0"
        aria-hidden="true"
      >
        {/* Node A (Sender device) */}
        <motion.circle
          cx="6"
          cy="12"
          r="3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: ease.standard }}
        />

        {/* Node B (Receiver device) */}
        <motion.circle
          cx="18"
          cy="12"
          r="3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.08, ease: ease.standard }}
        />

        {/* Direct P2P Link */}
        <motion.line
          x1="9.5"
          y1="12"
          x2="14.5"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.22, delay: 0.22, ease: ease.standard }}
          onAnimationComplete={() => {
            if (shouldAnimate) markIntroPlayed();
          }}
        />
      </svg>

      {/* Wordmark: "nasend" in Space Grotesk / lowercase with tight letter spacing */}
      <span className="font-display font-semibold text-[15px] tracking-tight text-[#F2F3F0] lowercase">
        nasend
      </span>
    </div>
  );
}
