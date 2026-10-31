import { useState } from "react";
import { GlassCard } from "../glass/GlassCard";
import { MobileNodeLogo, WorkstationNodeLogo, LivingRoomTvLogo, CloudTollLogo } from "../brand/DeviceLogos";
import { LocalMdnsGlyph, WebRtcLockGlyph } from "../brand/FeatureLogos";
import { zenAudioEngine } from "../audio/ZenAudio";

export function ConstellationSection() {
  const [activeDevice, setActiveDevice] = useState<"phone" | "pc" | "tv">("pc");

  const deviceData = {
    phone: {
      name: "Android Mobile Node",
      badge: "Kotlin • Ktor :8743 • Jetpack Compose",
      desc: "Camera roll auto-sync, offline media streaming, and local file browser on Android 8.0+. Acts as both full HTTP file server and client.",
      storage: "512 GB NVMe",
      bandwidth: "Wi-Fi 6 Direct (850 Mbps)",
    },
    pc: {
      name: "Windows Workstation Node",
      badge: "Rust • Axum :8743 • Tauri v2",
      desc: "Instant multi-terabyte folder sharing, SQLite cataloging, background system tray daemon, and high-throughput delta sync engine.",
      storage: "4 TB NVMe Array",
      bandwidth: "Gigabit Ethernet (980 Mbps)",
    },
    tv: {
      name: "Android TV & Living Room",
      badge: "ExoPlayer • Leanback • 4K HDR",
      desc: "Stream your PC movie library straight to the living room TV with sub-millisecond HTTP 206 Range seek and zero transcoding lag.",
      storage: "64 GB Flash Cache",
      bandwidth: "5 GHz Wi-Fi (450 Mbps)",
    },
  };

  const handleSelectDevice = (key: "phone" | "pc" | "tv") => {
    setActiveDevice(key);
    zenAudioEngine.playChime(key === "phone" ? 520 : key === "pc" ? 640 : 760);
  };

  return (
    <section id="constellation" className="relative py-28 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl w-full space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-mesh/20 bg-cyan-mesh/5 text-[11px] font-mono text-cyan-mesh uppercase tracking-widest">
            <span>Sovereign Topology</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            The Three-Node Equilibrium.
          </h2>
          <p className="text-fog text-sm sm:text-base leading-relaxed">
            Every device in your life already has high-speed storage and processing power.
            Nasend simply connects them into an autonomous, self-healing constellation.
          </p>
        </div>

        {/* 3 Interactive Device Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Mobile */}
          <GlassCard
            glowColor="cyan"
            onClick={() => handleSelectDevice("phone")}
            className={`p-6 cursor-pointer transition-all ${
              activeDevice === "phone"
                ? "border-cyan-mesh ring-1 ring-cyan-mesh/50 bg-white/[0.06]"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <MobileNodeLogo size={36} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-mesh/10 text-cyan-mesh border border-cyan-mesh/20">
                EDGE NODE
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">Mobile Node</h3>
            <p className="text-xs text-fog font-mono mt-1">Kotlin Ktor :8743</p>
            <p className="text-sm text-fog/90 mt-3 leading-relaxed">
              Carries your camera roll and personal files wherever you go. Instant Wi-Fi sync whenever you step through your front door.
            </p>
          </GlassCard>

          {/* Card 2: PC */}
          <GlassCard
            glowColor="indigo"
            onClick={() => handleSelectDevice("pc")}
            className={`p-6 cursor-pointer transition-all ${
              activeDevice === "pc"
                ? "border-indigo-mesh ring-1 ring-indigo-mesh/50 bg-white/[0.06]"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <WorkstationNodeLogo size={36} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-mesh/10 text-indigo-mesh border border-indigo-mesh/20">
                VAULT CORE
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">Workstation Node</h3>
            <p className="text-xs text-fog font-mono mt-1">Rust Axum :8743</p>
            <p className="text-sm text-fog/90 mt-3 leading-relaxed">
              High-capacity desktop anchor. Handles background delta scans, large directory manifests, and cryptographic Ed25519 pairing.
            </p>
          </GlassCard>

          {/* Card 3: Android TV */}
          <GlassCard
            glowColor="emerald"
            onClick={() => handleSelectDevice("tv")}
            className={`p-6 cursor-pointer transition-all ${
              activeDevice === "tv"
                ? "border-emerald-mesh ring-1 ring-emerald-mesh/50 bg-white/[0.06]"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <LivingRoomTvLogo size={36} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-mesh/10 text-emerald-mesh border border-emerald-mesh/20">
                STREAM SCREEN
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">Living Room TV</h3>
            <p className="text-xs text-fog font-mono mt-1">ExoPlayer HTTP 206</p>
            <p className="text-sm text-fog/90 mt-3 leading-relaxed">
              Living room portal for direct 4K video streaming. Zero HDMI cables, zero Plex/Jellyfin cloud subscriptions.
            </p>
          </GlassCard>
        </div>

        {/* Selected Device Deep-Dive Console */}
        <GlassCard className="p-8 border border-white/10 bg-panel/70">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-mesh">
                  Selected Active Node
                </span>
                <span className="text-white/20">•</span>
                <span className="text-xs font-mono text-emerald-mesh">
                  {deviceData[activeDevice].badge}
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                {deviceData[activeDevice].name}
              </h3>
              <p className="text-sm sm:text-base text-fog leading-relaxed">
                {deviceData[activeDevice].desc}
              </p>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-8">
              <div>
                <span className="text-[10px] font-mono uppercase text-fog">Typical Storage</span>
                <p className="font-display text-lg font-bold text-white">
                  {deviceData[activeDevice].storage}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-fog">Transfer Rate</span>
                <p className="font-display text-lg font-bold text-emerald-mesh">
                  {deviceData[activeDevice].bandwidth}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Architectural Pillars Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <LocalMdnsGlyph size={32} />
            <div>
              <h4 className="font-display font-semibold text-white text-base">Direct Local mDNS</h4>
              <p className="text-xs text-fog mt-1 leading-relaxed">
                Devices discover each other over your home Wi-Fi instantly. Works even if your internet connection is completely unplugged.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <WebRtcLockGlyph size={32} />
            <div>
              <h4 className="font-display font-semibold text-white text-base">DTLS DataChannels</h4>
              <p className="text-xs text-fog mt-1 leading-relaxed">
                When devices are remote, WebRTC DataChannels puncture NAT firewalls with peer-to-peer DTLS end-to-end encryption.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <CloudTollLogo size={32} />
            <div>
              <h4 className="font-display font-semibold text-white text-base">Zero Cloud Tollbooths</h4>
              <p className="text-xs text-fog mt-1 leading-relaxed">
                Zero gigabytes ever pass through a centralized server. Signaling is handled ephemerally by Cloudflare Workers at $0 cost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
