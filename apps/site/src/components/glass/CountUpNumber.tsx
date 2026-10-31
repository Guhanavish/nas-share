import { useEffect, useRef, useState } from "react";

interface CountUpNumberProps {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

/**
 * Animated number count-up that triggers when scrolling into view.
 * Renders final static value in DOM fallback so screen readers see the real value instantly.
 */
export function CountUpNumber({
  end,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1400,
  className = "",
}: CountUpNumberProps) {
  const [val, setVal] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? end
      : 0
  );
  const [hasAnimated, setHasAnimated] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic curve: 1 - (1 - progress)^3
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setVal(easeOut * end);
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setVal(end);
            }
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    if (spanRef.current) {
      observer.observe(spanRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={spanRef} className={`font-mono tabular-nums ${className}`}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}
