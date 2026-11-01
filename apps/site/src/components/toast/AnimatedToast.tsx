import { motion, AnimatePresence } from "motion/react";
import { Check, Info } from "lucide-react";
import { TOKENS } from "../../tokens";

interface ToastProps {
  message: string | null;
  type?: "copied" | "info";
}

export function AnimatedToast({ message, type = "copied" }: ToastProps) {
  const { duration, ease } = TOKENS.motion;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 inset-x-0 z-[9999] pointer-events-none flex justify-center px-4"
    >
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: duration.button, ease: ease.standard }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1B1D1B] border border-[#343934] text-[#F2F3F0] text-xs font-mono shadow-xl pointer-events-auto select-none"
          >
            <div className="p-1 rounded-md bg-[#252825] text-[#A3B899] border border-[#343934]">
              {type === "copied" ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Info className="w-3.5 h-3.5" />
              )}
            </div>
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
