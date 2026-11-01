import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Folder, File, Send, Check, Smartphone, Monitor } from "lucide-react";
import { TOKENS } from "../../tokens";

export function ProductShowcaseSection() {
  const [activeView, setActiveView] = useState<"pc" | "phone">("pc");
  const [sentFile, setSentFile] = useState<string | null>(null);

  const { duration, ease } = TOKENS.motion;

  const pcFiles = [
    { name: "Camera_Roll_Backup", type: "dir", size: "4.2 GB", items: "128 items" },
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

  return (
    <section id="product" className="py-20 border-b border-[#30363d]">
      <div className="mx-auto max-w-4xl px-6 space-y-12">
        <div className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
            Interface &amp; File Browser
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc]">
            Product showcase
          </h2>
          <p className="text-sm text-[#8b949e] leading-relaxed max-w-xl">
            Clean directory browsing on desktop and mobile. Zero cloud accounts required.
          </p>
        </div>

        {/* View Switcher: PC vs Phone (Item 34) */}
        <div className="flex items-center gap-2 border-b border-[#30363d] pb-4">
          <button
            onClick={() => setActiveView("pc")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition cursor-pointer ${
              activeView === "pc"
                ? "bg-[#21262d] text-[#f0f6fc] border border-[#30363d]"
                : "text-[#8b949e] hover:text-[#f0f6fc]"
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Windows Desktop Host</span>
          </button>
          <button
            onClick={() => setActiveView("phone")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition cursor-pointer ${
              activeView === "phone"
                ? "bg-[#21262d] text-[#f0f6fc] border border-[#30363d]"
                : "text-[#8b949e] hover:text-[#f0f6fc]"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Android Edge Client</span>
          </button>
        </div>

        {/* Window Frame with App View & Cross-fade (Item 34) */}
        <div className="window-frame">
          <div className="window-header">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-[#30363d]" />
              <span className="w-2.5 h-2.5 rounded-full border border-[#30363d]" />
              <span className="w-2.5 h-2.5 rounded-full border border-[#30363d]" />
              <span className="ml-2 font-mono text-xs">
                {activeView === "pc" ? "nasend-desktop://shared_library" : "nasend-android://remote_browse"}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#8b949e]">Port 8743</span>
          </div>

          <div className="p-6 bg-[#0e1117] min-h-[300px]">
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
                  <div className="flex items-center justify-between text-xs font-mono text-[#8b949e] border-b border-[#30363d] pb-2">
                    <span>Name</span>
                    <span>Action / Size</span>
                  </div>

                  {/* Staggered File Rows (Item 35) */}
                  <div className="space-y-2">
                    {pcFiles.map((f, i) => (
                      <motion.div
                        key={f.name}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: duration.fast, delay: i * 0.05, ease: ease.standard }}
                        className="p-3 rounded border border-[#30363d] bg-[#161b22] flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2.5">
                          {f.type === "dir" ? (
                            <Folder className="w-4 h-4 text-[#38bdf8]" />
                          ) : (
                            <File className="w-4 h-4 text-[#8b949e]" />
                          )}
                          <span className="text-[#f0f6fc]">{f.name}</span>
                          <span className="text-[10px] text-[#8b949e]">({f.items})</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[#8b949e]">{f.size}</span>
                          <button
                            onClick={() => handleSend(f.name)}
                            disabled={sentFile === f.name}
                            className="px-2 py-1 rounded border border-[#30363d] hover:border-[#38bdf8] text-[10px] text-[#f0f6fc] flex items-center gap-1 transition cursor-pointer"
                          >
                            {sentFile === f.name ? (
                              <>
                                <Check className="w-3 h-3 text-[#38bdf8]" />
                                <span className="text-[#38bdf8]">Sent to Phone</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3 text-[#38bdf8]" />
                                <span>Push to Peer</span>
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
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
                  <div className="flex items-center justify-between text-xs font-mono text-[#8b949e] border-b border-[#30363d] pb-2">
                    <span>Camera Roll Auto-Mirror</span>
                    <span>Status</span>
                  </div>

                  <div className="space-y-2">
                    {phoneFiles.map((f, i) => (
                      <motion.div
                        key={f.name}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: duration.fast, delay: i * 0.05, ease: ease.standard }}
                        className="p-3 rounded border border-[#30363d] bg-[#161b22] flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-[#38bdf8]" />
                          <span className="text-[#f0f6fc]">{f.name}</span>
                          <span className="text-[10px] text-[#8b949e]">({f.size})</span>
                        </div>
                        <span className="text-[10px] text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/30">
                          {f.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Folder Sync & Conflict Keep-Both Example (Item 36) */}
        <div className="p-4 rounded border border-[#30363d] bg-[#161b22] space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[#f0f6fc] font-medium">
              Folder Sync &amp; Conflict Strategy
            </span>
            <span className="font-mono text-[10px] text-[#8b949e]">Keep-Both Mode</span>
          </div>
          <p className="text-[#8b949e] leading-relaxed">
            When two devices modify the same file offline, Nasend never silently overwrites your data. Both versions are preserved with device source tags and timestamps:
          </p>
          <div className="p-2.5 rounded bg-[#0e1117] border border-[#30363d] font-mono text-[11px] space-y-1">
            <p className="text-[#f0f6fc]">notes_master.md <span className="text-[#8b949e]">(Base file)</span></p>
            <p className="text-[#38bdf8]">notes_master.phone_pixel.20261101.md <span className="text-[#8b949e]">(Preserved offline copy)</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}
