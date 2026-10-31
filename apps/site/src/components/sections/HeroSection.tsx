import { useState } from "react";
import { ArrowDown, Check, Download, RefreshCw, Sparkles, Wifi } from "lucide-react";
import { NasendLogo } from "../brand/NasendLogo";
import { MobileNodeLogo, WorkstationNodeLogo } from "../brand/DeviceLogos";
import { GlassCard } from "../glass/GlassCard";
import { MagneticButton } from "../glass/MagneticButton";
import { CountUpNumber } from "../glass/CountUpNumber";
import type { ReleaseInfo } from "../../lib/site";
import { zenAudioEngine } from "../audio/ZenAudio";

interface HeroSectionProps {
  release: ReleaseInfo | null;
  onNavigate: (id: string) => void;
}

export function HeroSection({ release, onNavigate }: HeroSectionProps) {
  const [transferring, setTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(100);
  const [transferredFile, setTransferredFile] = useState("RAW_Camera_Roll.zip (2.4 GB)");

  const handleSimulateTransfer = () => {
    if (transferring) return;
    setTransferring(true);
    setTransferProgress(0);
    zenAudioEngine.playChime(440);

    const files = [
      "RAW_Camera_Roll.zip (2.4 GB)",
      "4K_Concert_Master.mkv (8.1 GB)",
      "Project_Codebase_Backup.tar (420 MB)",
    ];
    setTransferredFile(files[Math.floor(Math.random() * files.length)]);

    let cur = 0;
    const interval = setInterval(() => {
      cur += Math.floor(Math.random() * 18) + 12;
      if (cur >= 100) {
        cur = 100;
        clearInterval(interval);
        setTransferring(false);
        zenAudioEngine.playChime(880);
      }
      setTransferProgress(cur);
    }, 80);
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-28 pb-20 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl w-full">
        {/* Top Propitious Welcome Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl text-xs font-mono text-cyan-mesh mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-mesh animate-pulse" />
          <span className="uppercase tracking-widest font-semibold">Flagship P2P Architecture</span>
          <span className="text-white/20">|</span>
          <span className="text-snow/80">Zero VPS • Zero Rent</span>
        </div>

        {/* Main Grid: Left Column Copy & CTA, Right Column Interactive Live Glass Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Vision & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Your Devices <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-mesh via-indigo-mesh to-emerald-mesh text-glow-cyan">
                Are The Cloud.
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-fog leading-relaxed">
              Why pay recurring monthly subscriptions to store files on someone else&apos;s
              server? Nasend pools your Phone, Windows PC, and Android TV into an
              unbreakable, sovereign device-mesh. Pure peer-to-peer. Pure offline resilience.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <MagneticButton
                variant="primary"
                onClick={() => onNavigate("vault")}
                className="group"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>Download Sovereign Binaries</span>
              </MagneticButton>

              <MagneticButton
                variant="glass"
                onClick={() => onNavigate("pairing")}
                className="group"
              >
                <Sparkles className="w-4 h-4 text-amber-mesh transition-transform group-hover:rotate-12" />
                <span>Try Interactive Pairing Lab</span>
              </MagneticButton>

              {release && (
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs text-fog bg-card/60 border border-white/10">
                  <Check className="w-3.5 h-3.5 text-emerald-mesh" />
                  <span>Verified {release.tag}</span>
                </span>
              )}
            </div>

            {/* Live Metrics Row */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fog/70">
                  Egress Toll
                </span>
                <p className="font-display text-xl font-bold text-white">
                  $<CountUpNumber end={0.0} decimals={2} /> Forever
                </p>
                <p className="text-[11px] text-fog">Direct LAN & DTLS</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fog/70">
                  Handshake Latency
                </span>
                <p className="font-display text-xl font-bold text-cyan-mesh">
                  &lt;<CountUpNumber end={120} />ms
                </p>
                <p className="text-[11px] text-fog">8-rune Base32</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fog/70">
                  Local Transfer
                </span>
                <p className="font-display text-xl font-bold text-emerald-mesh">
                  Gigabit Line
                </p>
                <p className="text-[11px] text-fog">Zero throttles</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fog/70">
                  Server Cost
                </span>
                <p className="font-display text-xl font-bold text-indigo-mesh">
                  $0 / Month
                </p>
                <p className="text-[11px] text-fog">Ephemeral DOs only</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Mesh Glass Mockup */}
          <div className="lg:col-span-5">
            <GlassCard
              glowColor="cyan"
              className="p-6 sm:p-7 space-y-6 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <NasendLogo size={28} />
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">
                      Live Local Mesh
                    </h3>
                    <p className="text-[11px] font-mono text-emerald-mesh flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-mesh animate-ping" />
                      mDNS Port :8743 Connected
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSimulateTransfer}
                  disabled={transferring}
                  className="px-3 py-1.5 rounded-lg bg-cyan-mesh/10 hover:bg-cyan-mesh/20 border border-cyan-mesh/30 text-cyan-mesh font-mono text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  title="Simulate Wi-Fi File Transfer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${transferring ? "animate-spin" : ""}`}
                  />
                  <span>Send File</span>
                </button>
              </div>

              {/* Node-to-Node Transfer Visualizer */}
              <div className="relative py-4 flex items-center justify-between px-2">
                {/* Node 1: Phone */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-mesh/10 border border-cyan-mesh/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                    <MobileNodeLogo size={32} />
                  </div>
                  <span className="font-mono text-xs text-white">Android Phone</span>
                  <span className="font-mono text-[10px] text-fog">10.166.83.175</span>
                </div>

                {/* Animated Transfer Beam */}
                <div className="flex-1 px-4 flex flex-col items-center gap-2">
                  <div className="w-full relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-mesh via-indigo-mesh to-emerald-mesh rounded-full transition-all duration-150"
                      style={{ width: `${transferProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-mesh">
                    <Wifi className="w-3.5 h-3.5 text-cyan-mesh animate-pulse" />
                    <span>
                      {transferring
                        ? `${transferProgress}% (94 MB/s)`
                        : "Ready (Gigabit Wi-Fi)"}
                    </span>
                  </div>
                </div>

                {/* Node 2: PC */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-mesh/10 border border-indigo-mesh/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                    <WorkstationNodeLogo size={32} />
                  </div>
                  <span className="font-mono text-xs text-white">Windows PC</span>
                  <span className="font-mono text-[10px] text-fog">10.166.83.68</span>
                </div>
              </div>

              {/* Active Payload Box */}
              <div className="p-3.5 rounded-xl bg-ink/60 border border-white/10 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <p className="text-fog text-[10px] font-mono uppercase tracking-wider">
                    Recent Verified Transfer
                  </p>
                  <p className="font-mono text-snow font-medium truncate">
                    {transferredFile}
                  </p>
                </div>
                <span className="shrink-0 px-2 py-1 rounded bg-emerald-mesh/15 border border-emerald-mesh/30 text-emerald-mesh font-mono text-[10px]">
                  SHA-256 OK
                </span>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="mt-16 flex items-center justify-center">
          <button
            onClick={() => onNavigate("constellation")}
            className="flex items-center gap-2 text-xs font-mono text-fog hover:text-white transition cursor-pointer"
          >
            <span>Explore Sovereign Constellation</span>
            <ArrowDown className="w-3.5 h-3.5 text-cyan-mesh animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
}
