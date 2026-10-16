import { useState } from "react";
import { Smartphone, Tv, Monitor, ShieldCheck } from "lucide-react";
import { zenAudioEngine } from "../audio/ZenAudio";

export function Chapter02Peers() {
  const [activePeer, setActivePeer] = useState<"phone" | "tv" | "pc">("phone");

  const selectPeer = (peer: "phone" | "tv" | "pc") => {
    setActivePeer(peer);
    zenAudioEngine.playChime(peer === "phone" ? 440 : peer === "tv" ? 554 : 660);
  };

  return (
    <section id="chapter-02" className="relative min-h-[100dvh] flex flex-col justify-center px-5 py-24">
      <div className="mx-auto max-w-5xl w-full">
        {/* Chapter marker */}
        <div className="flex items-center gap-3 font-mono text-xs text-amber">
          <span className="flex h-2 w-2 rounded-full bg-amber animate-pulse" />
          <span className="uppercase tracking-widest font-bold">02 // 灯 The Peers</span>
          <span className="text-fog/40">|</span>
          <span className="text-fog">Three Lanterns, Zero Servers</span>
        </div>

        <div className="mt-6">
          <h2 className="font-display text-3xl font-extrabold text-snow sm:text-5xl">
            Every Device is Both <br />
            <span className="text-amber">Server and Client.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-fog sm:text-lg">
            No central master node. Your phone exposes its storage to your PC;
            your PC exposes its terabytes to your Android TV. Pure symmetry.
          </p>
        </div>

        {/* Peer Selection Cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {/* Node 1: Mobile Phone */}
          <div
            onClick={() => selectPeer("phone")}
            className={`kage-card cursor-pointer rounded-3xl p-6 transition-all duration-300 ${
              activePeer === "phone"
                ? "border-amber/50 bg-amber/[0.04] shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/15 text-amber">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="font-display mt-5 text-xl font-bold text-snow">Mobile Node</h3>
            <p className="mt-1 font-mono text-xs text-amber">Kotlin • Jetpack Compose • Ktor</p>
            <p className="mt-3 text-sm text-fog leading-relaxed">
              Survives in background via Android ForegroundService. Shares selected photo & document
              folders with automatic battery optimization.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10px] text-fog">
              <span className="rounded-md border border-line bg-ink/60 px-2 py-0.5">mDNS Discovery</span>
              <span className="rounded-md border border-line bg-ink/60 px-2 py-0.5">Room DB</span>
              <span className="rounded-md border border-line bg-ink/60 px-2 py-0.5">WebRTC</span>
            </div>
          </div>

          {/* Node 2: Android TV */}
          <div
            onClick={() => selectPeer("tv")}
            className={`kage-card cursor-pointer rounded-3xl p-6 transition-all duration-300 ${
              activePeer === "tv"
                ? "border-cyan-mesh/50 bg-cyan-mesh/[0.04] shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-mesh/15 text-cyan-mesh">
              <Tv className="h-6 w-6" />
            </div>
            <h3 className="font-display mt-5 text-xl font-bold text-snow">Android TV Node</h3>
            <p className="mt-1 font-mono text-xs text-cyan-mesh">Leanback • D-Pad Halo • ExoPlayer</p>
            <p className="mt-3 text-sm text-fog leading-relaxed">
              1 universal APK with TV banner and touchscreen-optional declarations.
              Stream 4K videos directly from your PC across the room with zero buffering.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10px] text-fog">
              <span className="rounded-md border border-line bg-ink/60 px-2 py-0.5">D-Pad Ready</span>
              <span className="rounded-md border border-line bg-ink/60 px-2 py-0.5">TV Launcher</span>
              <span className="rounded-md border border-line bg-ink/60 px-2 py-0.5">Instant Seek</span>
            </div>
          </div>

          {/* Node 3: Windows Desktop */}
          <div
            onClick={() => selectPeer("pc")}
            className={`kage-card cursor-pointer rounded-3xl p-6 transition-all duration-300 ${
              activePeer === "pc"
                ? "border-primary/50 bg-primary/[0.04] shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Monitor className="h-6 w-6" />
            </div>
            <h3 className="font-display mt-5 text-xl font-bold text-snow">Windows PC Node</h3>
            <p className="mt-1 font-mono text-xs text-primary">Tauri v2 • Rust Axum • SQLite</p>
            <p className="mt-3 text-sm text-fog leading-relaxed">
              Ultra-compact 3.68 MB release bundle with system tray integration, autostart,
              and strict path-traversal boundary sandboxing.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10px] text-fog">
              <span className="rounded-md border border-line bg-ink/60 px-2 py-0.5">3.68 MB Bundle</span>
              <span className="rounded-md border border-line bg-ink/60 px-2 py-0.5">System Tray</span>
              <span className="rounded-md border border-line bg-ink/60 px-2 py-0.5">Sandboxed</span>
            </div>
          </div>
        </div>

        {/* Architectural Security Guarantee */}
        <div className="mt-8 rounded-2xl border border-line bg-ink/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
            <p className="text-xs text-fog">
              <strong className="text-snow">Zero File Bytes Touch the Cloudflare Worker:</strong> The signaling
              server acts solely as a transient 5-minute meeting room to exchange WebRTC SDP metadata.
              All bytes flow over DTLS encrypted peer channels.
            </p>
          </div>
          <span className="shrink-0 font-mono text-[11px] text-accent font-semibold border border-accent/20 bg-accent/10 px-2.5 py-1 rounded-full">
            E2EE Guaranteed
          </span>
        </div>
      </div>
    </section>
  );
}
