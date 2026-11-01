import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Lock, Unlock, ShieldAlert, Check } from "lucide-react";
import { TOKENS } from "../../tokens";

export function SecuritySection() {
  const [locked, setLocked] = useState(false);
  const [traversalDenied, setTraversalDenied] = useState(false);
  const [ringOffset, setRingOffset] = useState(0);
  const [code, setCode] = useState("K7M2Q9XD");

  const { duration, ease } = TOKENS.motion;

  // Animate lock closing as DTLS handshake completes
  useEffect(() => {
    const t = setTimeout(() => setLocked(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Animate path traversal guard
  useEffect(() => {
    const interval = setInterval(() => {
      setTraversalDenied((prev) => !prev);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Animate 5-minute ring countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setRingOffset((prev) => {
        if (prev >= 100) {
          const chars = TOKENS.brand.crockfordAlphabet;
          let next = "";
          for (let i = 0; i < 8; i++) next += chars[Math.floor(Math.random() * chars.length)];
          setCode(next);
          return 0;
        }
        return prev + 10;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="security" className="py-24 border-b border-[#343934]">
      <div className="mx-auto max-w-5xl px-6 space-y-16">
        <div className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[11px] font-mono text-[#929690] uppercase tracking-wider">
            <span>Cryptographic Boundaries</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F3F0]">
            Security &amp; server boundaries
          </h2>
          <p className="text-sm sm:text-base text-[#929690] leading-relaxed max-w-xl font-sans">
            Ephemeral signaling introduces peers. File bytes move directly through end-to-end encrypted DTLS 1.3 channels.
          </p>
        </div>

        {/* Security Demonstrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lock closing as DTLS completes */}
          <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#929690]">DTLS 1.3 Channel</span>
              <button
                onClick={() => setLocked((l) => !l)}
                className="text-[10px] font-mono text-[#A3B899] hover:underline cursor-pointer"
              >
                Toggle
              </button>
            </div>

            <div className="h-28 flex flex-col items-center justify-center bg-[#0C0D0C] rounded-lg border border-[#343934]">
              <motion.div
                animate={{ scale: locked ? 1 : 0.95 }}
                transition={{ duration: duration.normal, ease: ease.standard }}
                className={locked ? "text-[#A3B899]" : "text-[#929690]"}
              >
                {locked ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
              </motion.div>
              <span className="text-[10px] font-mono mt-2 text-[#F2F3F0]">
                {locked ? "DTLS Channel Encrypted" : "Negotiating Session..."}
              </span>
            </div>
          </div>

          {/* Path traversal guard */}
          <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#929690]">Sandbox Guard</span>
              <ShieldAlert className="w-3.5 h-3.5 text-[#929690]" />
            </div>

            <div className="h-28 p-3 flex flex-col justify-between bg-[#0C0D0C] rounded-lg border border-[#343934] font-mono text-[10px]">
              <div className="text-[#929690] truncate">
                GET /api/v1/file?path=../../etc/passwd
              </div>
              <div className="flex items-center justify-between border-t border-[#343934] pt-2">
                <span className="text-[#929690]">Result:</span>
                <span className={traversalDenied ? "text-rose-400 font-bold" : "text-[#929690]"}>
                  403 FORBIDDEN (DENIED)
                </span>
              </div>
            </div>
          </div>

          {/* 5-minute pairing code ring countdown */}
          <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#929690]">TTL Countdown</span>
              <span className="text-[10px] font-mono text-[#929690]">5-Min Expiry</span>
            </div>

            <div className="h-28 flex items-center justify-center gap-4 bg-[#0C0D0C] rounded-lg border border-[#343934]">
              {/* Circular SVG Ring Countdown */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#252825"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#A3B899"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <span className="absolute font-mono text-[9px] text-[#F2F3F0]">
                  {Math.max(0, 100 - ringOffset)}%
                </span>
              </div>

              <div className="font-mono text-xs">
                <p className="text-[#F2F3F0] font-semibold">{code}</p>
                <p className="text-[#929690] text-[9px]">Auto-regenerates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visualize "What the server sees" as two distinct columns */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-[#F2F3F0]">
            What the signaling server sees vs. what stays on device
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
            {/* Column A: What is Seen */}
            <div className="p-5 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-3">
              <span className="text-[#A3B899] font-semibold block text-[11px] uppercase tracking-wider">
                Visible to Cloudflare Worker (Signaling)
              </span>
              <ul className="space-y-2 text-[#929690]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#A3B899] shrink-0" />
                  <span>Temporary 8-character room coordinate (Crockford)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#A3B899] shrink-0" />
                  <span>SDP offer / answer codec parameters under 2 KB</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#A3B899] shrink-0" />
                  <span>Public IP address &amp; port routing candidates for STUN</span>
                </li>
              </ul>
            </div>

            {/* Column B: What is Never Seen */}
            <div className="p-5 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-3">
              <span className="text-[#F2F3F0] font-semibold block text-[11px] uppercase tracking-wider">
                Never Seen by Any Server
              </span>
              <ul className="space-y-2 text-[#929690]">
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold select-none">✕</span>
                  <span>File contents, binary chunks, or streams</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold select-none">✕</span>
                  <span>File names, directory paths, or folder manifests</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold select-none">✕</span>
                  <span>Private Ed25519 identity keys</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#343934] pt-6 flex items-center justify-between text-xs font-mono">
          <Link to="/security" className="text-[#A3B899] hover:underline">
            View full security protocol specification →
          </Link>
          <span className="text-[#929690]">Single-use burn guarantee</span>
        </div>
      </div>
    </section>
  );
}
