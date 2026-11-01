import { useState } from "react";
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
} from "lucide-react";
import { TOKENS } from "../../tokens";

export function ProductShowcaseSection() {
  const [activeView, setActiveView] = useState<"pc" | "phone">("pc");
  const [sentFile, setSentFile] = useState<string | null>(null);

  const { duration, ease } = TOKENS.motion;

  const pcFiles = [
    { name: "Camera_Roll_Archive", type: "dir", size: "4.2 GB", items: "128 items" },
    { name: "Concert_4K_Remux.mkv", type: "file", size: "14.8 GB", items: "Stream ready" },
    { name: "Project_Archive.tar", type: "file", size: "380 MB", items: "Single file" },
  ];

  const phoneFiles = [
    { name: "DCIM_2026_11_01.mp4", type: "file", size: "840 MB", status: "Synced" },
    { name: "Voice_Memos", type: "dir", size: "48 MB", status: "Synced" },
  ];

  const handleSend = (name: string) => {
    setSentFile(name);
    setTimeout(() => setSentFile(null), 2400);
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
      desc: "Move files smoothly between Windows, Android, Android TV, and modern web browsers.",
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
    <section id="product" className="py-24 border-b border-[#343934]">
      <div className="mx-auto max-w-5xl px-6 space-y-16">
        <div className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[11px] font-mono text-[#929690] uppercase tracking-wider">
            <span>Interface &amp; Capabilities</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F3F0]">
            Engineered for direct utility
          </h2>
          <p className="text-sm sm:text-base text-[#929690] leading-relaxed max-w-xl font-sans">
            Clean directory browsing on desktop and mobile with instant peer-to-peer delivery.
          </p>
        </div>

        {/* View Switcher: PC vs Phone */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#343934] pb-4">
            <button
              onClick={() => setActiveView("pc")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                activeView === "pc"
                  ? "bg-[#252825] text-[#F2F3F0] border border-[#414741]"
                  : "text-[#929690] hover:text-[#F2F3F0]"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-[#A3B899]" />
              <span>Windows Desktop Host</span>
            </button>
            <button
              onClick={() => setActiveView("phone")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                activeView === "phone"
                  ? "bg-[#252825] text-[#F2F3F0] border border-[#414741]"
                  : "text-[#929690] hover:text-[#F2F3F0]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#A3B899]" />
              <span>Android Edge Client</span>
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

            <div className="p-6 bg-[#0C0D0C] min-h-[300px]">
              <AnimatePresence mode="wait">
                {activeView === "pc" ? (
                  <motion.div
                    key="pc-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: duration.normal, ease: ease.standard }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-[#929690] border-b border-[#343934] pb-2">
                      <span>File / Directory</span>
                      <span>Action / Size</span>
                    </div>

                    <div className="space-y-2">
                      {pcFiles.map((file) => (
                        <div
                          key={file.name}
                          className="flex items-center justify-between p-3 rounded-lg border border-[#343934] bg-[#1B1D1B] hover:border-[#414741] transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded bg-[#252825] text-[#A3B899]">
                              {file.type === "dir" ? (
                                <Folder className="w-4 h-4" />
                              ) : (
                                <File className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-mono font-medium text-[#F2F3F0]">
                                {file.name}
                              </span>
                              <span className="ml-2 text-[10px] font-mono text-[#929690]">
                                {file.items}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-[#929690]">{file.size}</span>
                            <button
                              onClick={() => handleSend(file.name)}
                              className="px-2.5 py-1 rounded bg-[#252825] hover:bg-[#343934] text-[11px] font-mono text-[#F2F3F0] border border-[#343934] flex items-center gap-1.5 transition cursor-pointer"
                            >
                              {sentFile === file.name ? (
                                <>
                                  <Check className="w-3 h-3 text-[#A3B899]" />
                                  <span className="text-[#A3B899]">Sent</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3 h-3" />
                                  <span>Send</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="phone-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: duration.normal, ease: ease.standard }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-lg bg-[#1B1D1B] border border-[#343934] flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 text-[#929690]">
                        <Smartphone className="w-4 h-4 text-[#A3B899]" />
                        <span>Background Sync Status:</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#A3B899]">
                        <Check className="w-3.5 h-3.5" />
                        <span>In sync (Port 8743)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {phoneFiles.map((f) => (
                        <div
                          key={f.name}
                          className="flex items-center justify-between p-3 rounded-lg border border-[#343934] bg-[#1B1D1B]"
                        >
                          <div className="flex items-center gap-2.5">
                            <File className="w-4 h-4 text-[#A3B899]" />
                            <span className="text-xs font-mono text-[#F2F3F0]">{f.name}</span>
                          </div>
                          <span className="text-xs font-mono text-[#929690]">{f.size}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid (Section 5.E) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: duration.reveal, delay: idx * 0.05, ease: ease.standard }}
                className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] hover:border-[#414741] hover:bg-[#252825] transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-lg border border-[#343934] bg-[#0C0D0C] flex items-center justify-center text-[#A3B899]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-[#F2F3F0] tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#929690] leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
