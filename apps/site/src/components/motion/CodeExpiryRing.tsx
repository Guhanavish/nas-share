import { useEffect, useState, useRef } from "react";

interface CodeExpiryRingProps {
  durationMs?: number;
  running?: boolean;
  onExpire?: () => void;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CodeExpiryRing({
  durationMs = 300000, // 5 minutes default (300,000ms)
  running = true,
  onExpire,
  size = 16,
  strokeWidth = 2,
  className = "",
}: CodeExpiryRingProps) {
  const [progress, setProgress] = useState(1); // 1 = full, 0 = empty
  const startedAtRef = useRef<number>(0);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!running) return;

    const interval = window.setInterval(() => {
      if (!startedAtRef.current) return;
      const elapsed = Date.now() - startedAtRef.current;
      const remainingFraction = Math.max(0, 1 - elapsed / durationMs);
      setProgress(remainingFraction);

      if (remainingFraction <= 0) {
        startedAtRef.current = Date.now();
        setProgress(1);
        onExpireRef.current?.();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [durationMs, running]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`-rotate-90 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#252825"
        strokeWidth={strokeWidth}
      />
      {/* Dynamic progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#A3B899"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 1s linear",
        }}
      />
    </svg>
  );
}
