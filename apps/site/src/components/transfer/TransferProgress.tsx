import { formatBytes } from "../../lib/site";
import { Activity, XCircle, HardDrive, CheckCircle2 } from "lucide-react";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

interface TransferProgressProps {
  currentFileName: string;
  currentFileIndex: number;
  totalFiles: number;
  transferredBytes: number;
  totalBytes: number;
  percent: number;
  onCancel: () => void;
}

export function TransferProgress({
  currentFileName,
  currentFileIndex,
  totalFiles,
  transferredBytes,
  totalBytes,
  percent,
  onCancel,
}: TransferProgressProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const normalizedProgress = clampedPercent / 100;
  const reduced = usePrefersReducedMotion();

  // 24 segmented cells
  const CELL_COUNT = 24;
  const totalChunks = Math.max(1, Math.round(totalBytes / (64 * 1024)));
  const currentChunks = Math.min(totalChunks, Math.round(normalizedProgress * totalChunks));

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
              Simulated transfer
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
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#343934] text-xs font-mono text-[#929690] hover:text-[#F2F3F0] hover:border-rose-400 hover:bg-rose-400/10 active:translate-y-px transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899]"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Segmented Chunk Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#929690]">
            {formatBytes(transferredBytes)} / {formatBytes(totalBytes)} • {currentChunks} / {totalChunks} chunks
          </span>
          <span className="text-[#A3B899] font-semibold">{clampedPercent.toFixed(0)}%</span>
        </div>

        {/* 24 Segmented Cells */}
        <div
          role="progressbar"
          aria-label="Transfer progress"
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

      {/* Honest Transfer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-[#252825] border border-[#343934] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#929690] uppercase">
            <HardDrive className="w-3.5 h-3.5 text-[#A3B899]" />
            <span>Transferred</span>
          </div>
          <p className="text-sm font-mono font-medium text-[#F2F3F0]">
            {formatBytes(transferredBytes)}
          </p>
          <span className="text-[11px] font-mono text-[#929690]">Total: {formatBytes(totalBytes)}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#252825] border border-[#343934] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#929690] uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#A3B899]" />
            <span>Status</span>
          </div>
          <p className="text-sm font-mono font-medium text-[#F2F3F0]">
            Simulated
          </p>
          <span className="text-[11px] font-mono text-[#929690]">No network packets</span>
        </div>

        <div className="p-3 rounded-lg bg-[#252825] border border-[#343934] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#929690] uppercase">
            <Activity className="w-3.5 h-3.5 text-[#A3B899]" />
            <span>Channel</span>
          </div>
          <p className="text-xs font-mono font-medium text-[#F2F3F0] truncate">
            In-Browser Demo
          </p>
          <span className="text-[11px] font-mono text-[#929690]">Zero server storage</span>
        </div>
      </div>
    </div>
  );
}
