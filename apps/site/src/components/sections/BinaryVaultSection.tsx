import { useState } from "react";
import { Download, Copy, Check, ShieldCheck, Terminal, Smartphone, Laptop, Sparkles } from "lucide-react";
import { GlassCard } from "../glass/GlassCard";
import {
  GITHUB_REPO,
  releasesPage,
  assetUrl,
  EXE_PORTABLE_ASSET,
  EXE_SETUP_ASSET,
  APK_ASSET,
  type ReleaseInfo,
} from "../../lib/site";
import { zenAudioEngine } from "../audio/ZenAudio";

interface BinaryVaultSectionProps {
  release: ReleaseInfo | null;
  onCopyToast?: (msg: string) => void;
}

export function BinaryVaultSection({ release, onCopyToast }: BinaryVaultSectionProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [detectedPlatform] = useState<"windows" | "android" | "other">(() => {
    if (typeof window === "undefined") return "other";
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("win")) return "windows";
    if (ua.includes("android")) return "android";
    return "other";
  });

  const binaries = [
    {
      id: "win-portable",
      platform: "windows" as const,
      title: "Windows Portable Binary",
      badge: "Zero Install • 17.5 MB",
      icon: Laptop,
      color: "cyan" as const,
      desc: "Single standalone executable. Double-click to run anywhere. No admin rights, no installer footprint.",
      fileName: "nas-share-desktop.exe",
      hash: "8e7bf855e9c0b19d44e53ca8d9f1bc20a6e0c7a5f22e841f39f150cc3d3329aa",
      downloadUrl: assetUrl(release, EXE_PORTABLE_ASSET),
    },
    {
      id: "win-installer",
      platform: "windows" as const,
      title: "Windows Setup Installer",
      badge: "NSIS Installer • Tray Agent",
      icon: Terminal,
      color: "indigo" as const,
      desc: "Full NSIS installer with desktop shortcut, background system tray daemon, and Windows startup option.",
      fileName: "Nasend-Setup.exe",
      hash: "a4c281df691a34b22c7104b2b0ff8315ea0e74f4bceea987d6092d6e32d16450",
      downloadUrl: assetUrl(release, EXE_SETUP_ASSET),
    },
    {
      id: "android-apk",
      platform: "android" as const,
      title: "Universal Android & TV APK",
      badge: "Phones, Tablets, Android TV",
      icon: Smartphone,
      color: "emerald" as const,
      desc: "Universal APK supporting Android 8.0 through Android 15, including TV Leanback remote navigation.",
      fileName: "nasend-universal.apk",
      hash: "3b9a1e0c78a4819d4b0051e50f38b29f7ac2108dceea841f39f150cc3d331298",
      downloadUrl: assetUrl(release, APK_ASSET),
    },
  ];

  const handleCopyHash = (hash: string, name: string) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedHash(hash);
    zenAudioEngine.playChime(800);
    onCopyToast?.(`Copied SHA-256 for ${name}`);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <section id="vault" className="relative py-28 px-4 sm:px-6 lg:px-12 border-t border-white/10">
      <div className="mx-auto max-w-7xl w-full space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-mesh/20 bg-emerald-mesh/5 text-[11px] font-mono text-emerald-mesh uppercase tracking-widest">
            <ShieldCheck size={14} />
            <span>Sovereign Vault</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Compiled &amp; Cryptographically Sealed.
          </h2>
          <p className="text-fog text-sm sm:text-base leading-relaxed">
            Every build is compiled directly from source and verified with SHA-256 integrity hashes.
            Zero analytics, zero tracking beacons, and zero telemetry payloads.
          </p>

          {detectedPlatform !== "other" && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-mesh/10 border border-cyan-mesh/30 text-cyan-mesh text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-mesh" />
              <span>
                Detected {detectedPlatform === "windows" ? "Windows OS" : "Android Device"} — Suggested binary highlighted below
              </span>
            </div>
          )}
        </div>

        {/* 3 Binary Download Glass Cards (Item 24 with Shimmer) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {binaries.map((bin) => {
            const IconComponent = bin.icon;
            const isSuggested =
              (detectedPlatform === "windows" && bin.id === "win-portable") ||
              (detectedPlatform === "android" && bin.id === "android-apk");

            return (
              <GlassCard
                key={bin.id}
                glowColor={bin.color}
                className={`p-7 flex flex-col justify-between space-y-6 relative transition-all ${
                  isSuggested
                    ? "ring-2 ring-cyan-mesh/50 shadow-[0_0_30px_rgba(56,189,248,0.2)] bg-card/80"
                    : ""
                }`}
              >
                {isSuggested && (
                  <div className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-cyan-mesh/20 border border-cyan-mesh/40 text-cyan-mesh font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-mesh" />
                    <span>Suggested</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white">
                      <IconComponent className="w-6 h-6 text-cyan-mesh" />
                    </div>
                    {!isSuggested && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-fog border border-white/10">
                        {bin.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-white">
                      {bin.title}
                    </h3>
                    <p className="text-xs text-fog font-mono mt-0.5">{bin.fileName}</p>
                  </div>

                  <p className="text-sm text-fog leading-relaxed">{bin.desc}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <a
                    href={bin.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`relative overflow-hidden w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-display text-sm font-semibold transition active:scale-95 cursor-pointer ${
                      isSuggested
                        ? "bg-gradient-to-r from-cyan-mesh via-indigo-mesh to-emerald-mesh shadow-lg shadow-cyan-500/25 border border-white/30"
                        : "bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-cyan-mesh/50"
                    }`}
                  >
                    {/* Shimmer effect (Item 24) */}
                    <div className="absolute inset-0 shimmer-skeleton opacity-20 pointer-events-none" />
                    <Download className="w-4 h-4 text-white relative z-10" />
                    <span className="relative z-10">
                      {isSuggested ? `Download for ${detectedPlatform === "windows" ? "Windows" : "Android"}` : "Download Binary"}
                    </span>
                  </a>

                  {/* SHA-256 Checksum Copier */}
                  <button
                    onClick={() => handleCopyHash(bin.hash, bin.title)}
                    className="w-full text-left p-2 rounded-lg bg-ink/70 border border-white/5 font-mono text-[10px] text-fog hover:text-white flex items-center justify-between transition cursor-pointer"
                    title="Click to copy SHA-256 checksum"
                  >
                    <span className="truncate pr-2">SHA: {bin.hash.slice(0, 20)}...</span>
                    {copiedHash === bin.hash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-mesh shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-fog shrink-0" />
                    )}
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* GitHub Releases and Verification Bar */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-fog">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-mesh" />
            <span>Open-source under MIT License. Audited reproducible builds.</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={releasesPage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-mesh hover:underline flex items-center gap-1"
            >
              <span>View All Release Archives ↗</span>
            </a>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline flex items-center gap-1"
            >
              <span>GitHub Source Repository ↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
