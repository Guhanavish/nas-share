import { useRef, type ReactNode, type ButtonHTMLAttributes } from "react";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "glass" | "ghost";
  onClick?: () => void;
}

/**
 * Emil Kowalski-standard Magnetic Button
 * Direct rAF-driven pointer tracking without React state re-renders.
 * Spring recovers to 0,0 on leave and compresses to scale(0.97) on press.
 */
export function MagneticButton({
  children,
  className = "",
  variant = "primary",
  onClick,
  ...props
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const btnRectRef = useRef<DOMRect | null>(null);
  const btnRafRef = useRef<number | null>(null);
  const posRef = useRef({ x: 0, y: 0 });

  const handlePointerEnter = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (btnRef.current) {
      btnRectRef.current = btnRef.current.getBoundingClientRect();
      btnRef.current.style.willChange = "transform";
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    posRef.current = { x: e.clientX, y: e.clientY };

    if (btnRafRef.current == null) {
      btnRafRef.current = window.requestAnimationFrame(() => {
        btnRafRef.current = null;
        if (!btnRef.current || !btnRectRef.current) return;
        const rect = btnRectRef.current;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(-10, Math.min(10, (posRef.current.x - cx) * 0.28));
        const dy = Math.max(-10, Math.min(10, (posRef.current.y - cy) * 0.28));
        btnRef.current.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      });
    }
  };

  const handlePointerLeave = () => {
    if (btnRafRef.current != null) {
      window.cancelAnimationFrame(btnRafRef.current);
      btnRafRef.current = null;
    }
    btnRectRef.current = null;
    if (btnRef.current) {
      btnRef.current.style.transform = "translate3d(0, 0, 0)";
      btnRef.current.style.willChange = "";
    }
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-cyan-mesh via-indigo-mesh to-emerald-mesh text-white font-semibold shadow-[0_0_24px_rgba(56,189,248,0.35)] hover:shadow-[0_0_36px_rgba(56,189,248,0.55)] border border-white/20",
    glass:
      "bg-white/[0.05] hover:bg-white/[0.1] text-snow border border-white/10 hover:border-cyan-mesh/40 backdrop-blur-xl shadow-lg",
    ghost:
      "text-fog hover:text-snow hover:bg-white/5 border border-transparent hover:border-white/10",
  };

  return (
    <button
      ref={btnRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-display text-sm tracking-wide transition-[transform,background,border,box-shadow] duration-200 active:scale-[0.97] cursor-pointer select-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
