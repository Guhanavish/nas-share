import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ShieldCheck, RotateCcw } from "lucide-react";
import { SectionHeader } from "../motion/SectionHeader";
import { Rule } from "../motion/Rule";
import { CodeExpiryRing } from "../motion/CodeExpiryRing";
import { TOKENS } from "../../tokens";
import { useActive } from "../../lib/useActive";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

function getRandomCode(): string {
  const chars = TOKENS.brand.crockfordAlphabet;
  let next = "";
  for (let i = 0; i < 8; i++) next += chars[Math.floor(Math.random() * chars.length)];
  return `${next.slice(0, 4)}-${next.slice(4)}`;
}

export function SecuritySection() {
  const [locked, setLocked] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const [showRefusal, setShowRefusal] = useState(false);
  const [code, setCode] = useState(getRandomCode());
  const [demoKey, setDemoKey] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const isActive = useActive(sectionRef);
  const reduced = usePrefersReducedMotion();
  const { ease } = TOKENS.motion;

  // Item 26: Lock closes on enter view (shackle translates down + spring)
  useEffect(() => {
    if (!isActive) return;
    const t = setTimeout(() => setLocked(true), 600);
    return () => clearTimeout(t);
  }, [isActive]);

  // Item 27: Blocked path-traversal demo typewriter effect
  const requestString = "GET /api/v1/files/download?path=../../etc/passwd";

  useEffect(() => {
    if (!isActive) return;

    let charIdx = 0;
    const interval = window.setInterval(() => {
      charIdx += 1;
      setTypedChars(charIdx);
      if (charIdx >= requestString.length) {
        window.clearInterval(interval);
        setTimeout(() => setShowRefusal(true), 150);
      }
    }, 28);

    return () => window.clearInterval(interval);
  }, [isActive, demoKey, requestString.length]);

  const handleReplayTraversal = () => {
    setTypedChars(0);
    setShowRefusal(false);
    setDemoKey((k) => k + 1);
  };

  // Item 29: Server sees vs Never sees lists
  const serverSees = [
    "Ephemeral room coordinate (Crockford Base32)",
    "WebRTC SDP offer & answer session metadata",
    "STUN & ICE candidate routing endpoints",
  ];

  const serverNeverSees = [
    "File contents, binary chunks, or streams",
    "Directory structure & file names",
    "Private Ed25519 identity keypairs",
  ];

  return (
    <section id="security" ref={sectionRef} className="relative py-24 bg-[#0C0D0C] overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 space-y-16">
        {/* Item 19: Unified SectionHeader */}
        <SectionHeader
          eyebrow="Cryptographic Boundaries"
          title="Security & server boundaries"
          description="Ephemeral signaling introduces peers. File bytes move directly through end-to-end encrypted DTLS channels."
        />

        {/* Security Demonstrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Item 26: Padlock with shackle moving from open to closed */}
          <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#929690]">Transport Channel</span>
              <button
                type="button"
                onClick={() => setLocked((l) => !l)}
                className="text-[10px] font-mono text-[#A3B899] hover:underline cursor-pointer"
              >
                {locked ? "Unlock" : "Lock"}
              </button>
            </div>

            <div className="h-28 flex flex-col items-center justify-center bg-[#0C0D0C] rounded-lg border border-[#343934] p-2">
              <svg width="40" height="48" viewBox="0 0 40 48" fill="none" className="text-[#A3B899]">
                {/* Shackle: translates Y and rotates slightly when open */}
                <motion.path
                  d="M 12 20 V 12 C 12 7.58 15.58 4 20 4 C 24.42 4 28 7.58 28 12 V 20"
                  stroke="#A3B899"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={reduced ? false : { y: -4, rotate: -8 }}
                  animate={{
                    y: locked ? 0 : -4,
                    rotate: locked ? 0 : -8,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 24 }}
                  style={{ transformOrigin: "12px 20px" }}
                />
                {/* Padlock Body */}
                <rect x="6" y="20" width="28" height="24" rx="5" fill="#252825" stroke="#343934" strokeWidth="2" />
                <circle cx="20" cy="30" r="2.5" fill="#A3B899" />
                <line x1="20" y1="32.5" x2="20" y2="37" stroke="#A3B899" strokeWidth="2" strokeLinecap="round" />
              </svg>

              <span className="text-[10px] font-mono mt-2 text-[#F2F3F0]">
                {locked ? "DTLS handshake complete" : "Negotiating handshake..."}
              </span>
            </div>

            <p className="text-[11px] font-mono text-[#929690] leading-tight">
              WAN uses DTLS (mandatory); LAN TLS is optional.
            </p>
          </div>

          {/* Item 27: Blocked path-traversal demo with real endpoint and refusal text */}
          <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#929690]">Sandbox Guard</span>
              <button
                type="button"
                onClick={handleReplayTraversal}
                className="flex items-center gap-1 text-[10px] font-mono text-[#A3B899] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Replay</span>
              </button>
            </div>

            <div className="h-28 p-3 flex flex-col justify-between bg-[#0C0D0C] rounded-lg border border-[#343934] font-mono text-[10px]">
              <div className="text-[#929690] break-all leading-relaxed">
                <span>{requestString.slice(0, typedChars)}</span>
                <span className="inline-block w-1.5 h-3 bg-[#A3B899] motion-safe:animate-pulse align-middle ml-0.5" />
              </div>

              {showRefusal && (
                <div className="flex items-center justify-between border-t border-[#343934] pt-1.5">
                  <span className="text-[#929690]">Status:</span>
                  <span className="px-1.5 py-0.5 rounded border border-[#343934] bg-[#252825] text-[#F2F3F0] font-bold">
                    403 DENIED
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] font-mono text-[#929690] leading-tight">
              Canonicalization rejects directory traversal escapes.
            </p>
          </div>

          {/* Item 28: Code-expiry ring at 10x speed with honest label */}
          <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#929690]">TTL Countdown</span>
              <span className="text-[10px] font-mono text-[#A3B899]">shown at 10× speed</span>
            </div>

            <div className="h-28 flex items-center justify-center gap-4 bg-[#0C0D0C] rounded-lg border border-[#343934]">
              {/* Circular SVG Ring Countdown at 10x speed (30s duration) */}
              <CodeExpiryRing
                durationMs={30000}
                running={isActive}
                onExpire={() => setCode(getRandomCode())}
                size={36}
                strokeWidth={3}
              />

              <div className="font-mono text-xs">
                <p className="text-[#F2F3F0] font-semibold tracking-wider">{code}</p>
                <p className="text-[#929690] text-[10px]">Auto-regenerates</p>
              </div>
            </div>

            <p className="text-[11px] font-mono text-[#929690] leading-tight">
              Single-use 5-minute expiry prevents replay attacks.
            </p>
          </div>
        </div>

        {/* Item 29: Visualize "What the server sees vs never sees" with strikethrough animation */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-[#F2F3F0]">
            Signaling server visibility boundary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
            {/* Column A: What the Cloudflare Worker sees */}
            <div className="p-5 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-3">
              <span className="text-[#A3B899] font-semibold block text-[11px] uppercase tracking-wider">
                Visible to Worker (Signaling Only)
              </span>
              <ul className="space-y-2 text-[#929690] list-none p-0 m-0">
                {serverSees.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={reduced ? false : { opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.06, ease: ease.standard }}
                    className="flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A3B899] shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Column B: What is Never Seen (with drawing strike-through) */}
            <div className="p-5 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-3">
              <span className="text-[#F2F3F0] font-semibold block text-[11px] uppercase tracking-wider">
                Never Seen by Any Server
              </span>
              <ul className="space-y-2 text-[#929690] list-none p-0 m-0">
                {serverNeverSees.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={reduced ? false : { opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.06, ease: ease.standard }}
                    className="relative flex items-center gap-2 group"
                  >
                    <span className="text-[#A3B899] font-mono font-bold select-none shrink-0">✕</span>
                    <span className="relative">
                      {item}
                      {/* 1px strike line drawing across (Item 29) */}
                      <motion.span
                        initial={reduced ? false : { scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.35 + i * 0.06, ease: ease.standard }}
                        className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#929690] origin-left pointer-events-none opacity-60"
                      />
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#343934] pt-6 flex items-center justify-between text-xs font-mono">
          <Link to="/security" className="text-[#A3B899] hover:underline link-underline">
            View full security protocol specification →
          </Link>
          <span className="text-[#929690]">Single-use burn guarantee</span>
        </div>
      </div>
      <Rule />
    </section>
  );
}
