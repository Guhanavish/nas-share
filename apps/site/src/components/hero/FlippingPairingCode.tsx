import { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { Copy, Check } from "lucide-react";
import { TOKENS } from "../../tokens";
import { CodeExpiryRing } from "../motion/CodeExpiryRing";
import { useToast } from "../toast/ToastProvider";
import { useActive } from "../../lib/useActive";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

function getRandomCode(): string {
  const alphabet = TOKENS.brand.crockfordAlphabet;
  let res = "";
  for (let i = 0; i < 8; i++) {
    res += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${res.slice(0, 4)}-${res.slice(4)}`;
}

export function FlippingPairingCode({
  onCopy,
  showNewCodeButton = false,
}: {
  onCopy?: (code: string) => void;
  showNewCodeButton?: boolean;
}) {
  const [code, setCode] = useState<string>("K7M2-Q9XD");
  const [copied, setCopied] = useState(false);
  const [flipKey, setFlipKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isActive = useActive(containerRef);
  const reduced = usePrefersReducedMotion();
  const { toast } = useToast();

  const handleExpire = useCallback(() => {
    setCode(getRandomCode());
    setFlipKey((k) => k + 1);
  }, []);

  const handleRollNew = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleExpire();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    toast(`Copied ${code} to clipboard`);
    onCopy?.(code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleCopy}
      className="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#1B1D1B] border border-[#343934] text-xs font-mono text-[#929690] cursor-pointer hover:border-[#414741] hover:bg-[#252825] transition select-none group"
      title="Click to copy pairing code (single-use, 5m expiry)"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCopy();
        }
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#929690] uppercase tracking-wider">Example code:</span>
        <div className="flex items-center gap-0.5">
          {code.split("").map((char, index) => (
            <span key={index} className="inline-block perspective-[400px]">
              {char === "-" ? (
                <span className="text-[#929690] mx-0.5 font-bold">-</span>
              ) : (
                <motion.span
                  key={`${flipKey}-${index}-${char}`}
                  initial={reduced ? false : { rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{
                    duration: 0.28,
                    delay: index * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block text-[#A3B899] font-bold tracking-wider"
                >
                  {char}
                </motion.span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* 16px SVG countdown ring + copy icon */}
      <div className="flex items-center gap-1.5 pl-2 border-l border-[#343934]">
        <CodeExpiryRing
          durationMs={300000} // 5m
          running={isActive}
          onExpire={handleExpire}
          size={16}
          strokeWidth={2}
        />
        {copied ? (
          <Check className="w-3.5 h-3.5 text-[#A3B899]" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-[#929690] group-hover:text-[#F2F3F0] transition" />
        )}
      </div>

      {showNewCodeButton && (
        <button
          type="button"
          onClick={handleRollNew}
          className="text-[10px] font-mono text-[#929690] hover:text-[#A3B899] underline underline-offset-2 transition cursor-pointer pl-2 border-l border-[#343934]"
          title="Generate a new example code"
        >
          New code
        </button>
      )}
    </div>
  );
}
