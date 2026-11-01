import { useState, useRef, type DragEvent, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { UploadCloud, FolderPlus, Plus } from "lucide-react";
import { TOKENS } from "../../tokens";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesSelected, disabled = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { duration, ease } = TOKENS.motion;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      onFilesSelected(selected);
      // reset so same files can be chosen again if needed
      e.target.value = "";
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload files by dragging and dropping or clicking to browse"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={disabled ? {} : { scale: 1.005 }}
      whileTap={disabled ? {} : { scale: 0.995 }}
      transition={{ duration: duration.fast, ease: ease.standard }}
      className={`relative w-full rounded-xl border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899] ${
        disabled
          ? "opacity-50 cursor-not-allowed border-[#343934] bg-[#1B1D1B]"
          : isDragOver
          ? "border-[#A3B899] bg-[#252825] shadow-[0_0_24px_rgba(163,184,153,0.15)]"
          : "border-[#343934] bg-[#1B1D1B] hover:border-[#414741] hover:bg-[#252825]/60"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Upload Icon with sage accent on hover/drag */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center border transition-colors ${
            isDragOver
              ? "border-[#A3B899] bg-[#A3B899]/10 text-[#A3B899]"
              : "border-[#343934] bg-[#252825] text-[#929690] group-hover:text-[#F2F3F0]"
          }`}
        >
          {isDragOver ? (
            <FolderPlus className="w-6 h-6 animate-bounce" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-1.5 max-w-sm mx-auto">
          <p className="font-display font-medium text-base text-[#F2F3F0]">
            Drop files here to transfer
          </p>
          <p className="text-xs text-[#929690] leading-relaxed">
            Drag documents, photos, 4K videos, or folders, or{" "}
            <span className="text-[#A3B899] underline underline-offset-2 font-medium">
              browse local disk
            </span>
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0C0D0C] border border-[#343934] text-[11px] font-mono text-[#929690]">
          <Plus className="w-3 h-3 text-[#A3B899]" />
          <span>Multi-file streaming enabled</span>
        </div>
      </div>
    </motion.div>
  );
}
