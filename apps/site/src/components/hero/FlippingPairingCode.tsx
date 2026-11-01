import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { Copy, Check } from "lucide-react";
import { TOKENS } from "../../tokens";
import { CodeExpiryRing } from "../motion/CodeExpiryRing";
import { useToast } from "../toast/useToast";
import { useActive } from "../../lib/useActive";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { generateCode } from "../../lib/pairing";

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
  const copyTimeoutRef = useRef<number | null>(null);
  const isActive = useActive(containerRef);
  const reduced = usePrefersReducedMotion();
  const { toast } = useToast();

  const handleExpire = useCallback(() => {
    setCode(generateCode());
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
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={handleCopy}
      className="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#1B1D1B] border border-[#343934] text-xs font-mono text-[#929690] cursor-pointer hover:border-[#414741] hover:bg-[#252825] transition select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899]"
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
      {/* 5-minute animated circular countdown ring */}
      <CodeExpiryRing
        key={flipKey}
        size={18}
        durationMs={300000}
        running={isActive}
        onExpire={handleExpire}
      />

      {/* Characters flip into place with stagger */}
      <div className="flex items-center tracking-widest font-semibold text-[#A3B899]">
        {code.split("").map((char, i) => (
          <span key={`${flipKey}-${i}`} className="inline-block overflow-hidden h-4">
            <motion.span
              className="inline-block"
              initial={reduced ? false : { rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{
                duration: 0.25,
                delay: i * 0.04,
                ease: TOKENS.motion.ease.standard,
              }}
            >
              {char}
            </motion.span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 pl-1 border-l border-[#343934]">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-[#A3B899]" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-[#929690] group-hover:text-[#F2F3F0] transition" />
        )}

        {showNewCodeButton && (
          <button
            type="button"
            onClick={handleRollNew}
            className="ml-1 text-[10px] text-[#929690] hover:text-[#A3B899] underline cursor-pointer"
          >
            New
          </button>
        )}
      </div>
    </div>
  );
}
