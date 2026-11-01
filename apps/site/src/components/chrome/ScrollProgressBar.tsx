import { motion, useScroll } from "motion/react";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-[#38bdf8] origin-left z-[100] pointer-events-none"
      aria-hidden="true"
    />
  );
}
