import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Folder,
  File,
  Send,
  Check,
  Smartphone,
  Monitor,
  Zap,
  Layers,
  ArrowUpDown,
  Lock,
  Globe,
  RotateCcw,
} from "lucide-react";
import { SectionHeader } from "../motion/SectionHeader";
import { Rule } from "../motion/Rule";
import { TOKENS } from "../../tokens";
import { useActive } from "../../lib/useActive";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

export function ProductShowcaseSection() {
  const [activeView, setActiveView] = useState<"pc" | "phone">("pc");
  const [isFileSent, setIsFileSent] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isActive = useActive(sectionRef);
  const reduced = usePrefersReducedMotion();

  const { ease } = TOKENS.motion;

  // Trigger sample transfer once on view
  const hasTriggeredRef = useRef(false);
  useEffect(() => {
    if (isActive && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const t = setTimeout(() => setIsFileSent(true), 800);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  const handleReplaySample = () => {
    setIsFileSent(false);
    setTimeout(() => setIsFileSent(true), 400);
  };

  const featureCards = [
    {
      title: "Direct Device Communication",
      desc: "Connects devices over local TCP sockets (port 8743) or direct WebRTC DataChannels.",
      icon: Zap,
    },
    {
      title: "Simple File Selection",
      desc: "Drag-and-drop individual files or entire folders with automatic chunk segmentation.",
      icon: Layers,
    },
    {
      title: "Cross-Device Transfers",
      desc: "Move files directly between Windows, Android, Android TV, and modern web browsers.",
      icon: ArrowUpDown,
    },
    {
      title: "Clear Transfer Progress",
      desc: "Real-time byte counters, chunk indexes, throughput metrics, and estimated time remaining.",
      icon: Send,
    },
    {
      title: "Privacy-Focused Architecture",
      desc: "Worker handles ephemeral signaling only; file payload bytes never touch central servers.",
      icon: Lock,
    },
    {
      title: "Browser-Based Accessibility",
      desc: "Instant file sending and receiving directly in the browser with zero mandatory software installs.",
      icon: Globe,
    },
  ];

  return (
    <section id="product" ref={sectionRef} className="relative py-24 bg-[#0C0D0C] overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 space-y-16">
        {/* Item 19: Unified SectionHeader */}
        <SectionHeader
          eyebrow="Interface & Capabilities"
          title="Engineered for direct utility"
          description="Clean directory browsing on desktop and mobile with instant peer-to-peer delivery."
        />

        {/* View Switcher: PC vs Phone with Item 30 sliding tab pill */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#343934] pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView("pc")}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                  activeView === "pc" ? "text-[#F2F3F0] font-medium" : "text-[#929690] hover:text-[#F2F3F0]"
                }`}
              >
                {activeView === "pc" && (
                  <motion.div
                    layoutId="showcase-tab"
                    className="absolute inset-0 bg-[#252825] border border-[#414741] rounded-lg -z-0"
                    transition={TOKENS.motion.ease.spring}
                  />
                )}
                <Monitor className="w-3.5 h-3.5 text-[#A3B899] relative z-10" />
                <span className="relative z-10">Windows Desktop Host</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView("phone")}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                  activeView === "phone" ? "text-[#F2F3F0] font-medium" : "text-[#929690] hover:text-[#F2F3F0]"
                }`}
              >
                {activeView === "phone" && (
                  <motion.div
                    layoutId="showcase-tab"
                    className="absolute inset-0 bg-[#252825] border border-[#414741] rounded-lg -z-0"
                    transition={TOKENS.motion.ease.spring}
                  />
                )}
                <Smartphone className="w-3.5 h-3.5 text-[#A3B899] relative z-10" />
                <span className="relative z-10">Android Edge Client</span>
              </button>
            </div>

            {/* Item 31: Replay Button */}
            <button
              type="button"
              onClick={handleReplaySample}
              className="flex items-center gap-1.5 text-xs font-mono text-[#929690] hover:text-[#F2F3F0] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#A3B899]" />
              <span>Replay sample file move</span>
            </button>
          </div>

          {/* Window Frame with App View & Cross-fade */}
          <div className="window-frame">
            <div className="window-header">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#343934]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#343934]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#343934]" />
                <span className="ml-2 font-mono text-xs text-[#F2F3F0]">
                  {activeView === "pc" ? "nasend-desktop://shared_library" : "nasend-android://remote_browse"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#929690]">Port 8743</span>
            </div>

            <div className="p-6 bg-[#0C0D0C] min-h-[320px]">
              {/* Item 30: popLayout AnimatePresence */}
              <AnimatePresence mode="popLayout">
                {activeView === "pc" ? (
                  <motion.div
                    key="pc-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: ease.standard }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-[#929690] border-b border-[#343934] pb-2">
                      <span>File / Directory</span>
                      <span>Action / Size</span>
                    </div>

                    <div className="space-y-2">
                      {/* Item 31: Sample file that slides between panes */}
                      {!isFileSent ? (
                        <motion.div
                          layoutId={reduced ? undefined : "sampleTransferredFile"}
                          transition={{ duration: 0.5, ease: ease.standard }}
                          className="flex items-center justify-between p-3 rounded-lg border border-[#A3B899]/60 bg-[#1B1D1B]"
                        >
                          <div className="flex items-center gap-3">
                            <File className="w-4 h-4 text-[#A3B899]" />
                            <div>
                              <p className="text-xs font-mono text-[#F2F3F0]">
                                Sample_Archive_2026.zip{" "}
                                <span className="text-[10px] text-[#A3B899] bg-[#A3B899]/10 px-1.5 py-0.5 rounded">
                                  Sample file
                                </span>
                              </p>
                              <span className="text-[10px] font-mono text-[#929690]">420 MB • Ready to send</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsFileSent(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#A3B899] text-[#0C0D0C] font-mono text-[11px] font-medium cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send</span>
                          </button>
                        </motion.div>
                      ) : (
                        <div className="p-2.5 rounded-lg border border-[#343934]/60 bg-[#1B1D1B]/40 text-xs font-mono text-[#929690] flex items-center justify-between">
                          <span>Sample_Archive_2026.zip</span>
                          <span className="text-[#A3B899]">Sent to Android Edge Client</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#343934] bg-[#1B1D1B]">
                        <div className="flex items-center gap-3">
                          <Folder className="w-4 h-4 text-[#929690]" />
                          <div>
                            <p className="text-xs font-mono text-[#F2F3F0]">DCIM_Photos</p>
                            <span className="text-[10px] font-mono text-[#929690]">4.2 GB • 128 items</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#929690]">Shared</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#343934] bg-[#1B1D1B]">
                        <div className="flex items-center gap-3">
                          <File className="w-4 h-4 text-[#929690]" />
                          <div>
                            <p className="text-xs font-mono text-[#F2F3F0]">Concert_4K_Remux.mkv</p>
                            <span className="text-[10px] font-mono text-[#929690]">14.8 GB • Stream ready</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#929690]">Shared</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="phone-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: ease.standard }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-[#929690] border-b border-[#343934] pb-2">
                      <span>Remote Inbound Stream</span>
                      <span>Status</span>
                    </div>

                    <div className="space-y-2">
                      {/* Item 31: Received Sample File row */}
                      {isFileSent && (
                        <motion.div
                          layoutId={reduced ? undefined : "sampleTransferredFile"}
                          transition={{ duration: 0.5, ease: ease.standard }}
                          className="flex items-center justify-between p-3 rounded-lg border border-[#A3B899] bg-[#252825]"
                        >
                          <div className="flex items-center gap-3">
                            <File className="w-4 h-4 text-[#A3B899]" />
                            <div>
                              <p className="text-xs font-mono text-[#F2F3F0]">
                                Sample_Archive_2026.zip{" "}
                                <span className="text-[10px] text-[#A3B899] bg-[#A3B899]/10 px-1.5 py-0.5 rounded">
                                  Received
                                </span>
                              </p>
                              <span className="text-[10px] font-mono text-[#929690]">420 MB • Delivered directly</span>
                            </div>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-mono text-[#A3B899]">
                            <Check className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        </motion.div>
                      )}

                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#343934] bg-[#1B1D1B]">
                        <div className="flex items-center gap-3">
                          <File className="w-4 h-4 text-[#929690]" />
                          <div>
                            <p className="text-xs font-mono text-[#F2F3F0]">DCIM_2026_11_01.mp4</p>
                            <span className="text-[10px] font-mono text-[#929690]">840 MB</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#929690]">Synced</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#343934] bg-[#1B1D1B]">
                        <div className="flex items-center gap-3">
                          <Folder className="w-4 h-4 text-[#929690]" />
                          <div>
                            <p className="text-xs font-mono text-[#F2F3F0]">Voice_Memos</p>
                            <span className="text-[10px] font-mono text-[#929690]">48 MB</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#929690]">Synced</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 6 Compact Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-3"
              >
                <div className="w-8 h-8 rounded-lg border border-[#343934] bg-[#252825] flex items-center justify-center text-[#A3B899]">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-display text-base font-semibold text-[#F2F3F0] tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#929690] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <Rule />
    </section>
  );
}
