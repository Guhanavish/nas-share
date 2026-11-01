import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";
import { NasendLogo } from "../components/brand/NasendLogo";
import { PhoneIcon, PcIcon, TvIcon } from "../components/brand/DeviceIcons";
import { Download } from "lucide-react";

export function Brand() {
  useMeta({
    title: "Brand Assets & System — NASend",
    description: "NASend brand assets, mark geometry, Graphite & Sage design tokens, and clear-space rules.",
    path: "/brand",
  });

  const downloadSvg = (name: string, content: string) => {
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = name;
    a.click();
  };

  const markSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="6" cy="12" r="3.5" stroke="#A3B899" stroke-width="1.5"/>
  <circle cx="18" cy="12" r="3.5" stroke="#A3B899" stroke-width="1.5"/>
  <line x1="9.5" y1="12" x2="14.5" y2="12" stroke="#A3B899" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-12 bg-[#0C0D0C] text-[#F2F3F0]">
      <Breadcrumbs trail={[{ label: "Brand System" }]} />

      <div className="space-y-4">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#929690]">
          Brand Architecture
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F3F0]">
          Brand System — Graphite &amp; Sage
        </h1>
        <p className="text-base text-[#929690] leading-relaxed max-w-2xl font-sans">
          Guidelines and downloadable assets for the NASend device-to-device ecosystem.
        </p>
      </div>

      {/* Brand Voice Guide */}
      <div className="p-5 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-1.5 text-xs">
        <span className="font-mono text-[10px] uppercase text-[#A3B899] tracking-wider block">
          One-Line Brand Voice Guide
        </span>
        <p className="font-display text-base font-medium text-[#F2F3F0]">
          Plain, precise, technical, calm.
        </p>
      </div>

      {/* Logo Mark & Wordmark */}
      <section className="space-y-6 border-t border-[#343934] pt-8">
        <h2 className="font-display text-xl font-semibold text-[#F2F3F0]">
          Logo Mark &amp; Wordmark
        </h2>
        <p className="text-xs text-[#929690] leading-relaxed max-w-xl font-sans">
          The mark consists of two linked peer nodes rendered in single-hue sage line geometry. The wordmark is set strictly in lowercase with custom letter spacing.
        </p>

        <div className="p-8 rounded-xl border border-[#343934] bg-[#1B1D1B] flex flex-col sm:flex-row items-center justify-between gap-6">
          <NasendLogo size={28} />

          <button
            onClick={() => downloadSvg("nasend-mark.svg", markSvg)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#343934] text-xs font-mono text-[#F2F3F0] bg-[#252825] hover:border-[#414741] transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#A3B899]" />
            <span>Download Mark SVG</span>
          </button>
        </div>

        {/* Clear space rule */}
        <div className="p-5 rounded-xl border border-[#343934] bg-[#0C0D0C] text-xs space-y-2">
          <span className="font-mono font-medium text-[#F2F3F0] block">
            Clear-space rule
          </span>
          <p className="text-[#929690] leading-relaxed font-sans">
            Maintain a minimum clear margin equal to 1x the diameter of a single node circle around all four edges of the mark. Do not skew, add drop shadows, or apply gradients to the glyph.
          </p>
        </div>
      </section>

      {/* Color Palette */}
      <section className="space-y-6 border-t border-[#343934] pt-8">
        <h2 className="font-display text-xl font-semibold text-[#F2F3F0]">
          Graphite &amp; Sage Palette (90% Monochrome / 10% Sage)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg border border-[#343934] bg-[#0C0D0C] space-y-1">
            <span className="text-[#929690] text-[10px] block">Primary Bg</span>
            <span className="text-[#F2F3F0] font-semibold">#0C0D0C</span>
          </div>
          <div className="p-3 rounded-lg border border-[#343934] bg-[#1B1D1B] space-y-1">
            <span className="text-[#929690] text-[10px] block">Secondary Surface</span>
            <span className="text-[#F2F3F0] font-semibold">#1B1D1B</span>
          </div>
          <div className="p-3 rounded-lg border border-[#343934] bg-[#252825] space-y-1">
            <span className="text-[#929690] text-[10px] block">Elevated</span>
            <span className="text-[#F2F3F0] font-semibold">#252825</span>
          </div>
          <div className="p-3 rounded-lg border border-[#343934] bg-[#080A08] space-y-1">
            <span className="text-[#929690] text-[10px] block">Subtle Border</span>
            <span className="text-[#F2F3F0] font-semibold">#343934</span>
          </div>
          <div className="p-3 rounded-lg border border-[#A3B899]/40 bg-[#A3B899]/10 space-y-1">
            <span className="text-[#A3B899] text-[10px] block">Sage Accent</span>
            <span className="text-[#A3B899] font-semibold">#A3B899</span>
          </div>
        </div>
      </section>

      {/* Device Icons Set */}
      <section className="space-y-6 border-t border-[#343934] pt-8">
        <h2 className="font-display text-xl font-semibold text-[#F2F3F0]">
          Device Icon Set (1.5px Hairline)
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-5 rounded-xl border border-[#343934] bg-[#1B1D1B] flex flex-col items-center gap-2">
            <PhoneIcon size={24} className="text-[#F2F3F0]" />
            <span className="font-mono text-xs text-[#929690]">Phone</span>
          </div>
          <div className="p-5 rounded-xl border border-[#343934] bg-[#1B1D1B] flex flex-col items-center gap-2">
            <PcIcon size={24} className="text-[#F2F3F0]" />
            <span className="font-mono text-xs text-[#929690]">PC</span>
          </div>
          <div className="p-5 rounded-xl border border-[#343934] bg-[#1B1D1B] flex flex-col items-center gap-2">
            <TvIcon size={24} className="text-[#F2F3F0]" />
            <span className="font-mono text-xs text-[#929690]">TV</span>
          </div>
        </div>
      </section>

      <div className="border-t border-[#343934] pt-6 flex items-center justify-between text-xs font-mono">
        <Link to="/" className="text-[#A3B899] hover:underline">
          ← Return to Home
        </Link>
        <Link to="/docs" className="text-[#A3B899] hover:underline">
          Documentation →
        </Link>
      </div>
    </div>
  );
}
