import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";
import { NasendLogo } from "../components/brand/NasendLogo";
import { PhoneIcon, PcIcon, TvIcon } from "../components/brand/DeviceIcons";
import { Download } from "lucide-react";

export function Brand() {
  useMeta({
    title: "Brand Assets & System — Nasend",
    description: "Nasend brand assets, mark geometry, color tokens, and clear-space rules.",
    path: "/brand",
  });

  const downloadSvg = (name: string, content: string) => {
    const blob = new Blob([content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const markSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="6" cy="12" r="3.5" stroke="#38bdf8" stroke-width="1.5"/>
  <circle cx="18" cy="12" r="3.5" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="9.5" y1="12" x2="14.5" y2="12" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-12">
      <Breadcrumbs trail={[{ label: "Brand System" }]} />

      <div className="space-y-4">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
          Brand Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f0f6fc]">
          Brand System
        </h1>
        <p className="text-base text-[#8b949e] leading-relaxed max-w-2xl">
          Guidelines and downloadable assets for the Nasend ecosystem.
        </p>
      </div>

      {/* Brand Voice Guide (Item 7) */}
      <div className="p-4 rounded border border-[#30363d] bg-[#161b22] space-y-1 text-xs">
        <span className="font-mono text-[10px] uppercase text-[#8b949e] tracking-wider block">
          One-Line Brand Voice Guide
        </span>
        <p className="text-sm font-medium text-[#f0f6fc]">
          Plain, precise, technical, calm.
        </p>
      </div>

      {/* Logo Mark & Wordmark */}
      <section className="space-y-6 border-t border-[#30363d] pt-8">
        <h2 className="text-lg font-medium text-[#f0f6fc]">
          Logo Mark &amp; Wordmark
        </h2>
        <p className="text-xs text-[#8b949e] leading-relaxed max-w-xl">
          The mark consists of two linked peer nodes rendered in single-hue line geometry. The wordmark is set strictly in lowercase with tight letter spacing.
        </p>

        <div className="p-8 rounded border border-[#30363d] bg-[#161b22] flex flex-col sm:flex-row items-center justify-between gap-6">
          <NasendLogo size={28} />

          <button
            onClick={() => downloadSvg("nasend-mark.svg", markSvg)}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#30363d] text-xs font-mono text-[#f0f6fc] hover:bg-[#21262d] transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Download Mark SVG</span>
          </button>
        </div>

        {/* Clear space rule */}
        <div className="p-4 rounded border border-[#30363d] bg-[#0e1117] text-xs space-y-2">
          <span className="font-mono font-medium text-[#f0f6fc] block">
            Clear-space rule
          </span>
          <p className="text-[#8b949e] leading-relaxed">
            Maintain a minimum clear margin equal to 1x the diameter of a single node circle around all four edges of the mark. Do not skew, add drop shadows, or apply gradients to the glyph.
          </p>
        </div>
      </section>

      {/* Color Palette */}
      <section className="space-y-6 border-t border-[#30363d] pt-8">
        <h2 className="text-lg font-medium text-[#f0f6fc]">
          Color System
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded border border-[#30363d] bg-[#0e1117] space-y-1">
            <span className="text-[#8b949e] text-[10px] block">Base</span>
            <span className="text-[#f0f6fc] font-semibold">#0E1117</span>
          </div>
          <div className="p-3 rounded border border-[#30363d] bg-[#161b22] space-y-1">
            <span className="text-[#8b949e] text-[10px] block">Subtle</span>
            <span className="text-[#f0f6fc] font-semibold">#161B22</span>
          </div>
          <div className="p-3 rounded border border-[#30363d] bg-[#21262d] space-y-1">
            <span className="text-[#8b949e] text-[10px] block">Surface</span>
            <span className="text-[#f0f6fc] font-semibold">#21262D</span>
          </div>
          <div className="p-3 rounded border border-[#30363d] bg-[#30363d] space-y-1">
            <span className="text-[#8b949e] text-[10px] block">Hairline</span>
            <span className="text-[#f0f6fc] font-semibold">#30363D</span>
          </div>
          <div className="p-3 rounded border border-[#38bdf8]/40 bg-[#38bdf8]/10 space-y-1">
            <span className="text-[#38bdf8] text-[10px] block">Accent</span>
            <span className="text-[#38bdf8] font-semibold">#38BDF8</span>
          </div>
        </div>
      </section>

      {/* Device Icons Set */}
      <section className="space-y-6 border-t border-[#30363d] pt-8">
        <h2 className="text-lg font-medium text-[#f0f6fc]">
          Device Icon Set (1.5px Hairline)
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded border border-[#30363d] bg-[#161b22] flex flex-col items-center gap-2">
            <PhoneIcon size={24} className="text-[#f0f6fc]" />
            <span className="font-mono text-xs text-[#8b949e]">Phone</span>
          </div>
          <div className="p-4 rounded border border-[#30363d] bg-[#161b22] flex flex-col items-center gap-2">
            <PcIcon size={24} className="text-[#f0f6fc]" />
            <span className="font-mono text-xs text-[#8b949e]">PC</span>
          </div>
          <div className="p-4 rounded border border-[#30363d] bg-[#161b22] flex flex-col items-center gap-2">
            <TvIcon size={24} className="text-[#f0f6fc]" />
            <span className="font-mono text-xs text-[#8b949e]">TV</span>
          </div>
        </div>
      </section>

      <div className="border-t border-[#30363d] pt-6 flex items-center justify-between text-xs font-mono">
        <Link to="/" className="text-[#38bdf8] hover:underline">
          ← Return to Home
        </Link>
        <Link to="/docs" className="text-[#38bdf8] hover:underline">
          Documentation →
        </Link>
      </div>
    </div>
  );
}
