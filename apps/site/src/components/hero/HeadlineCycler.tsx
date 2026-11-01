import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const PHRASES = [
  { text: "Your Phone.", accent: "from-cyan-mesh to-indigo-mesh" },
  { text: "Your PC.", accent: "from-indigo-mesh to-emerald-mesh" },
  { text: "Your TV.", accent: "from-emerald-mesh to-amber-mesh" },
  { text: "One Private Cloud.", accent: "from-cyan-mesh via-indigo-mesh to-emerald-mesh" },
];

export function HeadlineCycler() {
  const [index, setIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? PHRASES.length - 1
      : 0;
  });
  const [hasSettled, setHasSettled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (hasSettled) return;

    const timer = setTimeout(() => {
      if (index < PHRASES.length - 1) {
        setIndex((prev) => prev + 1);
      } else {
        setHasSettled(true);
      }
    }, index === PHRASES.length - 2 ? 2400 : 1800);

    return () => clearTimeout(timer);
  }, [index, hasSettled]);

  const current = PHRASES[index];

  return (
    <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] min-h-[2.2em] sm:min-h-[2.1em] flex flex-col justify-start">
      <span className="text-white/90">Your Devices.</span>
      <span className="relative block h-[1.3em] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={current.text}
            initial={{ y: 40, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -40, opacity: 0, filter: "blur(8px)" }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`inline-block text-transparent bg-clip-text bg-gradient-to-r ${current.accent} text-glow-cyan`}
          >
            {current.text}
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}
