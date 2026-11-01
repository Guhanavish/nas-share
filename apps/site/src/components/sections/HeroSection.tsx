import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onNavigate: (id: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [packetCompleted, setPacketCompleted] = useState(false);

  useEffect(() => {
    // Play one short animation of a file moving between two devices, then stop. No looping (Step 4).
    const timer = setTimeout(() => {
      setPacketCompleted(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="pt-20 pb-16 border-b border-[#30363d]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Left Column: Asymmetric Headline, Subline, Static Code, Actions (Step 3 & 4) */}
          <div className="md:col-span-7 space-y-6">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
              Device-as-NAS Mesh
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#f0f6fc] leading-[1.12]">
              Files between your devices, without a server.
            </h1>

            <p className="text-base text-[#8b949e] leading-relaxed max-w-xl">
              Nasend pools your phone, tablet, and PC into a direct peer-to-peer network for file transfers and local streaming.
            </p>

            {/* Static visual anchor: 8-character Crockford pairing code with wide spacing (Step 2 & 4) */}
            <div className="pt-2 pb-1">
              <div className="inline-flex flex-col gap-1.5 p-3 rounded border border-[#30363d] bg-[#161b22]">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                  <span>Pairing code</span>
                  <span>5-minute expiry</span>
                </div>
                <div className="font-mono text-2xl tracking-[0.25em] text-[#f0f6fc] font-normal select-all">
                  K7M2-Q9XD
                </div>
                <div className="text-[10px] font-mono text-[#8b949e]">
                  Crockford Base32 • Single-use
                </div>
              </div>
            </div>

            {/* Actions: Primary Download button, Secondary How it works text link (Step 4) */}
            <div className="pt-2 flex items-center gap-6">
              <button
                onClick={() => onNavigate("download")}
                className="px-4 py-2 rounded text-sm font-medium text-[#0e1117] bg-[#38bdf8] hover:bg-[#7dd3fc] transition cursor-pointer"
              >
                Download
              </button>

              <button
                onClick={() => onNavigate("how-it-works")}
                className="text-sm text-[#8b949e] hover:text-[#f0f6fc] underline underline-offset-4 transition cursor-pointer"
              >
                How it works →
              </button>
            </div>
          </div>

          {/* Right Column: Single-color line schematic with zero fills (Step 4) */}
          <div className="md:col-span-5">
            <div className="window-frame">
              <div className="window-header">
                <span>topology_schematic.lan</span>
                <span>port 8743</span>
              </div>
              <div className="p-6">
                <svg
                  viewBox="0 0 320 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto text-[#8b949e]"
                >
                  {/* Phone Node Schematic (Left) */}
                  <rect x="20" y="30" width="80" height="130" rx="4" stroke="currentColor" strokeWidth="1" />
                  <line x1="30" y1="45" x2="90" y2="45" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="60" cy="145" r="4" stroke="currentColor" strokeWidth="1" />
                  <text x="60" y="85" textAnchor="middle" fill="#f0f6fc" fontFamily="ui-monospace, monospace" fontSize="11">
                    Phone
                  </text>
                  <text x="60" y="102" textAnchor="middle" fill="#8b949e" fontFamily="ui-monospace, monospace" fontSize="9">
                    10.0.0.4:8743
                  </text>

                  {/* PC Node Schematic (Right) */}
                  <rect x="220" y="40" width="85" height="110" rx="3" stroke="currentColor" strokeWidth="1" />
                  <line x1="220" y1="125" x2="305" y2="125" stroke="currentColor" strokeWidth="1" />
                  <path d="M 245 150 L 280 150 L 290 170 L 235 170 Z" stroke="currentColor" strokeWidth="1" />
                  <text x="262" y="85" textAnchor="middle" fill="#f0f6fc" fontFamily="ui-monospace, monospace" fontSize="11">
                    Workstation
                  </text>
                  <text x="262" y="102" textAnchor="middle" fill="#8b949e" fontFamily="ui-monospace, monospace" fontSize="9">
                    10.0.0.2:8743
                  </text>

                  {/* Connecting 1px Hairline Path */}
                  <line x1="100" y1="95" x2="220" y2="95" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />

                  {/* One short animation of a file moving between two devices, then stops (Step 4) */}
                  {!packetCompleted ? (
                    <motion.circle
                      cx="100"
                      cy="95"
                      r="3.5"
                      fill="#38bdf8"
                      initial={{ cx: 100 }}
                      animate={{ cx: 220 }}
                      transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  ) : (
                    <circle cx="220" cy="95" r="3.5" fill="none" stroke="#38bdf8" strokeWidth="1" />
                  )}

                  {/* Transfer Spec Label */}
                  <text x="160" y="82" textAnchor="middle" fill="#38bdf8" fontFamily="ui-monospace, monospace" fontSize="9">
                    HTTP Range 64KB
                  </text>
                  <text x="160" y="120" textAnchor="middle" fill="#8b949e" fontFamily="ui-monospace, monospace" fontSize="9">
                    Direct TCP socket
                  </text>
                </svg>

                <div className="mt-3 pt-3 border-t border-[#30363d] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                  <span>Transport: Direct LAN</span>
                  <span className="text-[#38bdf8]">No server in path</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
