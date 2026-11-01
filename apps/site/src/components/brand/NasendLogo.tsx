interface NasendLogoProps {
  size?: number;
  className?: string;
}

/**
 * Minimal Geometric Wordmark
 * Single-weight hairline geometry with clean typography. No gradients, no glow, no blur.
 */
export function NasendLogo({ size = 20, className = "" }: NasendLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none font-medium text-white ${className}`}>
      {/* 1px hairline square node emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#f0f6fc] shrink-0"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      </svg>
      <span className="font-semibold text-base tracking-tight text-[#f0f6fc]">
        Nasend
      </span>
    </div>
  );
}
