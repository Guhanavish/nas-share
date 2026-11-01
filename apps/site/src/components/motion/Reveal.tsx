import { motion, type HTMLMotionProps } from "motion/react";
import { TOKENS } from "../../tokens";

const { duration, ease, distance } = TOKENS.motion;

type RevealProps = {
  delay?: number;
  y?: number;
  index?: number;
} & HTMLMotionProps<"div">;

export function Reveal({ delay = 0, y = distance.reveal, index, children, ...rest }: RevealProps) {
  const calculatedDelay = index !== undefined ? delay + index * TOKENS.motion.stagger.base : delay;

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: duration.reveal, delay: calculatedDelay, ease: ease.standard }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type RevealGroupProps = {
  stagger?: number;
  children: React.ReactNode;
  className?: string;
};

export function RevealGroup({
  stagger = TOKENS.motion.stagger.base,
  children,
  className = "",
}: RevealGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
