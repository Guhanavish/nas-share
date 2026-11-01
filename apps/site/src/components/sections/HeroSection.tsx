import { useState, useRef } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Send, Download, ShieldCheck, FileText } from "lucide-react";
import { LiveDeviceDiagram } from "../hero/LiveDeviceDiagram";
import { PairingCodeGridPattern } from "../brand/PairingCodeGridPattern";
import { FlippingPairingCode } from "../hero/FlippingPairingCode";
import { Rule } from "../motion/Rule";
import { TOKENS } from "../../tokens";
import { getLenis } from "../../lib/lenis";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { hasIntroPlayed } from "../../lib/intro";

interface HeroSectionProps {
  onSelectSend?: () => void;
  onSelectReceive?: () => void;
}

export function HeroSection({ onSelectSend, onSelectReceive }: HeroSectionProps) {
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [flyingFile, setFlyingFile] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const receiveBtnRef = useRef<HTMLButtonElement>(null);

  const reduced = usePrefersReducedMotion();
  const introPlayed = hasIntroPlayed();
  const { ease } = TOKENS.motion;

  // Item 10: Scroll cue fading out when scrollY > 40
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 40 && showScrollCue) {
      setShowScrollCue(false);
    }
  });

  const scrollToTransfer = () => {
    const el = document.getElementById("transfer");
    if (el) {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(el, { offset: -72 });
      } else {
        el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
    }
  };

  // Item 8: Animate flying file from button to diagram node
  const handleSendClick = () => {
    onSelectSend?.();
    if (reduced) {
      scrollToTransfer();
      return;
    }

    const phoneNode = document.querySelector('[aria-label="Phone Android Device Node"]');
    const sendBtn = sendBtnRef.current;

    if (phoneNode && sendBtn) {
      const btnRect = sendBtn.getBoundingClientRect();
      const nodeRect = phoneNode.getBoundingClientRect();

      // Check if node is in viewport
      if (nodeRect.top >= 0 && nodeRect.bottom <= window.innerHeight) {
        setFlyingFile({
          startX: btnRect.left + btnRect.width / 2,
          startY: btnRect.top + btnRect.height / 2,
          endX: nodeRect.left + nodeRect.width / 2,
          endY: nodeRect.top + nodeRect.height / 2,
        });

        setTimeout(() => {
          setFlyingFile(null);
          scrollToTransfer();
        }, 450);
        return;
      }
    }

    scrollToTransfer();
  };

  const handleReceiveClick = () => {
    onSelectReceive?.();
    if (reduced) {
      scrollToTransfer();
      return;
    }

    const pcNode = document.querySelector('[aria-label="PC Windows Device Node"]');
    const recvBtn = receiveBtnRef.current;

    if (pcNode && recvBtn) {
      const btnRect = recvBtn.getBoundingClientRect();
      const nodeRect = pcNode.getBoundingClientRect();

      if (nodeRect.top >= 0 && nodeRect.bottom <= window.innerHeight) {
        setFlyingFile({
          startX: nodeRect.left + nodeRect.width / 2,
          startY: nodeRect.top + nodeRect.height / 2,
          endX: btnRect.left + btnRect.width / 2,
          endY: btnRect.top + btnRect.height / 2,
        });

        setTimeout(() => {
          setFlyingFile(null);
          scrollToTransfer();
        }, 450);
        return;
      }
    }

    scrollToTransfer();
  };

  // Item 2: Headline words split with mask
  const line1Words = ["Your", "files."];
  const line2Words = ["A", "direct", "connection."];

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden"
    >
      {/* Background Architectural Grid Pattern (Item 9) */}
      <PairingCodeGridPattern />

      {/* Item 8: Flying File Portal */}
      {flyingFile && (
        <motion.div
          initial={{
            left: flyingFile.startX,
            top: flyingFile.startY,
            scale: 0.6,
            opacity: 1,
          }}
          animate={{
            left: flyingFile.endX,
            top: flyingFile.endY,
            scale: 0.4,
            opacity: 0,
          }}
          transition={{ duration: 0.45, ease: ease.standard }}
          className="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#252825] border border-[#A3B899] text-[#A3B899]"
        >
          <FileText className="w-5 h-5" />
        </motion.div>
      )}

      <div className="relative mx-auto max-w-5xl px-6 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Space Grotesk Typography */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Eyebrow (kept only on hero per section 4.3) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[11px] font-mono text-[#929690] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A3B899]" />
              <span>Direct Device-to-Device Transfer</span>
            </div>

            {/* Item 2: Oversized Headline with word-mask reveal and 2px sage underline */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[#F2F3F0] leading-[1.08]">
              {/* Line 1: "Your files." */}
              <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                {line1Words.map((word, i) => (
                  <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
                    <motion.span
                      className="inline-block"
                      initial={reduced || introPlayed ? false : { y: "110%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 0.55,
                        delay: 0.5 + i * 0.06,
                        ease: ease.decelerate,
                      }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </span>

              {/* Line 2: "A direct connection." with drawing underline */}
              <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em] text-[#A3B899]">
                {line2Words.map((word, i) => {
                  const isDirectConn = word === "direct" || word === "connection.";
                  return (
                    <span
                      key={i}
                      className={`inline-block overflow-hidden mr-[0.25em] ${
                        isDirectConn ? "relative" : ""
                      }`}
                    >
                      <motion.span
                        className="inline-block"
                        initial={reduced || introPlayed ? false : { y: "110%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.55,
                          delay: 0.5 + (line1Words.length + i) * 0.06,
                          ease: ease.decelerate,
                        }}
                      >
                        {word}
                      </motion.span>
                    </span>
                  );
                })}

                {/* 2px Sage Underline drawing under "direct connection." */}
                <span className="relative block h-[2px] w-full max-w-sm mt-1 overflow-visible">
                  <svg
                    className="absolute left-0 top-0 w-full h-[2px] overflow-visible"
                    fill="none"
                  >
                    <motion.line
                      x1="0"
                      y1="1"
                      x2="280"
                      y2="1"
                      stroke="#A3B899"
                      strokeWidth="2"
                      initial={reduced || introPlayed ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.5 + (line1Words.length + line2Words.length) * 0.06 + 0.15,
                        ease: ease.standard,
                      }}
                    />
                  </svg>
                </span>
              </span>
            </h1>

            {/* Supporting Copy (honest plain words per section 4.4) */}
            <p className="text-base sm:text-lg text-[#929690] leading-relaxed max-w-xl font-sans">
              Move files directly between your devices without intermediate storage.
              Streams peer-to-peer over local LAN or encrypted WebRTC without central cloud storage.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                ref={sendBtnRef}
                type="button"
                onClick={handleSendClick}
                className="px-5 py-3 rounded-xl bg-[#A3B899] text-[#0C0D0C] font-mono font-medium text-xs hover:bg-[#B5C8AC] active:translate-y-[1px] transition cursor-pointer flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Files</span>
              </button>

              <button
                ref={receiveBtnRef}
                type="button"
                onClick={handleReceiveClick}
                className="px-5 py-3 rounded-xl bg-[#1B1D1B] text-[#F2F3F0] border border-[#343934] font-mono font-medium text-xs hover:bg-[#252825] hover:border-[#414741] active:translate-y-[1px] transition cursor-pointer flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#A3B899]" />
                <span>Receive Files</span>
              </button>

              {/* Item 3: Flipping Pairing Code Chip with 5m expiry ring */}
              <FlippingPairingCode />
            </div>

            {/* Trust pill */}
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#929690]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A3B899]" />
                <span>DTLS &amp; Ed25519 Pinning</span>
              </span>
              <span>•</span>
              <span>Port 8743</span>
              <span>•</span>
              <span>Zero server storage</span>
            </div>
          </div>

          {/* Right Column: Abstract Device Connection Schematic */}
          <div className="lg:col-span-5">
            <LiveDeviceDiagram />
          </div>
        </div>

        {/* Item 10: Scroll Cue (Bottom-left, 1px x 32px line with 5px sage dot travelling down) */}
        {showScrollCue && (
          <div className="hidden sm:flex items-center gap-3 pt-6 text-[10px] font-mono text-[#929690] select-none">
            <div className="relative w-[1px] h-8 bg-[#343934] overflow-hidden">
              {!reduced && (
                <motion.div
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: [0, 24, 32], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-[#A3B899] -left-[2px] absolute"
                />
              )}
            </div>
            <span>Scroll to explore</span>
          </div>
        )}
      </div>
      <Rule />
    </section>
  );
}
