interface FeatureGlyphProps {
  className?: string;
  size?: number;
}

/** 8-Rune Crockford Base32 Key Cipher Glyph */
export function RunePairingGlyph({ className = "", size = 28 }: FeatureGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="18" cy="18" r="14" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="3 3" />
      <polygon points="18,7 27,18 18,29 9,18" stroke="#fbbf24" strokeWidth="1.8" fill="rgba(251, 191, 36, 0.1)" />
      <circle cx="18" cy="18" r="3" fill="#fbbf24" />
      <circle cx="18" cy="11" r="1.5" fill="#ffffff" />
      <circle cx="25" cy="18" r="1.5" fill="#ffffff" />
      <circle cx="18" cy="25" r="1.5" fill="#ffffff" />
      <circle cx="11" cy="18" r="1.5" fill="#ffffff" />
    </svg>
  );
}

/** Direct LAN mDNS Lightning Beam Glyph */
export function LocalMdnsGlyph({ className = "", size = 28 }: FeatureGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M 19 4 L 9 19 L 17 19 L 15 32 L 27 15 L 19 15 Z"
        stroke="#34d399"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="rgba(52, 211, 153, 0.12)"
      />
      <circle cx="8" cy="8" r="2" fill="#34d399" />
      <circle cx="28" cy="28" r="2" fill="#34d399" />
    </svg>
  );
}

/** WebRTC DTLS End-to-End Encrypted Handshake Glyph */
export function WebRtcLockGlyph({ className = "", size = 28 }: FeatureGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="8"
        y="14"
        width="20"
        height="16"
        rx="3"
        stroke="#818cf8"
        strokeWidth="1.8"
        fill="rgba(129, 140, 248, 0.12)"
      />
      <path
        d="M 12 14 V 10 C 12 6.7 14.7 4 18 4 C 21.3 4 24 6.7 24 10 V 14"
        stroke="#818cf8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="18" cy="21" r="2.5" fill="#818cf8" />
      <line x1="18" y1="23.5" x2="18" y2="26.5" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** HTTP 206 Sub-Millisecond Sinusoidal Range Stream Glyph */
export function StreamWaveGlyph({ className = "", size = 28 }: FeatureGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M 4 18 C 7 10 11 10 14 18 C 17 26 21 26 24 18 C 27 10 31 10 32 18"
        stroke="#38bdf8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M 4 18 C 7 14 11 14 14 18 C 17 22 21 22 24 18 C 27 14 31 14 32 18"
        stroke="#818cf8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
      <circle cx="14" cy="18" r="2.5" fill="#38bdf8" />
      <circle cx="24" cy="18" r="2.5" fill="#38bdf8" />
    </svg>
  );
}
