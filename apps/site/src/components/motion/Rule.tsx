import { motion, useReducedMotion } from "motion/react";
import { TOKENS } from "../../tokens";

interface RuleProps {
  className?: string;
  delay?: number;
}

export function Rule({ className = "absolute bottom-0 inset-x-0", delay = 0 }: RuleProps) {
  const shouldReduce = useReducedMotion();
  const { duration, ease } = TOKENS.motion;

  if (shouldReduce) {
    return <div className={`h-[1px] bg-[#343934] ${className}`} />;
  }

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: duration.reveal, delay, ease: ease.standard }}
      className={`h-[1px] bg-[#343934] origin-left ${className}`}
    />
  );
}
