import { useState, useEffect } from "react";
import { formatBytes } from "../../lib/site";
import { Activity, XCircle, Gauge, Clock } from "lucide-react";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

interface TransferProgressProps {
  currentFileName: string;
  currentFileIndex: number;
  totalFiles: number;
  transferredBytes: number;
  totalBytes: number;
  speedMBs: number;
  etaSeconds: number;
  percent: number;
  onCancel: () => void;
}

export function TransferProgress({
  currentFileName,
  currentFileIndex,
  totalFiles,
  transferredBytes,
  totalBytes,
  speedMBs,
  etaSeconds,
  percent,
  onCancel,
}: TransferProgressProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const normalizedProgress = clampedPercent / 100;
  const reduced = usePrefersReducedMotion();

  // Item 22: 24 segmented cells
  const CELL_COUNT = 24;
  const totalChunks = Math.max(1, Math.round(totalBytes / (64 * 1024)));
  const currentChunks = Math.min(totalChunks, Math.round(normalizedProgress * totalChunks));

  // Item 25: Live speed sparkline (last 40 samples, 28px tall inline SVG polyline, updated every 250ms)
  const [speedSamples, setSpeedSamples] = useState<number[]>(() =>
    Array.from({ length: 40 }, () => speedMBs + (Math.random() * 4 - 2))
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSpeedSamples((prev) => {
        const jitter = (Math.random() - 0.5) * 6;
        const nextSpeed = Math.max(0, speedMBs + jitter);
        return [...prev.slice(1), nextSpeed];
      });
    }, 250);

    return () => window.clearInterval(interval);
  }, [speedMBs]);

  // Compute polyline points for 28px height, 160px width
  const minSpeed = Math.min(...speedSamples, 80);
  const maxSpeed = Math.max(...speedSamples, 140);
  const speedRange = Math.max(maxSpeed - minSpeed, 1);
  const polylinePoints = speedSamples
    .map((val, i) => {
      const x = (i / (speedSamples.length - 1)) * 160;
      const y = 28 - ((val - minSpeed) / speedRange) * 24 - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="w-full p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-6">
      {/* Transfer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#343934]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3B899] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A3B899]" />
            </span>
            <span className="font-mono text-xs text-[#A3B899] uppercase tracking-wider">
              Transferring payload
            </span>
            <span className="text-[11px] font-mono text-[#929690]">
              ({currentFileIndex + 1} of {totalFiles})
            </span>
          </div>
          <p className="text-sm font-medium text-[#F2F3F0] truncate max-w-md" title={currentFileName}>
            {currentFileName}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#343934] text-xs font-mono text-[#929690] hover:text-[#F2F3F0] hover:border-rose-400 hover:bg-rose-400/10 active:translate-y-px transition cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Item 22: Segmented Chunk Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#929690]">
            {formatBytes(transferredBytes)} / {formatBytes(totalBytes)} • {currentChunks} / {totalChunks} chunks
          </span>
          <span className="text-[#A3B899] font-semibold">{clampedPercent.toFixed(1)}%</span>
        </div>

        {/* 24 Segmented Cells */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(clampedPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="grid grid-cols-24 gap-1 w-full bg-[#0C0D0C] p-1 rounded-lg border border-[#343934]"
        >
          {Array.from({ length: CELL_COUNT }).map((_, i) => {
            const cellFill = Math.min(Math.max(normalizedProgress * CELL_COUNT - i, 0), 1);

            return (
              <div
                key={i}
                className="h-3 bg-[#1B1D1B] rounded-[2px] overflow-hidden"
              >
                <div
                  className="h-full bg-[#A3B899] origin-left"
                  style={{
                    transform: `scaleX(${cellFill})`,
                    transition: reduced ? "none" : "transform 120ms linear",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Item 25: Realtime Metrics + Sparkline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Speed with Sparkline */}
        <div className="p-3 rounded-lg bg-[#252825] border border-[#343934] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#929690] uppercase">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3 h-3 text-[#A3B899]" />
              <span>Speed (simulated)</span>
            </span>
            <span className="text-[#F2F3F0] font-semibold">{speedMBs.toFixed(1)} MB/s</span>
          </div>

          {/* 28px Sparkline */}
          <div className="h-7 w-full overflow-hidden">
            <svg viewBox="0 0 160 28" className="w-full h-full" fill="none">
              <polyline
                fill="none"
                stroke="#A3B899"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
            </svg>
          </div>
        </div>

        {/* ETA */}
        <div className="p-3 rounded-lg bg-[#252825] border border-[#343934] space-y-1 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#929690] uppercase">
            <Clock className="w-3 h-3 text-[#A3B899]" />
            <span>Est. Remaining</span>
          </div>
          <p className="text-sm font-mono font-medium text-[#F2F3F0]">
            {etaSeconds > 0 ? `${etaSeconds.toFixed(1)}s` : "< 1s"}
          </p>
          <span className="text-[10px] font-mono text-[#929690]">64 KB sliding window</span>
        </div>

        {/* Channel info */}
        <div className="p-3 rounded-lg bg-[#252825] border border-[#343934] space-y-1 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#929690] uppercase">
            <Activity className="w-3 h-3 text-[#A3B899]" />
            <span>Channel</span>
          </div>
          <p className="text-xs font-mono font-medium text-[#F2F3F0] truncate">
            Direct LAN / DTLS
          </p>
          <span className="text-[10px] font-mono text-[#929690]">Zero server storage</span>
        </div>
      </div>
    </div>
  );
}
