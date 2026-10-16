import { ArrowDown, HardDrive, Sparkles } from "lucide-react";
import type { ReleaseInfo } from "../../lib/site";
import { zenAudioEngine } from "../audio/ZenAudio";

export function Chapter01Threshold({ release }: { release: ReleaseInfo | null }) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      zenAudioEngine.playChime(520);
    }
  };

  return (
    <section id="chapter-01" className="relative min-h-[100dvh] flex flex-col justify-center px-5 pt-28 pb-20">
      <div className="mx-auto max-w-5xl w-full">
        {/* Chapter marker */}
        <div className="flex items-center gap-3 font-mono text-xs text-vermilion">
          <span className="flex h-2 w-2 rounded-full bg-vermilion animate-ping" />
          <span className="uppercase tracking-widest font-bold">01 // 門 The Threshold</span>
          <span className="text-fog/40">|</span>
          <span className="text-fog">The Fall of Cloud Monoliths</span>
        </div>

        {/* Main Editorial Headline */}
        <div className="mt-8 relative">
          {/* Japanese background watermark accent */}
          <span
            className="pointer-events-none absolute -top-12 -left-6 select-none font-serif text-8xl font-black text-white/[0.03] sm:text-9xl"
            aria-hidden="true"
          >
            影
          </span>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-snow sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05]">
            Your Devices <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vermilion via-amber to-snow">
              Are The Cloud.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base text-fog sm:text-lg md:text-xl leading-relaxed">
            The corporate cloud is a rent-seeking tollbooth. Nasend pools your
            phone, Android TV, and Windows PC into one private, zero-subscription
            storage constellation. Pure peer-to-peer. Pure offline resilience.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            onClick={() => scrollTo("chapter-05")}
            className="flex h-12 items-center gap-2.5 rounded-xl bg-vermilion px-6 font-display font-semibold text-white shadow-[0_0_30px_rgba(255,59,48,0.4)] transition hover:bg-vermilion/90 hover:shadow-[0_0_40px_rgba(255,59,48,0.6)] active:scale-95"
          >
            <HardDrive className="h-4 w-4" />
            <span>Download Sovereign Binaries</span>
          </button>

          <button
            onClick={() => scrollTo("chapter-03")}
            className="flex h-12 items-center gap-2 rounded-xl border border-line bg-card/80 px-5 text-sm font-medium text-snow backdrop-blur transition hover:border-white/20 active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-amber" />
            <span>Test Live Pairing Altar</span>
          </button>

          {release && (
            <span className="rounded-xl border border-line bg-ink/70 px-3.5 py-2 font-mono text-xs text-accent">
              Latest {release.tag}
            </span>
          )}
        </div>

        {/* Feature badges */}
        <div className="mt-16 grid grid-cols-2 gap-4 border-t border-line/60 pt-8 sm:grid-cols-4">
          <div className="space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-fog">Egress Cost</span>
            <p className="font-display text-xl font-bold text-snow">$0.00 Forever</p>
            <p className="text-xs text-fog">P2P direct & DTLS data channels</p>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-fog">Signaling Infra</span>
            <p className="font-display text-xl font-bold text-snow">Zero VPS Servers</p>
            <p className="text-xs text-fog">Cloudflare Worker Durable Object</p>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-fog">Authentication</span>
            <p className="font-display text-xl font-bold text-snow">No Accounts</p>
            <p className="text-xs text-fog">8-rune Crockford Base32 handshake</p>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-fog">Offline Capability</span>
            <p className="font-display text-xl font-bold text-snow">100% Airplane Mode</p>
            <p className="text-xs text-fog">mDNS direct discovery on local WiFi</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 flex items-center gap-2 font-mono text-xs text-fog/60">
          <ArrowDown className="h-3.5 w-3.5 animate-bounce text-vermilion" />
          <span>Scroll down to walk the sovereign mountain path</span>
        </div>
      </div>
    </section>
  );
}
