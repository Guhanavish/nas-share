import { useState } from "react";
import { motion } from "motion/react";
import { FolderUp, Link2, Zap, ArrowRight, Check } from "lucide-react";
import { TOKENS } from "../../tokens";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const { duration, ease } = TOKENS.motion;

  const steps = [
    {
      num: "01",
      title: "Select files",
      desc: "Drag and drop documents, 4K video, or entire directories. Files are prepared in memory and chunked using standard HTTP/1.1 Range boundaries.",
      icon: FolderUp,
      badge: "64 KB Chunks",
    },
    {
      num: "02",
      title: "Connect devices",
      desc: "Pair with an 8-character Crockford Base32 room code. Devices discover each other via local mDNS or establish an encrypted WebRTC DataChannel.",
      icon: Link2,
      badge: "DTLS 1.3 Handshake",
    },
    {
      num: "03",
      title: "Transfer files",
      desc: "Data moves directly peer-to-peer at Gigabit line-rate throughput. Bytes never hit an intermediate server or centralized cloud database.",
      icon: Zap,
      badge: "112.4 MB/s Line-Rate",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-b border-[#343934]">
      <div className="mx-auto max-w-5xl px-6 space-y-16">
        <div className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[11px] font-mono text-[#929690] uppercase tracking-wider">
            <span>Transfer Architecture</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F3F0]">
            How direct transfer works
          </h2>
          <p className="text-sm sm:text-base text-[#929690] leading-relaxed max-w-xl font-sans">
            A three-step authenticated workflow that connects any two devices directly without third-party storage.
          </p>
        </div>

        {/* 3 Connected Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: duration.reveal, delay: idx * 0.1, ease: ease.standard }}
                onClick={() => setActiveStep(idx)}
                className={`relative p-6 sm:p-7 rounded-xl border transition-all cursor-pointer select-none space-y-5 ${
                  isActive
                    ? "border-[#A3B899] bg-[#1B1D1B] shadow-[0_0_20px_rgba(163,184,153,0.08)]"
                    : "border-[#343934] bg-[#1B1D1B] hover:border-[#414741] hover:bg-[#252825]"
                }`}
              >
                {/* Step Header with Num & Icon */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#A3B899] bg-[#252825] px-2 py-0.5 rounded border border-[#343934]">
                    Step {step.num}
                  </span>
                  <div
                    className={`p-2.5 rounded-lg border transition-colors ${
                      isActive
                        ? "border-[#A3B899] bg-[#252825] text-[#A3B899]"
                        : "border-[#343934] bg-[#0C0D0C] text-[#929690]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-lg font-semibold text-[#F2F3F0] tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#929690] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#343934]/60 flex items-center justify-between text-[11px] font-mono text-[#929690]">
                  <span>{step.badge}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-[#A3B899]" />}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Step Verification Box */}
        <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg border border-[#343934] bg-[#252825] flex items-center justify-center text-[#A3B899]">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-medium text-sm text-[#F2F3F0]">
                {activeStep === 0
                  ? "Staging binary payload chunks"
                  : activeStep === 1
                  ? "Resolving ICE candidates & signaling socket"
                  : "Streaming directly at 112.4 MB/s (0.2ms latency)"}
              </p>
              <p className="font-mono text-[11px] text-[#929690]">
                Port 8743 • RFC 7233 Byte Ranges • Ephemeral Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A3B899] animate-pulse" />
            <span className="font-mono text-xs text-[#A3B899]">
              Verified Zero Server Storage
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
