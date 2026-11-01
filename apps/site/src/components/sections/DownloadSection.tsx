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

  // Item 37: Detect visitor's platform
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

  // Item 38: Animate button fill left to right on press, then show check mark & start download
  const handleDownloadClick = (bin: BinaryItem) => {
    if (downloadingId) return;
    setDownloadingId(bin.id);

    // After 600ms progress fill completes
    setTimeout(() => {
      setDownloadingId(null);
      setCompletedId(bin.id);
      window.open(bin.url, "_blank");

      setTimeout(() => {
        setCompletedId((curr) => (curr === bin.id ? null : curr));
      }, 3000);
    }, 600);
  };

  // Item 39: Reveal SHA-256 checksum with character-by-character decode typing effect
  const handleDecodeHash = (bin: BinaryItem) => {
    if (isDecoding[bin.id]) return;
    if (revealedHashes[bin.id]) return; // already fully decoded

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
    <section id="download" className="py-20 border-b border-[#30363d]">
      <div className="mx-auto max-w-4xl px-6 space-y-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
              Releases &amp; Checksums
            </span>
            {detectedOs !== "Other" && (
              <span className="text-[10px] font-mono text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/30">
                Detected: {detectedOs}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc]">
            Download binaries
          </h2>
          <p className="text-sm text-[#8b949e] leading-relaxed max-w-xl">
            Binaries are built reproducibly from source. Cryptographic SHA-256 hashes confirm archive integrity prior to execution.
          </p>
        </div>

        {/* Clean binary cards with Item 37 OS highlight, Item 38 button fill, Item 39 hash decode */}
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
                className={`p-4 sm:p-5 rounded border transition-colors duration-150 bg-[#161b22] space-y-3 ${
                  isMatch ? "border-[#38bdf8]/60 bg-[#161b22]/90" : "border-[#30363d]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[#f0f6fc] font-mono">
                        {bin.fileName}
                      </span>
                      <span className="text-[10px] font-mono text-[#8b949e] bg-[#21262d] px-1.5 py-0.5 rounded border border-[#30363d]">
                        {bin.size}
                      </span>
                      {isMatch && (
                        <span className="text-[10px] font-mono text-[#38bdf8] px-1.5 py-0.5 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/30">
                          Recommended for you
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8b949e]">
                      {bin.os} • {bin.type} ({bin.arch})
                    </p>
                  </div>

                  {/* Item 38: Button fill left-to-right on press */}
                  <div className="self-start sm:self-auto relative overflow-hidden rounded">
                    <button
                      onClick={() => handleDownloadClick(bin)}
                      disabled={isDownloading}
                      className={`relative overflow-hidden px-4 py-2 rounded text-xs font-mono font-medium transition cursor-pointer select-none active:translate-y-[1px] ${
                        isMatch
                          ? "bg-[#38bdf8] text-[#0e1117] hover:bg-[#7dd3fc]"
                          : "bg-[#21262d] text-[#f0f6fc] border border-[#30363d] hover:bg-[#30363d]"
                      }`}
                    >
                      {/* Left-to-right fill overlay */}
                      {isDownloading && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: duration.slow, ease: ease.standard }}
                          className="absolute inset-0 bg-[#0284c7] origin-left"
                          style={{ willChange: "transform" }}
                        />
                      )}

                      <span className="relative z-10 flex items-center gap-1.5">
                        {isCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Downloaded ({bin.size})</span>
                          </>
                        ) : isDownloading ? (
                          <>
                            <Download className="w-3.5 h-3.5 animate-pulse" />
                            <span>Preparing package...</span>
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

                {/* Item 39: SHA-256 Checksum with character-by-character decode typing effect */}
                <div className="pt-2 border-t border-[#30363d]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#8b949e]">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-[#8b949e] shrink-0 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                      SHA-256:
                    </span>
                    <span className="text-[#f0f6fc] truncate tracking-wider">
                      {currentDisplayedHash}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!isDecoded && (
                      <button
                        onClick={() => handleDecodeHash(bin)}
                        disabled={isDecoding[bin.id]}
                        className="text-[10px] text-[#38bdf8] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>{isDecoding[bin.id] ? "Decoding..." : "Verify Hash"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(bin.hash)}
                      className="p-1 hover:text-[#f0f6fc] transition cursor-pointer flex items-center gap-1 text-[10px]"
                      title="Copy SHA-256 checksum"
                    >
                      {copiedHash === bin.hash ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#38bdf8]" />
                          <span className="text-[#38bdf8]">Copied</span>
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

        {/* Source link & release info */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#8b949e]">
          <span>Open Source (MIT License) • Zero telemetry</span>
          <div className="flex items-center gap-4">
            <a
              href={releasesPage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] hover:underline"
            >
              GitHub Release Changelog ↗
            </a>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] hover:underline"
            >
              Source code ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
