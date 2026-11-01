import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { zenAudioEngine } from "../audio/ZenAudio";

export type ThemeMode = "obsidian" | "aurora" | "matrix";

export function ThemePresetToggle() {
  const [theme, setTheme] = useState<ThemeMode>("aurora");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    const modes: ThemeMode[] = ["aurora", "obsidian", "matrix"];
    const next = modes[(modes.indexOf(theme) + 1) % modes.length];
    setTheme(next);
    zenAudioEngine.playChime(next === "aurora" ? 523 : next === "obsidian" ? 440 : 659);
  };

  const labels = {
    aurora: "Aurora Mesh",
    obsidian: "Obsidian Void",
    matrix: "Emerald LAN",
  };

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-mono text-fog hover:text-white transition cursor-pointer select-none"
      title="Cycle visual theme preset with circular atmospheric wipe"
    >
      <Sparkles className="w-3.5 h-3.5 text-cyan-mesh" />
      <span>{labels[theme]}</span>
    </button>
  );
}
