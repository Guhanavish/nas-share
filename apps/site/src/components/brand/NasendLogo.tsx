interface NasendLogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  textClassName?: string;
  glow?: boolean;
}

/**
 * Nasend Sovereign Mesh Monogram
 * A unique, bespoke vector mark symbolizing the unbreakable trinity of
 * Phone, PC, and TV forming a sovereign infinity storage mesh.
 */
export function NasendLogo({
  size = 36,
  className = "",
  withText = false,
  textClassName = "",
  glow = true,
}: NasendLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 group/logo"
        style={{ width: size, height: size }}
      >
        {/* Ambient atmospheric backdrop glow */}
        {glow && (
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-mesh/30 via-indigo-mesh/20 to-emerald-mesh/25 blur-lg opacity-60 group-hover/logo:opacity-100 transition-opacity duration-500"
            aria-hidden="true"
          />
        )}

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full drop-shadow-[0_2px_12px_rgba(56,189,248,0.4)] transition-transform duration-300 group-hover/logo:scale-105"
        >
          <defs>
            {/* Primary gradient: Cyan Mesh to Electric Indigo */}
            <linearGradient id="nasendGrad1" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Inner secondary gradient */}
            <linearGradient id="nasendGrad2" x1="90" y1="20" x2="20" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>

            <filter id="nasendGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background subtle hexagon shield */}
          <polygon
            points="50,6 88,28 88,72 50,94 12,72 12,28"
            fill="rgba(15, 23, 42, 0.75)"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
          />

          {/* Trinity Interlocking Mesh Path: Three loops converging at the center core */}
          {/* Loop 1: Mobile Node (Top) */}
          <path
            d="M 50 20 C 62 20 72 30 68 44 C 64 56 50 54 50 64 C 50 54 36 56 32 44 C 28 30 38 20 50 20 Z"
            stroke="url(#nasendGrad1)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-700"
          />

          {/* Loop 2: Workstation PC Node (Bottom Right) */}
          <path
            d="M 68 76 C 78 68 82 54 70 44 C 58 36 54 48 46 52 C 54 48 50 34 38 42 C 26 50 32 66 44 74 C 52 80 60 82 68 76 Z"
            stroke="url(#nasendGrad2)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.85"
          />

          {/* Central Cryptographic Heart Token */}
          <circle cx="50" cy="50" r="5.5" fill="#38bdf8" filter="url(#nasendGlow)" />
          <circle cx="50" cy="50" r="2.2" fill="#ffffff" />

          {/* Satellite Peer Constellation Dots */}
          <circle cx="50" cy="14" r="2.5" fill="#38bdf8" />
          <circle cx="82" cy="68" r="2.5" fill="#818cf8" />
          <circle cx="18" cy="68" r="2.5" fill="#34d399" />
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display font-extrabold tracking-tight text-white ${
                textClassName || "text-lg sm:text-xl"
              }`}
            >
              Nasend
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase bg-cyan-mesh/10 text-cyan-mesh border border-cyan-mesh/25">
              P2P
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
            Device-as-NAS
          </span>
        </div>
      )}
    </div>
  );
}
