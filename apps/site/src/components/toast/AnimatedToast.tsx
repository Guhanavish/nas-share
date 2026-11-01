import { motion, AnimatePresence } from "motion/react";
import { Check, Copy } from "lucide-react";

interface ToastProps {
  message: string | null;
  type?: "copied" | "info";
}

export function AnimatedToast({ message, type = "copied" }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-ink/95 border border-cyan-mesh/40 text-snow text-xs font-mono shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(56,189,248,0.25)] backdrop-blur-2xl"
          >
            <div className="p-1 rounded-lg bg-emerald-mesh/20 text-emerald-mesh">
              {type === "copied" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </div>
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
