import { ArrowDown, Check, Download, Sparkles } from "lucide-react";
import { MagneticButton } from "../glass/MagneticButton";
import { CountUpNumber } from "../glass/CountUpNumber";
import { HeadlineCycler } from "../hero/HeadlineCycler";
import { HeroLiveNetwork } from "../hero/HeroLiveNetwork";
import { FlippingPairingCode } from "../hero/FlippingPairingCode";
import type { ReleaseInfo } from "../../lib/site";

interface HeroSectionProps {
  release: ReleaseInfo | null;
  onNavigate: (id: string) => void;
  onPairingCodeCopied?: (code: string) => void;
}

export function HeroSection({ release, onNavigate, onPairingCodeCopied }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-28 pb-20 overflow-hidden"
    >
      {/* Slow-drifting Aurora Mesh Background behind Hero (Item 2) */}
      <div className="aurora-mesh">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full">
        {/* Top Propitious Welcome Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl text-xs font-mono text-cyan-mesh mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-mesh animate-pulse" />
          <span className="uppercase tracking-widest font-semibold">Flagship Sovereign Mesh</span>
          <span className="text-white/20">|</span>
          <span className="text-snow/80">Zero VPS • Zero Central Accounts</span>
        </div>

        {/* Main Grid: Left Column Copy & CTA, Right Column Interactive Live Tri-Node Network */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Vision & Actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Animated Headline Cycler: Your Phone -> Your PC -> Your TV -> One Private Cloud (Item 7) */}
            <HeadlineCycler />

            <p className="max-w-xl text-base sm:text-lg text-fog leading-relaxed">
              Why pay recurring monthly rent to store files on someone else&apos;s
              servers? Nasend pools your Phone, Windows PC, and Android TV into an
              unbreakable, encrypted device cloud. Pure peer-to-peer. Pure offline resilience.
            </p>

            {/* Action Buttons (Magnetic CTA Buttons - Item 8) */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <MagneticButton
                variant="primary"
                onClick={() => onNavigate("vault")}
                className="group"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>Get Sovereign Binaries</span>
              </MagneticButton>

              <MagneticButton
                variant="glass"
                onClick={() => onNavigate("how-it-works")}
                className="group"
              >
                <Sparkles className="w-4 h-4 text-amber-mesh transition-transform group-hover:rotate-12" />
                <span>How It Works</span>
              </MagneticButton>

              {release && (
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs text-fog bg-card/60 border border-white/10">
                  <Check className="w-3.5 h-3.5 text-emerald-mesh" />
                  <span>Verified {release.tag}</span>
                </span>
              )}
            </div>

            {/* 8-Character Flipping Pairing Code Preview (Item 9) */}
            <div className="pt-4">
              <FlippingPairingCode onCopy={onPairingCodeCopied} />
            </div>

            {/* Live Metrics Row with CountUp (Item 10) */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fog/70">
                  Server Cost
                </span>
                <p className="font-display text-xl font-bold text-white">
                  $<CountUpNumber end={0.0} decimals={2} /> / mo
                </p>
                <p className="text-[11px] text-fog">$0 Server Rent</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fog/70">
                  Stored on Server
                </span>
                <p className="font-display text-xl font-bold text-cyan-mesh">
                  <CountUpNumber end={0} /> Bytes
                </p>
                <p className="text-[11px] text-fog">Zero VPS bytes</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fog/70">
                  Direct LAN Speed
                </span>
                <p className="font-display text-xl font-bold text-emerald-mesh">
                  Line Rate
                </p>
                <p className="text-[11px] text-fog">112+ MB/s Wi-Fi</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fog/70">
                  Pairing Handshake
                </span>
                <p className="font-display text-xl font-bold text-indigo-mesh">
                  &lt;<CountUpNumber end={120} />ms
                </p>
                <p className="text-[11px] text-fog">Sub-second link</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Network Triangle with SVG paths, LAN/WAN toggle, and scroll split (Items 6, 11, 23) */}
          <div className="lg:col-span-6">
            <HeroLiveNetwork />
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="mt-16 flex items-center justify-center">
          <button
            onClick={() => onNavigate("how-it-works")}
            className="flex items-center gap-2 text-xs font-mono text-fog hover:text-white transition cursor-pointer"
          >
            <span>Scroll to see how it works</span>
            <ArrowDown className="w-3.5 h-3.5 text-cyan-mesh animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
}
