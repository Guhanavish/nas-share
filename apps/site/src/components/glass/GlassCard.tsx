import { useRef, type ReactNode, type HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  glowColor?: "cyan" | "indigo" | "emerald" | "amber";
}

/**
 * High-performance Glassmorphic Card
 * Features:
 * - Backdrop blur with frosted glass layered border
 * - Mouse-following specular reflection spotlight via CSS variables (--mouse-x, --mouse-y)
 * - Spring 3D tilt tracking with automatic reduced-motion & touch fallback
 */
export function GlassCard({
  children,
  className = "",
  tilt = true,
  glowColor = "cyan",
  ...props
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);

    if (tilt && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(
        2
      )}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    }
  };

  const handlePointerLeave = () => {
    if (!cardRef.current) return;
    if (tilt) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
    }
  };

  const glowBorderMap = {
    cyan: "hover:border-cyan-mesh/30 hover:shadow-[0_20px_50px_rgba(56,189,248,0.12)]",
    indigo: "hover:border-indigo-mesh/30 hover:shadow-[0_20px_50px_rgba(129,140,248,0.12)]",
    emerald: "hover:border-emerald-mesh/30 hover:shadow-[0_20px_50px_rgba(52,211,153,0.12)]",
    amber: "hover:border-amber-mesh/30 hover:shadow-[0_20px_50px_rgba(251,191,36,0.12)]",
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`glass-card rounded-2xl relative overflow-hidden transition-all duration-300 ${glowBorderMap[glowColor]} ${className}`}
      style={{
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      {/* Dynamic specular mouse spotlight */}
      <div className="specular-glare" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
