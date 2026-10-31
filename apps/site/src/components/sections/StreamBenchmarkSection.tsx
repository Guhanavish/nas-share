import { useState } from "react";
import { Play, Pause, Zap, CloudOff } from "lucide-react";
import { GlassCard } from "../glass/GlassCard";
import { StreamWaveGlyph } from "../brand/FeatureLogos";
import { zenAudioEngine } from "../audio/ZenAudio";

export function StreamBenchmarkSection() {
  const [seekPos, setSeekPos] = useState(38); // 0 to 100%
  const [isPlaying, setIsPlaying] = useState(true);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSeekPos(val);
    zenAudioEngine.playChime(300 + val * 6);
  };

  return (
    <section id="streaming" className="relative py-28 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-5xl w-full space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-mesh/20 bg-cyan-mesh/5 text-[11px] font-mono text-cyan-mesh uppercase tracking-widest">
            <StreamWaveGlyph size={14} />
            <span>Sub-Millisecond Range Engine</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Stream Direct. Zero Transcode.
          </h2>
          <p className="text-fog text-sm sm:text-base leading-relaxed">
            Why wait for a cloud drive to download an entire 20GB 4K movie before you can watch it?
            Nasend streams bytes in adaptive 64KB chunks with sub-millisecond HTTP 206 Range seeking.
          </p>
        </div>

        {/* Interactive Scrubbing Benchmark Simulator */}
        <GlassCard glowColor="cyan" className="p-8 sm:p-10 border border-white/10 shadow-2xl">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Interactive 4K Media Stream Scrubber
                </h3>
                <p className="text-xs text-fog font-mono">
                  Target File: <code>Blade_Runner_2049_4K_Remux.mkv (22.4 GB)</code>
                </p>
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-lg bg-cyan-mesh/10 hover:bg-cyan-mesh/20 text-cyan-mesh text-xs font-mono flex items-center gap-2 transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? "Pause Stream" : "Resume Stream"}</span>
              </button>
            </div>

            {/* Range Scrubber Input */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-fog">
                <span>00:00:00 (Start)</span>
                <span className="text-cyan-mesh font-bold">
                  Current Time: {Math.floor((seekPos * 163) / 60)}h {((seekPos * 163) % 60).toFixed(0)}m
                </span>
                <span>02:43:00 (End)</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={seekPos}
                onChange={handleSeek}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[11px] text-center text-fog font-mono">
                Drag the scrubber anywhere to trigger an instant HTTP 206 Partial-Content seek
              </p>
            </div>

            {/* Side-by-Side Latency Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Nasend Performance Card */}
              <div className="p-6 rounded-2xl bg-cyan-500/[0.04] border border-cyan-500/25 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-mesh" />
                    <span className="font-display font-bold text-white text-base">Nasend P2P Mesh</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                    ACTIVE 64KB CHUNK
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-ink/60 border border-white/5">
                    <p className="text-fog text-[10px]">Seek Response</p>
                    <p className="text-xl font-bold text-cyan-mesh">0.8 ms</p>
                  </div>
                  <div className="p-3 rounded-xl bg-ink/60 border border-white/5">
                    <p className="text-fog text-[10px]">Playback Buffer</p>
                    <p className="text-xl font-bold text-emerald-mesh">Instant 4K</p>
                  </div>
                </div>

                <p className="text-xs text-fog/90 leading-relaxed">
                  Only the requested 64KB segment is transferred. Audio and video decode instantly without waiting for file download.
                </p>
              </div>

              {/* Commercial Cloud Comparison Card */}
              <div className="p-6 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudOff className="w-4 h-4 text-rose-400" />
                    <span className="font-display font-bold text-white text-base">Commercial Cloud</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px]">
                    BUFFERING DELAY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-ink/60 border border-white/5">
                    <p className="text-fog text-[10px]">Seek Response</p>
                    <p className="text-xl font-bold text-rose-400">840 ms</p>
                  </div>
                  <div className="p-3 rounded-xl bg-ink/60 border border-white/5">
                    <p className="text-fog text-[10px]">Server Egress</p>
                    <p className="text-xl font-bold text-rose-400">$0.09 / GB</p>
                  </div>
                </div>

                <p className="text-xs text-fog/90 leading-relaxed">
                  Centralized servers must re-encode on the fly or force you to wait for multi-gigabyte downloads with buffering wheels.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
