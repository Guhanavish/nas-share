import { useRef } from "react";
import { GlassCard } from "../glass/GlassCard";
import { Cpu, Network, ShieldCheck, PlayCircle, Box, ChevronLeft, ChevronRight } from "lucide-react";
import { zenAudioEngine } from "../audio/ZenAudio";

const PHASES = [
  {
    phase: "P0",
    name: "Ephemeral Cloudflare Signaling",
    desc: "Cloudflare Workers & Durable Objects maintain lightweight, zero-state websocket rooms solely for ephemeral peer rendezvous. Memory automatically purges after 60 seconds.",
    status: "Completed & Battle-Tested",
    metrics: "0 Server Bytes • $0 VPS Bill",
    icon: Cpu,
    accent: "text-cyan-mesh",
    border: "border-cyan-mesh/30",
  },
  {
    phase: "P1",
    name: "Offline mDNS Discovery Mesh",
    desc: "Local area network auto-detection via Multicast DNS on port 8743. Phone, PC, and TV spot each other across the room even if the home internet cable is unplugged.",
    status: "Completed & Verified",
    metrics: "Line-Rate Gigabit • Zero Setup",
    icon: Network,
    accent: "text-teal-400",
    border: "border-teal-400/30",
  },
  {
    phase: "P2",
    name: "8-Rune Crockford Key Exchange",
    desc: "Human-friendly Crockford Base32 tokens exclude easily confused letters (0/O, 1/I/L). Devices exchange ephemeral key material and pin Ed25519 fingerprints.",
    status: "Cryptographically Verified",
    metrics: "Ed25519 Pinned • Zero Passwords",
    icon: ShieldCheck,
    accent: "text-indigo-mesh",
    border: "border-indigo-mesh/30",
  },
  {
    phase: "P3",
    name: "4K Sub-Millisecond Range Streaming",
    desc: "Built-in Range header streaming engine slices raw 4K video files into 64KB micro-chunks. Seek backwards and forwards instantly on living room TVs without stutters.",
    status: "Sub-Millisecond Range",
    metrics: "64KB Range Chunks • 0 Buffering",
    icon: PlayCircle,
    accent: "text-emerald-mesh",
    border: "border-emerald-mesh/30",
  },
  {
    phase: "P4",
    name: "Sovereign Binary Vault",
    desc: "Windows portable standalone executable and Android universal APK built from source with verifiable SHA-256 integrity hashes and zero background telemetry.",
    status: "Production Ready",
    metrics: "Single EXE / Universal APK",
    icon: Box,
    accent: "text-amber-mesh",
    border: "border-amber-mesh/30",
  },
];

export function BuildPhasesStrip() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    zenAudioEngine.playChime(direction === "left" ? 440 : 587.33);
    const offset = direction === "left" ? -340 : 340;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-12 border-t border-white/10 overflow-hidden bg-ink/40">
      <div className="mx-auto max-w-7xl">
        {/* Header with Navigation Arrows */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-mesh">
              Engineering Architecture
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Build Phases: P0 through P4
            </h2>
            <p className="text-sm text-fog max-w-xl">
              From zero-cost ephemeral signaling to offline mDNS and line-rate 4K streaming.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 rounded-xl bg-card border border-white/10 hover:border-white/20 text-fog hover:text-white transition cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 rounded-xl bg-card border border-white/10 hover:border-white/20 text-fog hover:text-white transition cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Strip (Item 15) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <div
                key={phase.phase}
                className="w-[300px] sm:w-[360px] shrink-0 snap-start"
              >
                <GlassCard className={`h-full p-6 sm:p-7 flex flex-col justify-between space-y-5 border ${phase.border}`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-3xl font-black ${phase.accent}`}>
                        {phase.phase}
                      </span>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <Icon className={`w-5 h-5 ${phase.accent}`} />
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-bold text-white">
                      {phase.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-fog leading-relaxed">
                      {phase.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-fog">Verification:</span>
                      <span className="text-emerald-mesh">{phase.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-fog">Benchmark:</span>
                      <span className="text-white font-medium">{phase.metrics}</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
