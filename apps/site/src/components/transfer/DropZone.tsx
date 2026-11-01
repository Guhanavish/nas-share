import { useState, useRef, type DragEvent, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { UploadCloud, FolderPlus, Plus } from "lucide-react";
import { TOKENS } from "../../tokens";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesSelected, disabled = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reduced = usePrefersReducedMotion();
  const { duration, ease } = TOKENS.motion;

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);

    if (disabled) return;

    // Item 20: Solid sage border flash for 200ms on drop
    setJustDropped(true);
    setTimeout(() => setJustDropped(false), 200);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      onFilesSelected(selected);
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
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={disabled ? {} : { scale: 1.003 }}
      whileTap={disabled ? {} : { scale: 0.997 }}
      transition={{ duration: duration.fast, ease: ease.standard }}
      className={`relative w-full rounded-xl p-8 sm:p-10 text-center transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899] overflow-hidden ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-[#1B1D1B] border border-[#343934]"
          : justDropped
          ? "bg-[#252825] border-2 border-[#A3B899]"
          : isDragOver
          ? "bg-[#252825] border-transparent"
          : "bg-[#1B1D1B] border border-[#343934] hover:border-[#414741] hover:bg-[#252825]/60"
      }`}
    >
      {/* Item 20: Animated Dashed Sage SVG Rect Overlay when Dragging */}
      {isDragOver && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none rounded-xl"
          fill="none"
        >
          <rect
            x="1.5"
            y="1.5"
            width="calc(100% - 3px)"
            height="calc(100% - 3px)"
            rx="10"
            stroke="#A3B899"
            strokeWidth="2"
            strokeDasharray={reduced ? "none" : "6 6"}
            className={reduced ? "" : "motion-safe:animate-[dash_0.8s_linear_infinite]"}
            style={{
              strokeDashoffset: reduced ? 0 : undefined,
            }}
          />
        </svg>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
        {/* Upload Icon: Lifts 4px on drag-over (Item 20) */}
        <motion.div
          animate={{ y: isDragOver ? -4 : 0 }}
          transition={{ duration: duration.fast, ease: ease.standard }}
          className={`w-14 h-14 rounded-full flex items-center justify-center border transition-colors ${
            isDragOver
              ? "border-[#A3B899] bg-[#A3B899]/10 text-[#A3B899]"
              : "border-[#343934] bg-[#252825] text-[#929690] group-hover:text-[#F2F3F0]"
          }`}
        >
          {isDragOver ? (
            <FolderPlus className="w-6 h-6 text-[#A3B899]" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </motion.div>

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
