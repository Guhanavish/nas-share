import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, Sparkles } from "lucide-react";
import { zenAudioEngine } from "../audio/ZenAudio";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getRandomCode() {
  let res = "";
  for (let i = 0; i < 8; i++) {
    res += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return res;
}

export function FlippingPairingCode({ onCopy }: { onCopy?: (code: string) => void }) {
  const [code, setCode] = useState("K7M2Q9XD");
  const [copied, setCopied] = useState(false);
  const [rolling, setRolling] = useState(false);

  const rollNewCode = () => {
    if (rolling) return;
    setRolling(true);
    zenAudioEngine.playChime(523.25);
    const newCode = getRandomCode();
    setCode(newCode);
    setTimeout(() => {
      setRolling(false);
      zenAudioEngine.playChime(659.25);
    }, 800);
  };

  const handleCopy = () => {
    const formatted = `${code.slice(0, 4)}-${code.slice(4)}`;
    navigator.clipboard.writeText(formatted).catch(() => {});
    setCopied(true);
    zenAudioEngine.playChime(880);
    onCopy?.(formatted);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-ink/80 border border-white/10 backdrop-blur-xl shadow-2xl">
        {code.split("").map((char, index) => (
          <div key={index} className="flex items-center">
            {index === 4 && (
              <span className="text-fog/40 font-mono text-lg font-bold px-1 select-none">
                -
              </span>
            )}
            <div
              className="relative w-8 h-10 sm:w-10 sm:h-12 rounded-xl bg-card/80 border border-white/15 flex items-center justify-center overflow-hidden shadow-inner perspective-[600px]"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={`${index}-${char}`}
                  initial={{ rotateX: -90, opacity: 0, y: -10 }}
                  animate={{ rotateX: 0, opacity: 1, y: 0 }}
                  exit={{ rotateX: 90, opacity: 0, y: 10 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: index * 0.06,
                  }}
                  className="font-mono text-lg sm:text-xl font-black text-cyan-mesh select-none"
                >
                  {char}
                </motion.span>
              </AnimatePresence>
              {/* Highlight specular line */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/25" />
            </div>
          </div>
        ))}

        <div className="flex items-center gap-1 pl-2 border-l border-white/10">
          <button
            onClick={rollNewCode}
            disabled={rolling}
            className="p-2 sm:p-2.5 rounded-xl hover:bg-white/10 text-fog hover:text-white transition cursor-pointer disabled:opacity-50"
            title="Roll New Crockford Code"
          >
            <Sparkles className={`w-4 h-4 text-amber-mesh ${rolling ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleCopy}
            className="p-2 sm:p-2.5 rounded-xl bg-cyan-mesh/10 hover:bg-cyan-mesh/20 text-cyan-mesh border border-cyan-mesh/30 transition cursor-pointer flex items-center gap-1"
            title="Copy 8-Rune Code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-mesh" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono text-fog">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-mesh animate-pulse" />
        <span>Crockford Base32 • Zero Ambiguity (No 0/O, 1/I/L)</span>
      </div>
    </div>
  );
}
