import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Download, RefreshCw, FileCheck } from "lucide-react";
import { CountUpNumber } from "../glass/CountUpNumber";
import { formatBytes } from "../../lib/site";
import { TOKENS } from "../../tokens";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

interface TransferCompleteProps {
  files: { name: string; size: number; url?: string }[];
  mode: "send" | "receive";
  onReset: () => void;
}

export function TransferComplete({ files, mode: _mode, onReset }: TransferCompleteProps) {
  const { duration, ease } = TOKENS.motion;
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const totalMB = totalBytes / (1024 * 1024);
  const reduced = usePrefersReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Focus completion heading on mount for assistive tech (T10.4)
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: duration.normal, ease: ease.standard }}
      className="w-full p-8 rounded-xl border border-[#343934] bg-[#1B1D1B] text-center space-y-6"
    >
      {/* Circle draws (0.4s), then check draws (0.25s) in SVG */}
      <div className="flex justify-center">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <svg viewBox="0 0 64 64" className="w-16 h-16" fill="none">
            {/* Background circle track */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#252825"
              strokeWidth="2"
            />
            {/* Animated circle stroke */}
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="#A3B899"
              strokeWidth="2"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: ease.standard }}
            />
            {/* Animated check path */}
            <motion.path
              d="M 21 33 L 29 41 L 44 23"
              stroke="#A3B899"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, delay: reduced ? 0 : 0.4, ease: ease.standard }}
            />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl font-semibold tracking-tight text-[#F2F3F0] outline-none"
        >
          Demo complete: {files.length} {files.length === 1 ? "file" : "files"}. Nothing was sent.
        </h3>
        <p className="text-xs text-[#929690] max-w-md mx-auto">
          Simulated browser transfer completed. Use the Android or Windows app to transfer real files across your devices.
        </p>

        {/* CountUpNumber for file count and size */}
        <div className="text-xs font-mono text-[#929690] flex items-center justify-center gap-1.5 flex-wrap pt-2">
          <CountUpNumber
            end={files.length}
            duration={600}
            className="text-[#F2F3F0] font-semibold"
          />
          <span>{files.length === 1 ? "item simulated" : "items simulated"}</span>
          <span>•</span>
          <span>
            {totalMB >= 1 ? (
              <span className="flex items-center gap-1">
                <CountUpNumber
                  end={totalMB}
                  decimals={1}
                  duration={600}
                  className="text-[#F2F3F0] font-semibold"
                />
                <span>MB payload</span>
              </span>
            ) : (
              <span>{formatBytes(totalBytes)} payload</span>
            )}
          </span>
        </div>
      </div>

      {/* File summary list */}
      <div className="max-w-md mx-auto space-y-2 text-left max-h-48 overflow-y-auto pr-1">
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-[#252825] border border-[#343934] text-xs font-mono"
          >
            <div className="flex items-center gap-2.5 truncate pr-2">
              <FileCheck className="w-4 h-4 text-[#A3B899] shrink-0" />
              <span className="text-[#F2F3F0] truncate">{file.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[#929690]">{formatBytes(file.size)}</span>
              {file.url && (
                <a
                  href={file.url}
                  download={file.name}
                  className="flex items-center gap-1 text-[#A3B899] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A3B899]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#A3B899] text-[#0C0D0C] font-mono font-medium text-xs hover:bg-[#B5C8AC] active:translate-y-px transition cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>
      </div>
    </motion.div>
  );
}
