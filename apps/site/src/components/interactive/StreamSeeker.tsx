import { useState } from "react";
import { Play, Pause, Disc3, CheckCircle2 } from "lucide-react";
import { zenAudioEngine } from "../audio/ZenAudio";

export function StreamSeeker() {
  const TOTAL_SIZE = 524288000; // 500 MB in bytes
  const CHUNK_SIZE = 65536; // 64 KB chunk

  const [offset, setOffset] = useState(TOTAL_SIZE * 0.42); // start at 42%
  const [isPlaying, setIsPlaying] = useState(true);
  const [transport, setTransport] = useState<"lan" | "wan">("lan");

  const currentMb = (offset / (1024 * 1024)).toFixed(1);
  const totalMb = (TOTAL_SIZE / (1024 * 1024)).toFixed(0);
  const percentage = ((offset / TOTAL_SIZE) * 100).toFixed(1);

  const rangeStart = Math.floor(offset);
  const rangeEnd = Math.min(rangeStart + CHUNK_SIZE - 1, TOTAL_SIZE - 1);

  const handleSeek = (val: number) => {
    setOffset(val);
    zenAudioEngine.playChime(330 + (val / TOTAL_SIZE) * 440);
  };

  return (
    <div className="kage-card rounded-3xl p-6 md:p-8">
      {/* Header & Transport Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vermilion/20 text-vermilion">
            <Disc3 className={`h-5 w-5 ${isPlaying ? "animate-spin" : ""}`} />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-snow">
              FileProto Range Streaming Simulator
            </h4>
            <p className="font-mono text-[11px] text-fog">
              Sub-millisecond HTTP 206 Partial Content Seek
            </p>
          </div>
        </div>

        {/* Transport Toggle */}
        <div className="flex items-center rounded-xl border border-line bg-ink/80 p-1 text-xs font-mono">
          <button
            onClick={() => setTransport("lan")}
            className={`rounded-lg px-3 py-1 transition ${
              transport === "lan"
                ? "bg-accent/20 text-accent font-semibold"
                : "text-fog hover:text-snow"
            }`}
          >
            LAN (Direct HTTP:8743)
          </button>
          <button
            onClick={() => setTransport("wan")}
            className={`rounded-lg px-3 py-1 transition ${
              transport === "wan"
                ? "bg-cyan-mesh/20 text-cyan-mesh font-semibold"
                : "text-fog hover:text-snow"
            }`}
          >
            WAN (WebRTC DTLS)
          </button>
        </div>
      </div>

      {/* Media Scrubber */}
      <div className="my-8">
        <div className="flex items-center justify-between font-mono text-xs text-fog">
          <span>0 MB</span>
          <span className="text-amber font-bold">
            {currentMb} MB / {totalMb} MB ({percentage}%)
          </span>
          <span>{totalMb} MB</span>
        </div>

        <input
          type="range"
          min={0}
          max={TOTAL_SIZE}
          step={CHUNK_SIZE}
          value={offset}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="mt-3 h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-card/90 accent-vermilion focus:outline-none"
        />

        {/* Quick seek presets */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 0.25, 0.5, 0.75, 0.95].map((p) => (
            <button
              key={p}
              onClick={() => handleSeek(TOTAL_SIZE * p)}
              className="rounded-lg border border-line bg-ink/60 px-2.5 py-1 font-mono text-xs text-fog transition hover:border-white/20 hover:text-snow"
            >
              Seek {Math.round(p * 100)}%
            </button>
          ))}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1 text-xs font-mono text-snow hover:bg-white/5"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? "Pause Stream" : "Resume Stream"}</span>
          </button>
        </div>
      </div>

      {/* Protocol Packet Inspector */}
      <div className="grid gap-4 rounded-2xl border border-line bg-ink/90 p-5 font-mono text-xs md:grid-cols-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-fog">
            Client Request Headers
          </span>
          <div className="mt-2 space-y-1 text-fog">
            <p className="text-snow">GET /api/read?path=video_4k.mp4</p>
            <p className="text-amber">
              Range: bytes={rangeStart}-{rangeEnd}
            </p>
            <p>Accept-Encoding: identity</p>
            <p>Sec-Mesh-Transport: {transport === "lan" ? "lan_direct" : "webrtc_dtls"}</p>
          </div>
        </div>

        <div className="border-t border-line pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5">
          <span className="text-[10px] uppercase tracking-wider text-fog">
            Device NAS Response
          </span>
          <div className="mt-2 space-y-1 text-fog">
            <p className="text-accent font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> HTTP/1.1 206 Partial Content
            </p>
            <p className="text-cyan-mesh">
              Content-Range: bytes {rangeStart}-{rangeEnd}/{TOTAL_SIZE}
            </p>
            <p>Content-Length: {CHUNK_SIZE}</p>
            <p className="text-emerald-400">Seek Latency: &lt; 0.8ms (Zero VPS Egress)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
