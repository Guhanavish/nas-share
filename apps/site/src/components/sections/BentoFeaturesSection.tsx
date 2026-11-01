import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../glass/GlassCard";
import {
  Wifi,
  KeyRound,
  PlayCircle,
  DollarSign,
  Layers,
} from "lucide-react";
import { zenAudioEngine } from "../audio/ZenAudio";

type BentoDevice = "phone" | "pc" | "tv";

export function BentoFeaturesSection() {
  const [activeTab, setActiveTab] = useState<BentoDevice>("pc");

  const deviceDetails = {
    phone: {
      title: "Android Edge Node",
      badge: "Ktor HTTP/1.1 • Kotlin",
      storage: "Local Camera Roll & Media",
      network: "Wi-Fi 6 Direct (850 Mbps)",
      specs: ["Automatic background photo sync", "Zero background battery drain", "Instant QR camera pairing"],
    },
    pc: {
      title: "Windows Workstation Vault",
      badge: "Tauri v2 • Axum Rust Engine",
      storage: "Multi-Terabyte NVMe Arrays",
      network: "Gigabit Ethernet (980 Mbps)",
      specs: ["Silent system tray resident daemon", "Instant folder delta cataloging", "Direct Range chunk serving"],
    },
    tv: {
      title: "Android TV Living Room Portal",
      badge: "ExoPlayer • Leanback 4K HDR",
      storage: "Ultra-Low Latency RAM Cache",
      network: "5GHz Home Mesh (450 Mbps)",
      specs: ["Sub-millisecond scrubbing in 4K", "Zero HDMI cables or media servers", "Dolby Vision & Atmos passthrough"],
    },
  };

  const handleTabChange = (tab: BentoDevice) => {
    setActiveTab(tab);
    zenAudioEngine.playChime(tab === "phone" ? 523 : tab === "pc" ? 659 : 784);
  };

  return (
    <section id="features" className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 border-t border-white/10">
      <div className="mx-auto max-w-7xl space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-mesh/30 bg-indigo-mesh/10 text-indigo-mesh font-mono text-xs">
            <Layers className="w-3.5 h-3.5" />
            <span>Sovereign Bento Grid</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Engineered For Pure Device Sovereignty
          </h2>
          <p className="text-base sm:text-lg text-fog">
            Every feature is designed from first principles to eradicate monthly fees and privacy trade-offs.
          </p>
        </div>

        {/* Bento Grid (Items 18, 19, 20) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
          {/* Bento Item 1: Hero Card with Animated Gradient Border (Item 20) - Spans 8 cols */}
          <div className="md:col-span-3 lg:col-span-8 animated-gradient-border p-[1px] shadow-2xl">
            <div className="h-full rounded-2xl bg-ink/90 p-7 sm:p-9 flex flex-col justify-between space-y-8 backdrop-blur-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-mesh/15 border border-emerald-mesh/30 text-emerald-mesh font-mono text-xs font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>$0 Forever • Zero Egress Toll</span>
                  </div>
                  <span className="text-xs font-mono text-fog">Architecture Principle #1</span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  Why Pay Rent for Storage You Already Own?
                </h3>

                <p className="text-fog text-sm sm:text-base leading-relaxed max-w-2xl">
                  Commercial clouds charge $10 to $30 every single month to hold your files in distant datacenters, then throttle your download bandwidth. Nasend lets your existing phones, PCs, and TVs serve as your private cloud mesh at full line-rate speeds.
                </p>
              </div>

              {/* Live Cost Comparison Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="p-4 rounded-xl bg-card/60 border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-fog">Big Tech Cloud</span>
                  <p className="font-display text-xl font-bold text-rose-400">$120–$360 / yr</p>
                  <p className="text-[11px] text-fog/80">Monthly recurring fee</p>
                </div>

                <div className="p-4 rounded-xl bg-card/60 border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-fog">Egress & Bandwidth</span>
                  <p className="font-display text-xl font-bold text-amber-400">Throttled & Metered</p>
                  <p className="text-[11px] text-fog/80">Slow sync on large files</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-mesh/10 border border-emerald-mesh/30 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-mesh">Nasend Sovereign Mesh</span>
                  <p className="font-display text-xl font-bold text-emerald-mesh">$0.00 Forever</p>
                  <p className="text-[11px] text-emerald-mesh/80">Gigabit local line-rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Sliding Pill Indicator Tabs (Item 25) - Spans 4 cols */}
          <GlassCard className="md:col-span-3 lg:col-span-4 p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-mesh block">
                Tri-Node Specialization
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                Hardware Roles
              </h3>

              {/* Sliding Pill Tab Switcher (Item 25) */}
              <div className="relative flex p-1 rounded-xl bg-ink/80 border border-white/10 text-xs font-mono">
                {(["phone", "pc", "tv"] as BentoDevice[]).map((tab) => {
                  const isActive = activeTab === tab;
                  const label = tab === "phone" ? "Phone" : tab === "pc" ? "PC" : "TV";
                  return (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`relative flex-1 py-1.5 rounded-lg text-center font-medium transition-colors cursor-pointer z-10 ${
                        isActive ? "text-white" : "text-fog hover:text-snow"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="bentoTabIndicator"
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-mesh/30 to-indigo-mesh/30 border border-cyan-mesh/40 -z-10 shadow-sm"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 pt-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-white">{deviceDetails[activeTab].title}</span>
                    <span className="text-cyan-mesh text-[11px]">{deviceDetails[activeTab].badge}</span>
                  </div>

                  <ul className="space-y-2 text-xs text-fog font-mono">
                    {deviceDetails[activeTab].specs.map((spec, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-mesh shrink-0" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-fog">
              <span>Protocol:</span>
              <span className="text-white">HTTP/1.1 Range & mDNS</span>
            </div>
          </GlassCard>

          {/* Bento Item 3: Local mDNS (Spans 4 cols) */}
          <GlassCard className="md:col-span-1 lg:col-span-4 p-6 sm:p-7 space-y-4">
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 w-fit">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              Direct Offline mDNS
            </h3>
            <p className="text-xs sm:text-sm text-fog leading-relaxed">
              When your internet provider has an outage or your fiber cable is cut, your local Nasend mesh remains 100% operational. Files and media stream over local Wi-Fi without leaving your home.
            </p>
            <div className="pt-2 text-[11px] font-mono text-teal-300">
              ✓ Multicast DNS on Port :8743
            </div>
          </GlassCard>

          {/* Bento Item 4: 8-Rune Crockford Key Exchange (Spans 4 cols) */}
          <GlassCard className="md:col-span-1 lg:col-span-4 p-6 sm:p-7 space-y-4">
            <div className="p-3 rounded-xl bg-indigo-mesh/10 border border-indigo-mesh/30 text-indigo-mesh w-fit">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              8-Rune Crockford Pairing
            </h3>
            <p className="text-xs sm:text-sm text-fog leading-relaxed">
              Forget usernames, passwords, or recovery emails. Pairing is done in 2 seconds with an 8-character Crockford Base32 code that omits ambiguous letters to avoid misreadings.
            </p>
            <div className="pt-2 text-[11px] font-mono text-indigo-300">
              ✓ Ed25519 Pinned Public Keys
            </div>
          </GlassCard>

          {/* Bento Item 5: 4K Sub-Millisecond Range Slicing (Spans 4 cols) */}
          <GlassCard className="md:col-span-1 lg:col-span-4 p-6 sm:p-7 space-y-4">
            <div className="p-3 rounded-xl bg-emerald-mesh/10 border border-emerald-mesh/30 text-emerald-mesh w-fit">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              Sub-Millisecond 4K Slicing
            </h3>
            <p className="text-xs sm:text-sm text-fog leading-relaxed">
              Files are served in 64KB HTTP/1.1 Range chunks. Scrub through a 60GB 4K MKV film on your Android TV with zero buffering, instant seek response, and flawless audio passthrough.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-300">
              ✓ Zero Transcoding CPU Spikes
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
