import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LiveDeviceDiagram } from "../hero/LiveDeviceDiagram";
import { PairingCodeGridPattern } from "../brand/PairingCodeGridPattern";
import { TOKENS } from "../../tokens";

interface HeroSectionProps {
  onNavigate: (id: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [copied, setCopied] = useState(false);
  const [pairedPulse, setPairedPulse] = useState(true);
  const [code, setCode] = useState("K7M2Q9XD");

  const { duration, ease } = TOKENS.motion;

  useEffect(() => {
    // Pulse the connection once when two devices pair, then hold steady (Item 20)
    const t = setTimeout(() => {
      setPairedPulse(false);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  const handleCopyCode = () => {
    const formatted = `${code.slice(0, 4)}-${code.slice(4)}`;
    navigator.clipboard.writeText(formatted).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateCode = () => {
    const chars = TOKENS.brand.crockfordAlphabet;
    let next = "";
    for (let i = 0; i < 8; i++) {
      next += chars[Math.floor(Math.random() * chars.length)];
    }
    setCode(next);
  };

  return (
    <section className="relative pt-24 pb-20 border-b border-[#30363d] overflow-hidden">
      {/* Background Brand Pattern (Item 4) */}
      <PairingCodeGridPattern />

      <div className="relative mx-auto max-w-4xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Left Column: Asymmetric Editorial Copy (Items 16 & 17) */}
          <div className="md:col-span-7 space-y-6">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
              Device-as-NAS Mesh
            </div>

            {/* Headline revealed line by line with masked rise (Item 16) */}
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#f0f6fc] leading-[1.12]">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: duration.slow, ease: ease.decelerate }}
                >
                  Files between your devices,
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: duration.slow, delay: 0.1, ease: ease.decelerate }}
                >
                  without a server.
                </motion.span>
              </span>
            </h1>

            <p className="text-base text-[#8b949e] leading-relaxed max-w-xl">
              Nasend pools your phone, tablet, and PC into a direct peer-to-peer network for file transfers and local streaming.
            </p>

            {/* Signature Brand Element: Pairing code flipping into place sequentially (Items 5 & 17) */}
            <div className="pt-2 pb-1">
              <div
                className={`inline-flex flex-col gap-2 p-3.5 rounded border bg-[#161b22] transition-colors ${
                  pairedPulse ? "border-[#38bdf8]" : "border-[#30363d]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8] inline-block" />
                    <span>Pairing code</span>
                  </span>
                  <span>5-minute single-use</span>
                </div>

                {/* Character sequence flip (Item 17) */}
                <div className="flex items-center gap-1 font-mono text-2xl tracking-[0.2em] text-[#f0f6fc]">
                  {code.split("").map((char, index) => (
                    <div key={index} className="flex items-center">
                      {index === 4 && <span className="text-[#8b949e] px-1 select-none">-</span>}
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={`${index}-${char}`}
                          initial={{ opacity: 0, rotateX: -90, y: -4 }}
                          animate={{ opacity: 1, rotateX: 0, y: 0 }}
                          exit={{ opacity: 0, rotateX: 90, y: 4 }}
                          transition={{
                            duration: duration.fast,
                            delay: index * 0.04,
                            ease: ease.standard,
                          }}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <div className="pt-1 flex items-center justify-between gap-4 text-[10px] font-mono text-[#8b949e] border-t border-[#30363d]/50">
                  <button
                    onClick={regenerateCode}
                    className="hover:text-[#f0f6fc] transition cursor-pointer"
                  >
                    Generate new code
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    {copied ? "Copied" : "Copy code"}
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons with 2px translate active press (Items 40 & 41) */}
            <div className="pt-2 flex items-center gap-6">
              <button
                onClick={() => onNavigate("download")}
                className="px-4 py-2 rounded text-sm font-medium text-[#0e1117] bg-[#38bdf8] hover:bg-[#7dd3fc] active:translate-y-[2px] transition cursor-pointer"
              >
                Download
              </button>

              <button
                onClick={() => onNavigate("how-it-works")}
                className="text-sm text-[#8b949e] hover:text-[#f0f6fc] transition cursor-pointer relative group"
              >
                <span>How it works</span>
                {/* Left to right drawing underline on hover (Item 40) */}
                <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#f0f6fc] group-hover:w-full transition-all duration-200" />
              </button>
            </div>
          </div>

          {/* Right Column: Live Network Diagram (Item 19) */}
          <div className="md:col-span-5">
            <LiveDeviceDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
