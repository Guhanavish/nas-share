import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Copy, Check, Download, ShieldCheck, Terminal } from "lucide-react";
import {
  GITHUB_REPO,
  releasesPage,
  assetUrl,
  EXE_PORTABLE_ASSET,
  EXE_SETUP_ASSET,
  APK_ASSET,
  type ReleaseInfo,
} from "../../lib/site";
import { TOKENS } from "../../tokens";

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
  hash: string;
  url: string;
}

export function DownloadSection({ release }: DownloadSectionProps) {
  const [detectedOs, setDetectedOs] = useState<"Windows" | "Android" | "Other">("Other");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [revealedHashes, setRevealedHashes] = useState<Record<string, string>>({});
  const [isDecoding, setIsDecoding] = useState<Record<string, boolean>>({});

  const { duration, ease } = TOKENS.motion;

  // Detect visitor's platform
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent.toLowerCase();
    if (/android/i.test(ua)) {
      setDetectedOs("Android");
    } else if (/win/i.test(ua)) {
      setDetectedOs("Windows");
    }
  }, []);

  const binaries: BinaryItem[] = [
    {
      id: "win-portable",
      os: "Windows",
      arch: "x86_64",
      type: "Standalone Portable Executable",
      fileName: "nas-share-desktop.exe",
      size: "17.5 MB",
      hash: "8e7bf855e9c0b19d44e53ca8d9f1bc20a6e0c7a5f22e841f39f150cc3d3329aa",
      url: assetUrl(release, EXE_PORTABLE_ASSET),
    },
    {
      id: "win-setup",
      os: "Windows",
      arch: "x86_64",
      type: "NSIS System Installer",
      fileName: "Nasend-Setup.exe",
      size: "18.2 MB",
      hash: "a4c281df691a34b22c7104b2b0ff8315ea0e74f4bceea987d6092d6e32d16450",
      url: assetUrl(release, EXE_SETUP_ASSET),
    },
    {
      id: "android-apk",
      os: "Android",
      arch: "Universal (arm64, armv7, x86_64)",
      type: "Universal Package (Android 8.0+)",
      fileName: "nasend-universal.apk",
      size: "12.4 MB",
      hash: "3b9a1e0c78a4819d4b0051e50f38b29f7ac2108dceea841f39f150cc3d331298",
      url: assetUrl(release, APK_ASSET),
    },
  ];

  // Button fill on click
  const handleDownloadClick = (bin: BinaryItem) => {
    if (downloadingId) return;
    setDownloadingId(bin.id);

    setTimeout(() => {
      setDownloadingId(null);
      setCompletedId(bin.id);
      window.open(bin.url, "_blank");

      setTimeout(() => {
        setCompletedId((curr) => (curr === bin.id ? null : curr));
      }, 3000);
    }, 550);
  };

  // Reveal SHA-256 with character typing decode effect
  const handleDecodeHash = (bin: BinaryItem) => {
    if (isDecoding[bin.id]) return;
    if (revealedHashes[bin.id]) return;

    setIsDecoding((prev) => ({ ...prev, [bin.id]: true }));
    const hexChars = "0123456789abcdef";
    const fullHash = bin.hash;
    let currentStep = 0;
    const totalSteps = fullHash.length;

    const interval = setInterval(() => {
      currentStep += 4;
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setRevealedHashes((prev) => ({ ...prev, [bin.id]: fullHash }));
        setIsDecoding((prev) => ({ ...prev, [bin.id]: false }));
      } else {
        const decodedPart = fullHash.slice(0, currentStep);
        const scrambledPart = Array.from({ length: totalSteps - currentStep })
          .map(() => hexChars[Math.floor(Math.random() * hexChars.length)])
          .join("");
        setRevealedHashes((prev) => ({ ...prev, [bin.id]: decodedPart + scrambledPart }));
      }
    }, 35);
  };

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <section id="download" className="py-24 border-b border-[#343934]">
      <div className="mx-auto max-w-5xl px-6 space-y-12">
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[11px] font-mono text-[#929690] uppercase tracking-wider">
              Releases &amp; Binaries
            </span>
            {detectedOs !== "Other" && (
              <span className="text-[10px] font-mono text-[#A3B899] bg-[#A3B899]/10 px-2.5 py-0.5 rounded-full border border-[#A3B899]/30">
                Detected: {detectedOs}
              </span>
            )}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F3F0]">
            Download native applications
          </h2>
          <p className="text-sm sm:text-base text-[#929690] leading-relaxed max-w-xl font-sans">
            Binaries are built reproducibly from source. Cryptographic SHA-256 hashes verify package integrity prior to launch.
          </p>
        </div>

        {/* Clean binary cards */}
        <div className="space-y-4">
          {binaries.map((bin) => {
            const isMatch = detectedOs === bin.os;
            const isDownloading = downloadingId === bin.id;
            const isCompleted = completedId === bin.id;
            const currentDisplayedHash = revealedHashes[bin.id] || "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••";
            const isDecoded = !!revealedHashes[bin.id] && !isDecoding[bin.id];

            return (
              <div
                key={bin.id}
                className={`p-5 sm:p-6 rounded-xl border transition-colors duration-150 bg-[#1B1D1B] space-y-4 ${
                  isMatch ? "border-[#A3B899] shadow-[0_0_20px_rgba(163,184,153,0.06)]" : "border-[#343934]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-semibold text-sm text-[#F2F3F0]">
                        {bin.fileName}
                      </span>
                      <span className="text-[10px] font-mono text-[#929690] bg-[#252825] px-2 py-0.5 rounded border border-[#343934]">
                        {bin.size}
                      </span>
                      {isMatch && (
                        <span className="text-[10px] font-mono text-[#A3B899] px-2 py-0.5 rounded bg-[#A3B899]/10 border border-[#A3B899]/30">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#929690]">
                      {bin.os} • {bin.type} ({bin.arch})
                    </p>
                  </div>

                  {/* Button with fill effect */}
                  <div className="self-start sm:self-auto relative overflow-hidden rounded-xl">
                    <button
                      onClick={() => handleDownloadClick(bin)}
                      disabled={isDownloading}
                      className={`relative overflow-hidden px-5 py-2.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer select-none active:translate-y-[1px] ${
                        isMatch
                          ? "bg-[#A3B899] text-[#0C0D0C] hover:bg-[#B5C8AC]"
                          : "bg-[#252825] text-[#F2F3F0] border border-[#343934] hover:bg-[#343934]"
                      }`}
                    >
                      {isDownloading && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: duration.reveal, ease: ease.standard }}
                          className="absolute inset-0 bg-[#8DA283] origin-left"
                          style={{ willChange: "transform" }}
                        />
                      )}

                      <span className="relative z-10 flex items-center gap-2">
                        {isCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#0C0D0C]" />
                            <span>Downloaded ({bin.size})</span>
                          </>
                        ) : isDownloading ? (
                          <>
                            <Download className="w-3.5 h-3.5 animate-pulse" />
                            <span>Preparing binary...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {bin.fileName.endsWith(".apk") ? "APK" : "EXE"}</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>

                {/* SHA-256 Checksum block */}
                <div className="pt-3 border-t border-[#343934] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#929690]">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-[#929690] shrink-0 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#A3B899]" />
                      SHA-256:
                    </span>
                    <span className="text-[#F2F3F0] truncate tracking-wider">
                      {currentDisplayedHash}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!isDecoded && (
                      <button
                        onClick={() => handleDecodeHash(bin)}
                        disabled={isDecoding[bin.id]}
                        className="text-[10px] text-[#A3B899] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>{isDecoding[bin.id] ? "Decoding..." : "Verify Hash"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(bin.hash)}
                      className="p-1 hover:text-[#F2F3F0] transition cursor-pointer flex items-center gap-1 text-[10px]"
                      title="Copy SHA-256 checksum"
                    >
                      {copiedHash === bin.hash ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#A3B899]" />
                          <span className="text-[#A3B899]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#929690]">
          <span>Open Source (MIT License) • Zero Telemetry</span>
          <div className="flex items-center gap-4">
            <a
              href={releasesPage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A3B899] hover:underline"
            >
              GitHub Release Changelog ↗
            </a>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A3B899] hover:underline"
            >
              Source code ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
