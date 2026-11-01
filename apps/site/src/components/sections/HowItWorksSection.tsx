import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FolderUp, Link2, Zap, ArrowRight, Check } from "lucide-react";
import { SectionHeader } from "../motion/SectionHeader";
import { Rule } from "../motion/Rule";
import { CountUpNumber } from "../glass/CountUpNumber";
import { TOKENS } from "../../tokens";
import { getLenis } from "../../lib/lenis";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedContentRef = useRef<HTMLDivElement>(null);

  const reduced = usePrefersReducedMotion();
  const { ease } = TOKENS.motion;

  // Item 16: Lazy load GSAP & ScrollTrigger with Lenis sync and pinning
  useEffect(() => {
    if (reduced) return;

    let cleanup = () => {};

    const setupPin = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      const lenis = getLenis();
      const off = lenis?.on("scroll", ScrollTrigger.update);

      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)",
        () => {
          if (!sectionRef.current) return;

          const st = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top top",
            end: "+=180%",
            pin: pinnedContentRef.current,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setScrollProgress(self.progress);
              const i = Math.min(2, Math.floor(self.progress * 3));
              setActiveStep((prev) => (prev === i ? prev : i));
            },
          });

          // Refresh after fonts ready
          document.fonts.ready.then(() => {
            ScrollTrigger.refresh();
          });

          return () => st.kill();
        }
      );

      cleanup = () => {
        off?.();
        mm.revert();
      };
    };

    setupPin();

    return () => cleanup();
  }, [reduced]);

  const steps = [
    {
      num: "01",
      title: "Select files",
      desc: "Drag and drop documents, 4K video, or entire directories. Files are prepared in memory and chunked in 16–64 KB segments.",
      icon: FolderUp,
      badge: "16–64 KB Chunks",
    },
    {
      num: "02",
      title: "Connect devices",
      desc: "Pair with an 8-character Crockford Base32 room code. Devices discover each other via local mDNS or establish an encrypted WebRTC DataChannel.",
      icon: Link2,
      badge: "DTLS Handshake",
    },
    {
      num: "03",
      title: "Transfer files",
      desc: "Data moves directly peer-to-peer over local network or encrypted WebRTC. Bytes never hit an intermediate server or centralized cloud database.",
      icon: Zap,
      badge: "Direct Peer Stream",
    },
  ];

  const handleStepClick = (idx: number) => {
    setActiveStep(idx);
    setScrollProgress((idx + 0.5) / 3);
  };

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative bg-[#0C0D0C] overflow-hidden"
    >
      <div
        ref={pinnedContentRef}
        className="mx-auto max-w-5xl px-6 py-24 min-h-[100svh] flex flex-col justify-center space-y-16"
      >
        {/* Item 19: Unified SectionHeader */}
        <SectionHeader
          eyebrow="Transfer Architecture"
          title="How direct transfer works"
          description="A three-step authenticated workflow that connects any two devices directly without third-party storage."
        />

        {/* 3 Connected Steps Grid with Item 17 connector line */}
        <div className="relative">
          {/* Connector Line behind cards (Item 17) */}
          <div className="hidden md:block absolute top-1/2 left-10 right-10 -translate-y-1/2 h-[1px] bg-[#343934] z-0">
            <motion.div
              className="h-full bg-[#A3B899] origin-left"
              style={{
                scaleX: scrollProgress > 0 ? scrollProgress : (activeStep + 0.5) / 3,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;

              return (
                <div
                  key={step.num}
                  onClick={() => handleStepClick(idx)}
                  className={`relative p-6 sm:p-7 rounded-xl border transition-all cursor-pointer select-none space-y-5 ${
                    isActive
                      ? "border-[#A3B899] bg-[#1B1D1B]"
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Item 18: Live Step Verification Box with AnimatePresence & CountUpNumber */}
        <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg border border-[#343934] bg-[#252825] flex items-center justify-center text-[#A3B899] shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: ease.standard }}
                className="space-y-0.5"
              >
                <div className="font-display font-medium text-sm text-[#F2F3F0]">
                  {activeStep === 0 && (
                    <span>Staging binary payload into 64 KB memory chunks</span>
                  )}
                  {activeStep === 1 && (
                    <span>Resolving local mDNS discovery &amp; WebRTC signaling</span>
                  )}
                  {activeStep === 2 && (
                    <span className="flex items-center gap-2">
                      <span>Chunks sent:</span>
                      <CountUpNumber
                        end={1024}
                        duration={1200}
                        suffix=" chunks (simulated)"
                        className="text-[#A3B899] font-bold"
                      />
                    </span>
                  )}
                </div>

                <p className="font-mono text-[11px] text-[#929690]">
                  {activeStep === 0 && "HTTP :8743 • In-memory sliding buffer"}
                  {activeStep === 1 && "Ed25519 identity exchange • DTLS channel"}
                  {activeStep === 2 && "Direct P2P DataChannel • Zero central storage"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#A3B899] motion-safe:animate-pulse" />
            <span className="font-mono text-xs text-[#A3B899]">
              Files are never stored on a server
            </span>
          </div>
        </div>
      </div>
      <Rule />
    </section>
  );
}
