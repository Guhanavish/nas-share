import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPointerDevice] = useState(() => {
    if (typeof window === "undefined") return false;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    return !prefersReducedMotion && !isTouch;
  });

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Smooth spring physics for cursor follow
  const cursorX = useSpring(rawX, { stiffness: 450, damping: 32 });
  const cursorY = useSpring(rawY, { stiffness: 450, damping: 32 });

  useEffect(() => {
    if (!isPointerDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if target or ancestor is interactive (button, a, input, [role="button"])
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = !!target.closest("button, a, [role='button'], input, textarea, select, .interactive-hover");
        setIsHovered(interactive);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isPointerDevice, isVisible, rawX, rawY]);

  if (!isPointerDevice || !isVisible) return null;

  return (
    <>
      {/* Central precise dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] w-1.5 h-1.5 rounded-full bg-cyan-mesh"
        style={{
          x: rawX,
          y: rawY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Fluid trailing ring that expands over buttons/links */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-cyan-mesh/50 transition-colors"
        animate={{
          width: isHovered ? 44 : 26,
          height: isHovered ? 44 : 26,
          backgroundColor: isHovered ? "rgba(56, 189, 248, 0.12)" : "rgba(56, 189, 248, 0)",
          borderColor: isHovered ? "rgba(56, 189, 248, 0.8)" : "rgba(56, 189, 248, 0.35)",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
}
