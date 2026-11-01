import { motion } from "motion/react";
import { formatBytes } from "../../lib/site";
import { Activity, XCircle, Gauge, Clock } from "lucide-react";
import { TOKENS } from "../../tokens";

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
  const { duration, ease } = TOKENS.motion;
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className="w-full p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-6">
      {/* Transfer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#343934]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3B899] opacity-75" />
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
          onClick={onCancel}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#343934] text-xs font-mono text-[#929690] hover:text-[#F2F3F0] hover:border-rose-400 hover:bg-rose-400/10 transition cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Progress Bar: Dark Graphite track + Muted Sage Fill */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#929690]">
            {formatBytes(transferredBytes)} / {formatBytes(totalBytes)}
          </span>
          <span className="text-[#A3B899] font-semibold">{clampedPercent.toFixed(1)}%</span>
        </div>

        <div className="relative h-3 w-full rounded-full bg-[#0C0D0C] border border-[#343934] overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedPercent}%` }}
            transition={{ duration: duration.normal, ease: ease.standard }}
            className="h-full rounded-full bg-[#A3B899] relative"
            style={{ willChange: "width" }}
          >
            {/* Subtle light particle on leading edge */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-r-full" />
          </motion.div>
        </div>
      </div>

      {/* Realtime Metrics: Speed & ETA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-[#252825] border border-[#343934] space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#929690] uppercase">
            <Gauge className="w-3 h-3 text-[#A3B899]" />
            <span>Speed</span>
          </div>
          <p className="text-xs font-mono font-medium text-[#F2F3F0]">
            {speedMBs.toFixed(1)} MB/s
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#252825] border border-[#343934] space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#929690] uppercase">
            <Clock className="w-3 h-3 text-[#A3B899]" />
            <span>Est. Remaining</span>
          </div>
          <p className="text-xs font-mono font-medium text-[#F2F3F0]">
            {etaSeconds > 0 ? `${etaSeconds.toFixed(1)}s` : "< 1s"}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-lg bg-[#252825] border border-[#343934] space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#929690] uppercase">
            <Activity className="w-3 h-3 text-[#A3B899]" />
            <span>Channel</span>
          </div>
          <p className="text-xs font-mono font-medium text-[#F2F3F0] truncate">
            Direct LAN / DTLS 1.3
          </p>
        </div>
      </div>
    </div>
  );
}
