import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  FileVideo,
  FileAudio,
  FileImage,
  FileArchive,
  File as GenericFile,
  X,
  HardDrive,
} from "lucide-react";
import { formatBytes } from "../../lib/site";
import { TOKENS } from "../../tokens";

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "mp4":
    case "mkv":
    case "mov":
    case "avi":
    case "webm":
      return <FileVideo className="w-4 h-4 text-[#A3B899]" />;
    case "mp3":
    case "flac":
    case "wav":
    case "aac":
    case "m4a":
      return <FileAudio className="w-4 h-4 text-[#A3B899]" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
    case "webp":
    case "gif":
      return <FileImage className="w-4 h-4 text-[#A3B899]" />;
    case "zip":
    case "tar":
    case "gz":
    case "7z":
    case "rar":
      return <FileArchive className="w-4 h-4 text-[#A3B899]" />;
    case "pdf":
    case "txt":
    case "md":
    case "json":
    case "csv":
      return <FileText className="w-4 h-4 text-[#A3B899]" />;
    default:
      return <GenericFile className="w-4 h-4 text-[#929690]" />;
  }
}

export function FileList({ files, onRemove, onClear }: FileListProps) {
  const { duration, ease } = TOKENS.motion;
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  if (files.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      {/* Summary Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[#929690] px-1">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-[#A3B899]" />
          <span>
            {files.length} {files.length === 1 ? "file" : "files"} staged •{" "}
            <span className="text-[#F2F3F0] font-semibold">{formatBytes(totalSize)}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] text-[#929690] hover:text-[#F2F3F0] transition cursor-pointer underline underline-offset-2"
        >
          Clear all
        </button>
      </div>

      {/* Item 21: File rows with layout animation & stable keys */}
      <ul className="space-y-2 max-h-64 overflow-y-auto pr-1 list-none p-0 m-0">
        <AnimatePresence initial={false}>
          {files.map((file, idx) => {
            const ext = file.name.includes(".") ? file.name.split(".").pop()?.toUpperCase() : "FILE";
            // Stable key based on file metadata
            const stableKey = `${file.name}-${file.size}-${file.lastModified || idx}`;
            const cappedDelay = Math.min(idx, 10) * 0.04;

            return (
              <motion.li
                layout
                key={stableKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{
                  duration: duration.fast,
                  ease: ease.standard,
                  delay: cappedDelay,
                  layout: { duration: 0.2 },
                }}
                className="group flex items-center justify-between p-3 rounded-lg border border-[#343934] bg-[#1B1D1B] hover:border-[#414741] hover:bg-[#252825] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="p-2 rounded bg-[#0C0D0C] border border-[#343934] shrink-0">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#F2F3F0] truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#929690]">
                      <span className="bg-[#0C0D0C] px-1.5 py-0.2 rounded border border-[#343934]/60">
                        {ext}
                      </span>
                      <span>{formatBytes(file.size)}</span>
                    </div>
                  </div>
                </div>

                {/* Remove File Button */}
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="p-1.5 rounded text-[#929690] hover:text-[#F2F3F0] hover:bg-[#343934] transition cursor-pointer shrink-0"
                  aria-label={`Remove ${file.name}`}
                  title="Remove from queue"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
