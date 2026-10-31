interface DeviceLogoProps {
  className?: string;
  size?: number;
}

/** Bespoke Mobile Phone vector emblem with active radiating mDNS mesh waves */
export function MobileNodeLogo({ className = "", size = 32 }: DeviceLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="12"
        y="4"
        width="24"
        height="40"
        rx="6"
        fill="rgba(15, 23, 42, 0.8)"
        stroke="#38bdf8"
        strokeWidth="2"
      />
      {/* Screen area */}
      <rect x="15" y="8" width="18" height="28" rx="2" fill="rgba(56, 189, 248, 0.12)" />
      {/* Home touch bar */}
      <line x1="20" y1="40" x2="28" y2="40" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      {/* Dynamic peer transmission ripples */}
      <path
        d="M 6 18 C 3 22 3 26 6 30"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      <path
        d="M 42 18 C 45 22 45 26 42 30"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      {/* Status dot */}
      <circle cx="24" cy="22" r="3" fill="#34d399" />
    </svg>
  );
}

/** Bespoke High-Performance Workstation PC emblem with illuminated NVMe storage banks */
export function WorkstationNodeLogo({ className = "", size = 32 }: DeviceLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Workstation chassis */}
      <rect
        x="8"
        y="6"
        width="32"
        height="28"
        rx="4"
        fill="rgba(15, 23, 42, 0.85)"
        stroke="#818cf8"
        strokeWidth="2"
      />
      {/* Base stand */}
      <path d="M 18 34 L 14 42 L 34 42 L 30 34" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round" />
      {/* Screen matrix grid lines */}
      <line x1="12" y1="12" x2="36" y2="12" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="12" y1="18" x2="36" y2="18" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="12" y1="24" x2="36" y2="24" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Active NVMe speed indicator */}
      <rect x="12" y="27" width="8" height="3" rx="1" fill="#38bdf8" />
      <circle cx="34" cy="28.5" r="2" fill="#34d399" />
    </svg>
  );
}

/** Bespoke Living Room Android TV emblem with direct 4K beam */
export function LivingRoomTvLogo({ className = "", size = 32 }: DeviceLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sleek wide display bezel */}
      <rect
        x="4"
        y="8"
        width="40"
        height="26"
        rx="3"
        fill="rgba(15, 23, 42, 0.85)"
        stroke="#a855f7"
        strokeWidth="2"
      />
      {/* Slim aesthetic dual feet */}
      <path d="M 10 34 L 7 40" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
      <path d="M 38 34 L 41 40" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
      {/* 4K stream play triangle icon */}
      <polygon points="21,16 29,21 21,26" fill="#38bdf8" />
      {/* Ambient soundbar bar */}
      <line x1="16" y1="31" x2="32" y2="31" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Bespoke "Zero Tollbooth" emblem indicating $0 Cloud/VPS costs */
export function CloudTollLogo({ className = "", size = 32 }: DeviceLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cloud silhouette */}
      <path
        d="M 14 34 C 9 34 6 30 6 25 C 6 20 10 16 15 16 C 17 10 23 8 28 9 C 33 10 37 14 38 18 C 42 19 44 23 44 27 C 44 31 40 34 36 34 Z"
        stroke="#f43f5e"
        strokeWidth="2"
        strokeLinecap="round"
        fill="rgba(244, 63, 94, 0.08)"
      />
      {/* Rent slash barrier */}
      <line x1="12" y1="36" x2="36" y2="12" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
      {/* Centered $ symbol */}
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fontSize="12"
        fontFamily="sans-serif"
        fontWeight="bold"
        fill="#f43f5e"
      >
        $
      </text>
    </svg>
  );
}
