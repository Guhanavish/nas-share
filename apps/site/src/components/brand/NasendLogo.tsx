import { motion } from "motion/react";
import { TOKENS } from "../../tokens";

interface NasendLogoProps {
  size?: number;
  className?: string;
  animateOnMount?: boolean;
}

/**
 * Brand System: Minimal Two-Node Linked Logo Mark
 * Built from simple geometry in one color.
 * On first load: strokes the two nodes, then draws the connecting link (Item 15).
 */
export function NasendLogo({
  size = 20,
  className = "",
  animateOnMount = true,
}: NasendLogoProps) {
  const { duration, ease } = TOKENS.motion;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Two Linked Nodes SVG Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#38bdf8] shrink-0"
        aria-hidden="true"
      >
        {/* Node A (Left) */}
        <motion.circle
          cx="6"
          cy="12"
          r="3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={animateOnMount ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: duration.normal, ease: ease.standard }}
        />

        {/* Node B (Right) */}
        <motion.circle
          cx="18"
          cy="12"
          r="3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={animateOnMount ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: duration.normal, delay: 0.1, ease: ease.standard }}
        />

        {/* Connecting Link Line */}
        <motion.line
          x1="9.5"
          y1="12"
          x2="14.5"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={animateOnMount ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: duration.fast, delay: 0.25, ease: ease.standard }}
        />
      </svg>

      {/* Wordmark: "nasend" in lowercase with custom letter spacing (Item 2) */}
      <span className="font-semibold text-sm tracking-[-0.035em] text-[#f0f6fc] lowercase">
        nasend
      </span>
    </div>
  );
}
