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

  // Animate lock closing as DTLS handshake completes (Item 30)
  useEffect(() => {
    const t = setTimeout(() => setLocked(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Animate path traversal guard (Item 31)
  useEffect(() => {
    const interval = setInterval(() => {
      setTraversalDenied((prev) => !prev);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Animate 5-minute ring countdown (Item 32)
  useEffect(() => {
    const interval = setInterval(() => {
      setRingOffset((prev) => {
        if (prev >= 100) {
          // Regenerate new code when ring empties
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
    <section id="security" className="py-20 border-b border-[#30363d]">
      <div className="mx-auto max-w-4xl px-6 space-y-12">
        <div className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
            Cryptographic Boundary
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc]">
            Security &amp; server boundaries
          </h2>
          <p className="text-sm text-[#8b949e] leading-relaxed max-w-xl">
            Ephemeral signaling introduces peers. File bytes move directly through end-to-end encrypted DTLS 1.3 channels.
          </p>
        </div>

        {/* Security Demonstrations Grid (Items 30, 31, 32) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Item 30: Lock closing as DTLS completes */}
          <div className="p-5 rounded border border-[#30363d] bg-[#161b22] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#8b949e]">DTLS 1.3 Channel</span>
              <button
                onClick={() => setLocked((l) => !l)}
                className="text-[10px] font-mono text-[#38bdf8] hover:underline cursor-pointer"
              >
                Toggle
              </button>
            </div>

            <div className="h-24 flex flex-col items-center justify-center bg-[#0e1117] rounded border border-[#30363d]">
              <motion.div
                animate={{ scale: locked ? 1 : 0.95 }}
                transition={{ duration: duration.normal, ease: ease.standard }}
                className={locked ? "text-[#38bdf8]" : "text-[#8b949e]"}
              >
                {locked ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
              </motion.div>
              <span className="text-[10px] font-mono mt-2 text-[#f0f6fc]">
                {locked ? "DTLS Channel Encrypted" : "Negotiating Session..."}
              </span>
            </div>
          </div>

          {/* Item 31: Path traversal guard small animated terminal */}
          <div className="p-5 rounded border border-[#30363d] bg-[#161b22] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#8b949e]">Sandbox Guard</span>
              <ShieldAlert className="w-3.5 h-3.5 text-[#8b949e]" />
            </div>

            <div className="h-24 p-2.5 flex flex-col justify-between bg-[#0e1117] rounded border border-[#30363d] font-mono text-[10px]">
              <div className="text-[#8b949e] truncate">
                GET /api/v1/file?path=../../etc/passwd
              </div>
              <div className="flex items-center justify-between border-t border-[#30363d] pt-1.5">
                <span>Result:</span>
                <span className={traversalDenied ? "text-[#f87171] font-bold" : "text-[#8b949e]"}>
                  403 FORBIDDEN (DENIED)
                </span>
              </div>
            </div>
          </div>

          {/* Item 32: 5-minute pairing code ring countdown */}
          <div className="p-5 rounded border border-[#30363d] bg-[#161b22] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#8b949e]">TTL Countdown</span>
              <span className="text-[10px] font-mono text-[#8b949e]">5-Min Expiry</span>
            </div>

            <div className="h-24 flex items-center justify-center gap-4 bg-[#0e1117] rounded border border-[#30363d]">
              {/* Circular SVG Ring Countdown */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#21262d"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <span className="absolute font-mono text-[9px] text-[#f0f6fc]">
                  {Math.max(0, 100 - ringOffset)}%
                </span>
              </div>

              <div className="font-mono text-xs">
                <p className="text-[#f0f6fc] font-semibold">{code}</p>
                <p className="text-[#8b949e] text-[9px]">Auto-regenerates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Item 33: Visualize "What the server sees" as two distinct columns */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-[#f0f6fc]">
            What the signaling server sees
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
            {/* Column A: What is Seen */}
            <div className="p-4 rounded border border-[#30363d] bg-[#161b22] space-y-2.5">
              <span className="text-[#38bdf8] font-semibold block text-[11px] uppercase tracking-wider">
                Visible to Cloudflare Worker (Signaling)
              </span>
              <ul className="space-y-1.5 text-[#8b949e]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                  <span>Temporary 8-character room string</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                  <span>SDP offer / answer codec parameters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                  <span>Public IP address &amp; port routing candidates</span>
                </li>
              </ul>
            </div>

            {/* Column B: What is Never Seen */}
            <div className="p-4 rounded border border-[#30363d] bg-[#161b22] space-y-2.5">
              <span className="text-[#f0f6fc] font-semibold block text-[11px] uppercase tracking-wider">
                Never Seen by Any Server
              </span>
              <ul className="space-y-1.5 text-[#8b949e]">
                <li className="flex items-center gap-2">
                  <span className="text-[#f87171] font-bold select-none">✕</span>
                  <span>File contents, binary chunks, or streams</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#f87171] font-bold select-none">✕</span>
                  <span>File names, directory paths, or folder manifests</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#f87171] font-bold select-none">✕</span>
                  <span>Private Ed25519 identity keys</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#30363d] pt-6 flex items-center justify-between text-xs font-mono">
          <Link to="/security" className="text-[#38bdf8] hover:underline">
            View full security protocol specification →
          </Link>
          <span className="text-[#8b949e]">Single-use burn guarantee</span>
        </div>
      </div>
    </section>
  );
}
