import { useState } from "react";
import { motion } from "motion/react";
import { Check, Download, ShieldCheck, Terminal, AlertCircle } from "lucide-react";
import {
  releasesPage,
  assetUrl,
  EXE_PORTABLE_ASSET,
  EXE_SETUP_ASSET,
  APK_ASSET,
  type ReleaseInfo,
} from "../../lib/site";
import { SectionHeader } from "../motion/SectionHeader";
import { Rule } from "../motion/Rule";
import { useToast } from "../toast/ToastProvider";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

interface DownloadSectionProps {
  release: ReleaseInfo | null;
}

interface BinaryItem {
  id: string;
  os: "Windows" | "Android";
  arch: string;
  type: string;
  fileName: string;
  size: string;
  hash: string | null; // Real SHA-256 if available, null otherwise
  url: string;
}

function getInitialOs(): "Windows" | "Android" | "Other" {
  if (typeof navigator === "undefined") return "Other";
  const nav = navigator as unknown as { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || navigator.userAgent || "";
  const lower = platform.toLowerCase();
  if (/android/i.test(lower)) return "Android";
  if (/win/i.test(lower)) return "Windows";
  return "Other";
}

export function DownloadSection({ release }: DownloadSectionProps) {
  const [detectedOs] = useState<"Windows" | "Android" | "Other">(getInitialOs);
  const [startedDownloads, setStartedDownloads] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const reduced = usePrefersReducedMotion();

  // Item 33: Look for real checksum in release body, otherwise null
  const extractRealHash = (_fileName: string): string | null => {
    if (!release?.body) return null;
    // If release body contains e.g. "sha256: <hex>" or "<hex>  <fileName>"
    const match = new RegExp(`([a-fA-F0-9]{64})\\s+.*${_fileName}`, "i").exec(release.body);
    return match ? match[1] : null;
  };

  const binaries: BinaryItem[] = [
    {
      id: "win-portable",
      os: "Windows",
      arch: "x86_64",
      type: "Standalone Portable Executable",
      fileName: "nas-share-desktop.exe",
      size: "17.5 MB",
      hash: extractRealHash(EXE_PORTABLE_ASSET),
      url: assetUrl(release, EXE_PORTABLE_ASSET),
    },
    {
      id: "win-setup",
      os: "Windows",
      arch: "x86_64",
      type: "NSIS System Installer",
      fileName: "Nasend-Setup.exe",
      size: "18.2 MB",
      hash: extractRealHash(EXE_SETUP_ASSET),
      url: assetUrl(release, EXE_SETUP_ASSET),
    },
    {
      id: "android-apk",
      os: "Android",
      arch: "Universal (arm64, armv7, x86_64)",
      type: "Universal Package (Android 8.0+)",
      fileName: "nasend-universal.apk",
      size: "12.4 MB",
      hash: extractRealHash(APK_ASSET),
      url: assetUrl(release, APK_ASSET),
    },
  ];

  // Item 32: Download is NEVER delayed
  const handleDownloadClick = (bin: BinaryItem) => {
    // Initiate download immediately
    window.open(bin.url, "_blank");

    // Animate button fill (scaleX 0->1, 0.6s) and swap label to check + "Download started"
    setStartedDownloads((prev) => ({ ...prev, [bin.id]: true }));
    toast(`Download started: ${bin.fileName}`);

    setTimeout(() => {
      setStartedDownloads((prev) => ({ ...prev, [bin.id]: false }));
    }, 3000);
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd).catch(() => {});
    toast(`Copied command: ${cmd}`);
  };

  return (
    <section id="download" className="relative py-24 bg-[#0C0D0C] overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 space-y-12">
        {/* Item 19: Unified SectionHeader */}
        <SectionHeader
          eyebrow="Releases & Binaries"
          title="Download native applications"
          description="Standalone executables and application packages for host workstations and mobile devices. Zero required cloud telemetry."
        />

        {/* Release Status & Detected OS */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#343934] bg-[#1B1D1B] text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#A3B899] motion-safe:animate-pulse" />
            <span className="text-[#F2F3F0] font-medium">
              Latest Tag: {release?.tag || "v0.1.0"}
            </span>
            <span className="text-[#929690] hidden sm:inline">•</span>
            <span className="text-[#929690] hidden sm:inline">
              Published: {release?.publishedAt ? new Date(release.publishedAt).toLocaleDateString() : "Active Build"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {detectedOs !== "Other" && (
              <span className="text-[10px] font-mono text-[#A3B899] bg-[#A3B899]/10 px-2.5 py-0.5 rounded border border-[#A3B899]/30">
                Detected: {detectedOs}
              </span>
            )}
            <a
              href={releasesPage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A3B899] hover:underline"
            >
              All GitHub Releases ↗
            </a>
          </div>
        </div>

        {/* Binary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {binaries.map((bin) => {
            const isMatch = detectedOs === bin.os;
            const isStarted = startedDownloads[bin.id];

            return (
              <div
                key={bin.id}
                className={`p-6 rounded-xl border bg-[#1B1D1B] flex flex-col justify-between space-y-6 transition-colors ${
                  isMatch ? "border-[#A3B899]" : "border-[#343934] hover:border-[#414741]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#A3B899] bg-[#252825] px-2 py-0.5 rounded border border-[#343934]">
                      {bin.os}
                    </span>
                    {isMatch && (
                      <span className="font-mono text-[10px] text-[#A3B899] bg-[#A3B899]/10 px-2 py-0.5 rounded border border-[#A3B899]/30">
                        Detected
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-base font-semibold text-[#F2F3F0]">
                      {bin.fileName}
                    </h3>
                    <p className="text-xs text-[#929690]">{bin.type}</p>
                    <p className="font-mono text-[11px] text-[#929690] pt-1">
                      Arch: {bin.arch} • Size: ~{bin.size}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#343934]/60">
                  {/* Item 32: Press-fill download button (immediate download, inner fill) */}
                  <button
                    type="button"
                    onClick={() => handleDownloadClick(bin)}
                    className="relative w-full py-3 rounded-lg overflow-hidden border border-[#A3B899] bg-[#252825] text-xs font-mono font-medium text-[#F2F3F0] hover:text-[#0C0D0C] hover:bg-[#A3B899] transition-colors cursor-pointer select-none"
                  >
                    {/* Animated Fill Span */}
                    {isStarted && !reduced && (
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, ease: "linear" }}
                        className="absolute inset-0 bg-[#A3B899] origin-left pointer-events-none"
                      />
                    )}

                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isStarted ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#0C0D0C]" />
                          <span className="text-[#0C0D0C]">Download started</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Binary</span>
                        </>
                      )}
                    </span>
                  </button>

                  {/* Item 33: Honest Checksum Display */}
                  <div className="space-y-1 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-[#929690]">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#A3B899]" />
                        <span>SHA-256</span>
                      </span>
                    </div>

                    {bin.hash ? (
                      <div className="p-2 rounded bg-[#0C0D0C] border border-[#343934] text-[#A3B899] break-all">
                        {bin.hash}
                      </div>
                    ) : (
                      <div className="p-2 rounded bg-[#0C0D0C] border border-[#343934] text-[#929690] flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 text-[#929690] shrink-0" />
                        <span>Checksum unavailable (release build)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick CLI Installation Snippet */}
        <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F2F3F0]">
              <Terminal className="w-4 h-4 text-[#A3B899]" />
              <span>Direct Winget / Cargo Installation (Windows)</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCmd("cargo install nas-share-desktop")}
              className="text-xs font-mono text-[#A3B899] hover:underline cursor-pointer"
            >
              Copy
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0C0D0C] border border-[#343934] font-mono text-xs text-[#F2F3F0] flex items-center justify-between overflow-x-auto">
            <code>cargo install nas-share-desktop</code>
            <span className="text-[10px] text-[#929690] pl-4">Rust / Axum runtime</span>
          </div>
        </div>
      </div>
      <Rule />
    </section>
  );
}
