import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Key, HardDrive, ShieldCheck, ArrowRightLeft } from "lucide-react";
import { TOKENS } from "../../tokens";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const { duration, ease } = TOKENS.motion;

  const steps = [
    {
      id: "share",
      num: "01",
      title: "Share a folder or roll",
      desc: "Select any directory on PC or enable camera roll mirroring on mobile. Nasend starts an embedded HTTP/1.1 file server on port 8743.",
      icon: HardDrive,
    },
    {
      id: "code",
      num: "02",
      title: "Enter 8-character code",
      desc: "One device generates an 8-character Crockford Base32 code with a 5-minute expiry. The second device enters it or scans the camera QR code.",
      icon: ArrowRightLeft,
    },
    {
      id: "handshake",
      num: "03",
      title: "Pin cryptographic keys",
      desc: "Devices verify the SHA-256 commit of the code and exchange Ed25519 public keys. Keys are pinned to local storage; the code is burned immediately.",
      icon: Key,
    },
    {
      id: "transfer",
      num: "04",
      title: "Direct chunked transfer",
      desc: "Files stream directly over local TCP sockets (or DTLS 1.3 WebRTC DataChannels) in 16–64 KB chunks using HTTP/1.1 Range requests with instant pause and resume.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-b border-[#30363d]">
      <div className="mx-auto max-w-4xl px-6 space-y-12">
        <div className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
            Protocol Mechanics
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc]">
            How it works
          </h2>
          <p className="text-sm text-[#8b949e] leading-relaxed max-w-xl">
            A four-step handshake creates an authenticated peer-to-peer link between two devices.
          </p>
        </div>

        {/* 4 Pinned / Interactive Steps with Updating Schematic (Items 24-27) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: 4 Step Buttons with Drawing Connector Line (Items 24 & 25) */}
          <div className="md:col-span-6 relative pl-6 space-y-6">
            {/* Background vertical line */}
            <div className="absolute left-2 top-3 bottom-3 w-[1px] bg-[#30363d]" />

            {steps.map((st, i) => {
              const isActive = activeStep === i;
              return (
                <div
                  key={st.id}
                  onClick={() => setActiveStep(i)}
                  className={`relative p-3.5 rounded border transition cursor-pointer ${
                    isActive
                      ? "border-[#38bdf8] bg-[#161b22]"
                      : "border-[#30363d] bg-[#0e1117] hover:border-[#8b949e]/40"
                  }`}
                >
                  {/* Indicator Dot on vertical line */}
                  <div
                    className={`absolute -left-6 top-5 w-2.5 h-2.5 -translate-x-1/2 rounded-full border transition-colors ${
                      isActive
                        ? "bg-[#38bdf8] border-[#38bdf8]"
                        : "bg-[#0e1117] border-[#30363d]"
                    }`}
                  />

                  <div className="flex items-center justify-between text-xs font-mono text-[#8b949e] mb-1">
                    <span>Step {st.num}</span>
                    {isActive && <span className="text-[#38bdf8]">Active</span>}
                  </div>

                  <h3 className="text-sm font-medium text-[#f0f6fc]">
                    {st.title}
                  </h3>

                  <p className="text-xs text-[#8b949e] mt-1 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Step-Driven Schematic Visualizer (Items 24, 26, 27) */}
          <div className="md:col-span-6 sticky top-20">
            <div className="window-frame">
              <div className="window-header">
                <span>sequence_visualizer</span>
                <span className="text-[#38bdf8]">{steps[activeStep].title}</span>
              </div>

              <div className="p-6 bg-[#0e1117] min-h-[260px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {/* Step 1: Share */}
                  {activeStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: duration.normal, ease: ease.standard }}
                      className="space-y-4 text-xs font-mono"
                    >
                      <div className="p-3 rounded border border-[#30363d] bg-[#161b22] space-y-1">
                        <span className="text-[#8b949e] text-[10px] uppercase">Service Started</span>
                        <p className="text-[#f0f6fc]">Bound to 0.0.0.0:8743</p>
                        <p className="text-[#38bdf8] text-[11px]">mDNS: _nasend._tcp.local broadcast</p>
                      </div>
                      <p className="text-[#8b949e]">
                        PC shared folder ready: 142 items indexed in local SQLite manifest.
                      </p>
                    </motion.div>
                  )}

                  {/* Step 2: Code Entry */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: duration.normal, ease: ease.standard }}
                      className="space-y-4 text-xs font-mono"
                    >
                      <div className="p-3 rounded border border-[#30363d] bg-[#161b22] space-y-1">
                        <span className="text-[#8b949e] text-[10px] uppercase">Token Verification</span>
                        <div className="font-mono text-lg tracking-[0.2em] text-[#f0f6fc]">
                          K7M2-Q9XD
                        </div>
                        <p className="text-[#38bdf8] text-[11px]">Entropy: 40 bits CSPRNG</p>
                      </div>
                      <p className="text-[#8b949e]">
                        Joining phone inputs 8-character token to locate host node.
                      </p>
                    </motion.div>
                  )}

                  {/* Step 3: Key Handshake Animation (Item 26) */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: duration.normal, ease: ease.standard }}
                      className="space-y-4 text-xs font-mono"
                    >
                      <div className="relative py-4 flex items-center justify-between px-4 border border-[#30363d] rounded bg-[#161b22]">
                        <span className="text-[#8b949e]">Phone</span>

                        {/* Animated exchanging key icons (Item 26) */}
                        <motion.div
                          animate={{ x: [0, 40, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: ease.standard }}
                          className="text-[#38bdf8]"
                        >
                          <Key className="w-4 h-4" />
                        </motion.div>

                        <span className="text-[#8b949e]">Workstation</span>
                      </div>
                      <p className="text-[#8b949e]">
                        Ed25519 pubkeys exchanged and pinned into local SQLite trusted database.
                      </p>
                    </motion.div>
                  )}

                  {/* Step 4: Transfer Progress Bar & Speed (Item 27) */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: duration.normal, ease: ease.standard }}
                      className="space-y-4 text-xs font-mono"
                    >
                      <div className="p-3 rounded border border-[#30363d] bg-[#161b22] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#f0f6fc]">RAW_Photos_Archive.zip</span>
                          <span className="text-[#38bdf8]">112.4 MB/s</span>
                        </div>
                        {/* Progress Bar (Item 27) */}
                        <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "74%" }}
                            transition={{ duration: duration.slow, ease: ease.standard }}
                            className="h-full bg-[#38bdf8]"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#8b949e]">
                          <span>Chunk 4,218 of 5,720 (64KB)</span>
                          <span>74% complete</span>
                        </div>
                      </div>
                      <p className="text-[#8b949e]">
                        Direct socket Range transfer streaming with sub-millisecond seek response.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="px-4 py-2 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                <span>State: Step {activeStep + 1} of 4</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3].map((stepIdx) => (
                    <button
                      key={stepIdx}
                      onClick={() => setActiveStep(stepIdx)}
                      className={`w-2 h-2 rounded-full cursor-pointer ${
                        activeStep === stepIdx ? "bg-[#38bdf8]" : "bg-[#30363d]"
                      }`}
                      aria-label={`Go to step ${stepIdx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
