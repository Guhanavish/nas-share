import { useEffect, useState } from "react";
import { Terminal, Copy, Check, Play } from "lucide-react";
import { zenAudioEngine } from "../audio/ZenAudio";

const COMMANDS = [
  "# Step 1: Install portable desktop node or run universal APK",
  "curl -fsSL https://nasend.vercel.app/install.sh | bash",
  "# Step 2: Discover and pair nodes with single Crockford token",
  "nasend pair --rune K7M2-Q9XD",
  "# Step 3: Stream 4K video or sync folders over Gigabit Wi-Fi",
  "nasend sync ~/Videos/4K_Master/ --target 'Shield TV 4K'",
  "✓ Handshake verified in 84ms. Direct LAN socket listening on :8743.",
];

export function QuickStartTerminal() {
  const [displayedLines, setDisplayedLines] = useState<string[]>(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return COMMANDS;
    }
    return [];
  });
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (currentLineIndex >= COMMANDS.length) return;

    const targetLine = COMMANDS[currentLineIndex];

    if (currentCharIndex < targetLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLineIndex] = targetLine.slice(0, currentCharIndex + 1);
          return next;
        });
        setCurrentCharIndex((prev) => prev + 1);
      }, targetLine.startsWith("#") ? 15 : 28);

      return () => clearTimeout(timeout);
    } else {
      // Completed current line, pause slightly before starting next line
      const linePause = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, targetLine.startsWith("#") ? 200 : 500);

      return () => clearTimeout(linePause);
    }
  }, [currentLineIndex, currentCharIndex]);

  const handleCopyAll = () => {
    const text = COMMANDS.filter((line) => !line.startsWith("#") && !line.startsWith("✓")).join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    zenAudioEngine.playChime(784);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-ink/95 border border-white/15 shadow-2xl overflow-hidden font-mono text-xs backdrop-blur-xl">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-white/20 pl-2">|</span>
          <div className="flex items-center gap-1.5 text-fog text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-cyan-mesh" />
            <span>nasend-terminal-quickstart</span>
          </div>
        </div>

        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-fog hover:text-white transition cursor-pointer text-[11px]"
          title="Copy CLI snippet"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-mesh" />
              <span className="text-emerald-mesh">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Commands</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Body */}
      <div className="p-4 sm:p-5 space-y-2 min-h-[200px] text-snow">
        {displayedLines.map((line, idx) => {
          const isComment = line.startsWith("#");
          const isSuccess = line.startsWith("✓");
          return (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              {!isComment && !isSuccess && (
                <span className="text-cyan-mesh select-none">$</span>
              )}
              <span
                className={
                  isComment
                    ? "text-fog/70 italic"
                    : isSuccess
                    ? "text-emerald-mesh font-medium"
                    : "text-white"
                }
              >
                {line}
              </span>
            </div>
          );
        })}

        {/* Blinking cursor */}
        {currentLineIndex < COMMANDS.length && (
          <span className="inline-block w-2 h-4 bg-cyan-mesh animate-pulse align-middle" />
        )}
      </div>

      {/* Terminal Footer Bar */}
      <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-fog/60">
        <span className="flex items-center gap-1">
          <Play className="w-3 h-3 text-emerald-mesh" />
          <span>Universal Bash / PowerShell / Android Shell</span>
        </span>
        <span>Zero Sudo Required</span>
      </div>
    </div>
  );
}
