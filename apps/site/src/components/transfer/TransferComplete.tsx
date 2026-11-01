import { motion } from "motion/react";
import { Check, Download, RefreshCw, FileCheck } from "lucide-react";
import { formatBytes } from "../../lib/site";
import { TOKENS } from "../../tokens";

interface TransferCompleteProps {
  files: { name: string; size: number; url?: string }[];
  mode: "send" | "receive";
  onReset: () => void;
}

export function TransferComplete({ files, mode, onReset }: TransferCompleteProps) {
  const { duration, ease } = TOKENS.motion;
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: duration.normal, ease: ease.standard }}
      className="w-full p-8 rounded-xl border border-[#343934] bg-[#1B1D1B] text-center space-y-6"
    >
      {/* Animated Checkmark in Sage Accent */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-[#A3B899]/10 border-2 border-[#A3B899] flex items-center justify-center text-[#A3B899]"
        >
          <Check className="w-8 h-8 stroke-[2.5]" />
        </motion.div>
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-[#F2F3F0]">
          {mode === "send" ? "Files Transferred Successfully" : "Files Received Successfully"}
        </h3>
        <p className="text-xs font-mono text-[#929690]">
          {files.length} {files.length === 1 ? "item" : "items"} ({formatBytes(totalBytes)}) moved directly with verified hash integrity.
        </p>
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
                  className="flex items-center gap-1 text-[#A3B899] hover:underline"
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
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#A3B899] text-[#0C0D0C] font-mono font-medium text-xs hover:bg-[#B5C8AC] active:translate-y-[1px] transition cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Start New Transfer</span>
        </button>
      </div>
    </motion.div>
  );
}
