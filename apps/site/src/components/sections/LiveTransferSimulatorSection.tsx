import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { GlassCard } from "../glass/GlassCard";
import { FileCode, Play, Pause, RefreshCw, Smartphone, Laptop, Wifi, Globe, CheckCircle2 } from "lucide-react";
import { zenAudioEngine } from "../audio/ZenAudio";

const SAMPLE_FILES = [
  { name: "4K_Cinematic_Footage.mov", size: "4.8 GB", chunks: 76800 },
  { name: "Family_Photos_RAW_2026.zip", size: "18.2 GB", chunks: 291200 },
  { name: "Sovereign_Database_Backup.tar", size: "2.1 GB", chunks: 33600 },
];

export function LiveTransferSimulatorSection() {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [progress, setProgress] = useState(48);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<"lan" | "wan">("lan");

  const currentFile = SAMPLE_FILES[selectedFileIdx];
  const isLan = mode === "lan";
  const speed = isLan ? "112.4 MB/s" : "14.2 MB/s";
  const latency = isLan ? "0.2ms" : "28ms";

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          zenAudioEngine.playChime(880);
          return 0;
        }
        return prev + (isLan ? 3 : 1);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isPaused, isLan]);

  const togglePause = () => {
    setIsPaused((p) => !p);
    zenAudioEngine.playChime(isPaused ? 523 : 392);
  };

  const switchFile = () => {
    setSelectedFileIdx((prev) => (prev + 1) % SAMPLE_FILES.length);
    setProgress(0);
    zenAudioEngine.playChime(659);
  };

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-12 border-t border-white/10 bg-ink/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-mesh/30 bg-emerald-mesh/10 text-emerald-mesh font-mono text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Simulated Line-Rate Transfer
          </h2>
          <p className="text-base sm:text-lg text-fog">
            Test the live throughput physics between local Gigabit Wi-Fi and remote encrypted relays.
          </p>
        </div>

        <GlassCard className="p-8 sm:p-10 border border-white/15 max-w-4xl mx-auto space-y-8 shadow-2xl">
          {/* Top Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-mesh">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base">
                  {currentFile.name}
                </h4>
                <p className="font-mono text-xs text-fog">
                  {currentFile.size} • {currentFile.chunks.toLocaleString()} chunks (64KB)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode(isLan ? "wan" : "lan")}
                className={`px-3 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  isLan
                    ? "bg-teal-500/15 border-teal-500/30 text-teal-300"
                    : "bg-purple-500/15 border-purple-500/30 text-purple-300"
                }`}
              >
                {isLan ? <Wifi className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                <span>{isLan ? "LAN (Gigabit)" : "WAN Relay"}</span>
              </button>

              <button
                onClick={switchFile}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-fog hover:text-white transition cursor-pointer"
                title="Switch File"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePause}
                className="px-3 py-1.5 rounded-xl bg-cyan-mesh/15 hover:bg-cyan-mesh/25 border border-cyan-mesh/30 text-cyan-mesh font-mono text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>
            </div>
          </div>

          {/* Transfer Visual Track with Moving File Icon (Item 32) */}
          <div className="relative py-8">
            <div className="flex items-center justify-between mb-8">
              {/* Sender Device */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-cyan-mesh/10 border border-cyan-mesh/30 flex items-center justify-center text-cyan-mesh shadow-lg">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs text-white">Sender: Pixel 9</span>
              </div>

              {/* Moving File Packet along track */}
              <div className="flex-1 mx-6 relative h-2 bg-white/10 rounded-full overflow-visible">
                {/* Progress bar fill */}
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    isLan ? "bg-gradient-to-r from-cyan-mesh to-emerald-mesh" : "bg-purple-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />

                {/* Floating moving file packet icon */}
                <motion.div
                  className="absolute -top-4 -translate-x-1/2 p-1.5 rounded-lg bg-card border border-white/20 text-cyan-mesh shadow-md"
                  style={{ left: `${progress}%` }}
                >
                  <FileCode className="w-4 h-4" />
                </motion.div>
              </div>

              {/* Receiver Device */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-mesh/10 border border-emerald-mesh/30 flex items-center justify-center text-emerald-mesh shadow-lg">
                  <Laptop className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs text-white">Target: PC Array</span>
              </div>
            </div>

            {/* Live Readouts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-ink/70 border border-white/10 font-mono text-xs">
              <div>
                <span className="text-[10px] text-fog uppercase">Live Throughput</span>
                <p className="text-sm font-bold text-emerald-mesh">{speed}</p>
              </div>
              <div>
                <span className="text-[10px] text-fog uppercase">Network RTT</span>
                <p className="text-sm font-bold text-cyan-mesh">{latency}</p>
              </div>
              <div>
                <span className="text-[10px] text-fog uppercase">Transfer Progress</span>
                <p className="text-sm font-bold text-white">{progress}%</p>
              </div>
              <div>
                <span className="text-[10px] text-fog uppercase">Chunk Integrity</span>
                <p className="text-sm font-bold text-indigo-mesh">SHA-256 OK</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
