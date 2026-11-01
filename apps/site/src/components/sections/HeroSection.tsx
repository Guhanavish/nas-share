import { useState } from "react";
import { motion } from "motion/react";
import { Send, Download, ShieldCheck } from "lucide-react";
import { LiveDeviceDiagram } from "../hero/LiveDeviceDiagram";
import { PairingCodeGridPattern } from "../brand/PairingCodeGridPattern";
import { TOKENS } from "../../tokens";

interface HeroSectionProps {
  onSelectSend?: () => void;
  onSelectReceive?: () => void;
}

export function HeroSection({ onSelectSend, onSelectReceive }: HeroSectionProps) {
  const [copied, setCopied] = useState(false);
  const code = "K7M2-Q9XD";
  const { duration, ease } = TOKENS.motion;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTransfer = () => {
    const el = document.getElementById("transfer");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-[#343934] overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <PairingCodeGridPattern />

      <div className="relative mx-auto max-w-5xl px-6 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Space Grotesk Typography */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[11px] font-mono text-[#929690] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A3B899]" />
              <span>Direct Device-to-Device Transfer</span>
            </div>

            {/* Oversized Headline in Space Grotesk */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[#F2F3F0] leading-[1.08]">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: duration.reveal, ease: ease.decelerate }}
                >
                  Your files.
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-[#A3B899]"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: duration.reveal, delay: 0.1, ease: ease.decelerate }}
                >
                  A direct connection.
                </motion.span>
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#929690] leading-relaxed max-w-xl font-sans">
              Move files between your devices through a simple, seamless transfer experience.
              Streams peer-to-peer over local LAN or encrypted WebRTC without cloud intermediaries.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onSelectSend) onSelectSend();
                  scrollToTransfer();
                }}
                className="px-5 py-3 rounded-xl bg-[#A3B899] text-[#0C0D0C] font-mono font-medium text-xs hover:bg-[#B5C8AC] active:translate-y-[1px] transition shadow-md cursor-pointer flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Files</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSelectReceive) onSelectReceive();
                  scrollToTransfer();
                }}
                className="px-5 py-3 rounded-xl bg-[#1B1D1B] text-[#F2F3F0] border border-[#343934] font-mono font-medium text-xs hover:bg-[#252825] hover:border-[#414741] active:translate-y-[1px] transition cursor-pointer flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#A3B899]" />
                <span>Receive Files</span>
              </button>

              {/* Single-use Code Anchor */}
              <div
                onClick={handleCopyCode}
                className="px-3.5 py-2.5 rounded-xl bg-[#1B1D1B] border border-[#343934] text-xs font-mono text-[#929690] flex items-center gap-2 cursor-pointer hover:border-[#414741] transition select-none"
                title="Click to copy pairing code"
              >
                <span>Room:</span>
                <span className="text-[#A3B899] font-semibold tracking-wider">{code}</span>
                <span className="text-[10px] text-[#929690]">{copied ? "Copied" : "5m"}</span>
              </div>
            </div>

            {/* Trust pill */}
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#929690]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A3B899]" />
                <span>DTLS 1.3 Pinning</span>
              </span>
              <span>•</span>
              <span>Port 8743</span>
              <span>•</span>
              <span>Zero cloud storage</span>
            </div>
          </div>

          {/* Right Column: Abstract Device Connection Schematic */}
          <div className="lg:col-span-5">
            <LiveDeviceDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
