import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Check, Download, ShieldCheck, Terminal, AlertCircle, ChevronDown, Copy } from "lucide-react";
import {
  releasesPage,
  formatBytes,
  GITHUB_REPO,
  EXE_PORTABLE_ASSET,
  EXE_SETUP_ASSET,
  APK_ASSET,
  type ReleaseInfo,
  type ReleaseAsset,
} from "../../lib/site";
import { SectionHeader } from "../motion/SectionHeader";
import { Rule } from "../motion/Rule";
import { useToast } from "../toast/useToast";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

export type DetectedPlatform =
  | "Windows"
  | "Android"
  | "macOS"
  | "Linux"
  | "iOS"
  | "Windows-on-ARM"
  | "Other";

function detectOs(): DetectedPlatform {
  if (typeof navigator === "undefined") return "Other";
  const nav = navigator as unknown as { userAgentData?: { platform?: string; architecture?: string } };
  const ua = navigator.userAgent || "";
  const platform = nav.userAgentData?.platform || navigator.platform || ua;

  if (/iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "iOS";
  }
  if (/mac/i.test(platform)) {
    return "macOS";
  }
  if (/android/i.test(platform) || /android/i.test(ua)) {
    return "Android";
  }
  if (/win/i.test(platform) || /windows/i.test(ua)) {
    if (/arm/i.test(ua) || nav.userAgentData?.architecture === "arm") {
      return "Windows-on-ARM";
    }
    return "Windows";
  }
  if (/linux/i.test(platform) || /linux/i.test(ua)) {
    return "Linux";
  }
  return "Other";
}

interface DownloadSectionProps {
  release: ReleaseInfo | null;
  releaseStatus?: "loading" | "ok" | "none" | "error";
}

interface DisplayBinary {
  id: string;
  os: "Windows" | "Android";
  arch: string;
  type: string;
  asset: ReleaseAsset;
  checksum: string | null;
}

function extractChecksum(asset: ReleaseAsset, body?: string): string | null {
  if (asset.digest) {
    return asset.digest.replace(/^sha256:/i, "");
  }
  if (!body) return null;
  const regex = new RegExp(`([a-fA-F0-9]{64})\\s+[*]?${asset.name}`, "i");
  const match = regex.exec(body);
  return match ? match[1] : null;
}

export function DownloadSection({ release, releaseStatus = "ok" }: DownloadSectionProps) {
  const [detectedOs] = useState<DetectedPlatform>(() => detectOs());
  const [startedDownloads, setStartedDownloads] = useState<Record<string, boolean>>({});
  const [expandedChecksums, setExpandedChecksums] = useState<Record<string, boolean>>({});

  const timeoutsRef = useRef<number[]>([]);
  const { toast } = useToast();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(window.clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const handleStarted = (id: string, fileName: string) => {
    setStartedDownloads((prev) => ({ ...prev, [id]: true }));
    toast(`Download initiated: ${fileName}`);

    const timer = window.setTimeout(() => {
      setStartedDownloads((prev) => ({ ...prev, [id]: false }));
    }, 3000);
    timeoutsRef.current.push(timer);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    toast(`Copied ${label}`);
  };

  const isUnsupportedPlatform =
    detectedOs === "macOS" ||
    detectedOs === "Linux" ||
    detectedOs === "iOS" ||
    detectedOs === "Windows-on-ARM";

  // Build binary cards only from real assets present in the release
  const binaries: DisplayBinary[] = [];
  if (release && release.assets && release.assets.length > 0) {
    const portable = release.assets.find((a) => a.name === EXE_PORTABLE_ASSET);
    if (portable) {
      binaries.push({
        id: "win-portable",
        os: "Windows",
        arch: "x86_64",
        type: "Standalone Portable Executable",
        asset: portable,
        checksum: extractChecksum(portable, release.body),
      });
    }

    const setup = release.assets.find((a) => a.name === EXE_SETUP_ASSET);
    if (setup) {
      binaries.push({
        id: "win-setup",
        os: "Windows",
        arch: "x86_64",
        type: "NSIS System Installer",
        asset: setup,
        checksum: extractChecksum(setup, release.body),
      });
    }

    const apk = release.assets.find((a) => a.name === APK_ASSET);
    if (apk) {
      binaries.push({
        id: "android-apk",
        os: "Android",
        arch: "Universal (arm64, armv7, x86_64)",
        type: "Android Application Package (8.0+)",
        asset: apk,
        checksum: extractChecksum(apk, release.body),
      });
    }
  }

  return (
    <section id="download" className="relative py-24 bg-[#0C0D0C] overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 space-y-12">
        <SectionHeader
          eyebrow="Releases & Binaries"
          title="Download native applications"
          description="Standalone executables and application packages for host workstations and mobile devices. Built from the public source. Compare each file against its SHA-256 below."
        />

        {/* Release Status & Detected Platform Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#343934] bg-[#1B1D1B] text-xs font-mono">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                release ? "bg-[#A3B899] motion-safe:animate-pulse" : "bg-[#414741]"
              }`}
            />
            <span className="text-[#F2F3F0] font-medium">
              {release ? `Release: ${release.tag}` : "Release: None published"}
            </span>
            {release?.publishedAt && (
              <>
                <span className="text-[#929690] hidden sm:inline">•</span>
                <span className="text-[#929690] hidden sm:inline">
                  Published: {new Date(release.publishedAt).toLocaleDateString()}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {detectedOs !== "Other" && (
              <span className="text-[11px] font-mono text-[#A3B899] bg-[#252825] px-2.5 py-0.5 rounded border border-[#343934]">
                Detected OS: {detectedOs}
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

        {/* Honest platform compatibility notice (T18) */}
        {isUnsupportedPlatform && (
          <div className="p-4 rounded-xl border border-[#343934] bg-[#1B1D1B] flex items-start gap-3 text-xs text-[#929690]">
            <AlertCircle className="w-4 h-4 text-[#A3B899] shrink-0 mt-0.5" />
            <p>
              NASend isn't available for <span className="text-[#F2F3F0] font-semibold">{detectedOs}</span> yet.
              Android and Windows (x86-64) builds are listed below.
            </p>
          </div>
        )}

        {/* Binary Cards / Empty State Handling */}
        {releaseStatus === "loading" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] h-64 animate-pulse" />
            ))}
          </div>
        ) : !release || releaseStatus === "none" || binaries.length === 0 ? (
          /* Honest Empty State when no release has been published yet */
          <div className="p-10 rounded-xl border border-[#343934] bg-[#1B1D1B] text-center space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full border border-[#343934] bg-[#252825] flex items-center justify-center mx-auto text-[#A3B899]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-semibold text-[#F2F3F0]">
                No release published yet
              </h3>
              <p className="text-xs sm:text-sm text-[#929690]">
                Native binaries will appear here automatically once release v0.1.0 is published on GitHub.
              </p>
            </div>
            <div className="pt-2">
              <a
                href={`https://github.com/${GITHUB_REPO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#252825] border border-[#343934] text-xs font-mono text-[#A3B899] hover:bg-[#343934] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899]"
              >
                <span>View Repository on GitHub</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {binaries.map((bin) => {
              const isMatch = detectedOs === bin.os;
              const isStarted = startedDownloads[bin.id];
              const isExpanded = expandedChecksums[bin.id];

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
                        <span className="font-mono text-[10px] text-[#A3B899] bg-[#252825] px-2 py-0.5 rounded border border-[#A3B899]">
                          Detected
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display text-base font-semibold text-[#F2F3F0]">
                        {bin.asset.name}
                      </h3>
                      <p className="text-xs text-[#929690]">{bin.type}</p>
                      <p className="font-mono text-[11px] text-[#929690] pt-1">
                        Arch: {bin.arch} • Size: {formatBytes(bin.asset.size)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#343934]/60">
                    {/* Direct link for reliable downloads (T2.6) */}
                    <a
                      href={bin.asset.url}
                      download={bin.asset.name}
                      rel="noopener"
                      onClick={() => handleStarted(bin.id, bin.asset.name)}
                      className="relative w-full py-3 rounded-lg overflow-hidden border border-[#A3B899] bg-[#252825] text-xs font-mono font-medium text-[#F2F3F0] hover:text-[#0C0D0C] hover:bg-[#A3B899] transition-colors cursor-pointer select-none text-center block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899]"
                    >
                      {/* Animated feedback fill on click only */}
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
                    </a>

                    {/* Honest Checksum Display (T2.4, T2.5) */}
                    <div className="space-y-2 font-mono text-[11px]">
                      {bin.checksum ? (
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedChecksums((prev) => ({
                                ...prev,
                                [bin.id]: !prev[bin.id],
                              }))
                            }
                            className="flex items-center justify-between w-full text-[#929690] hover:text-[#F2F3F0] transition cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#A3B899]" />
                              <span>Show checksum</span>
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-2.5 rounded bg-[#0C0D0C] border border-[#343934] space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[10px] text-[#A3B899] break-all select-all font-mono">
                                  {bin.checksum}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(bin.checksum!, "checksum")}
                                  className="text-[#929690] hover:text-[#F2F3F0] shrink-0 p-1"
                                  title="Copy SHA-256"
                                  aria-label="Copy SHA-256"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="pt-2 border-t border-[#343934] text-[10px] text-[#929690] space-y-1">
                                <p className="font-semibold text-[#F2F3F0]">Local verification:</p>
                                {bin.os === "Windows" ? (
                                  <code className="block bg-[#1B1D1B] p-1 rounded text-[#F2F3F0] break-all">
                                    Get-FileHash .\{bin.asset.name} -Algorithm SHA256
                                  </code>
                                ) : (
                                  <code className="block bg-[#1B1D1B] p-1 rounded text-[#F2F3F0] break-all">
                                    shasum -a 256 {bin.asset.name}
                                  </code>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-[#0C0D0C] border border-[#343934] text-[#929690] flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-[#929690] shrink-0" />
                          <span>Checksum not published</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick CLI Installation Snippet */}
        <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F2F3F0]">
              <Terminal className="w-4 h-4 text-[#A3B899]" />
              <span>Direct Winget / Cargo Installation (Windows)</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy("cargo install nas-share-desktop", "command")}
              className="text-xs font-mono text-[#A3B899] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A3B899]"
            >
              Copy
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0C0D0C] border border-[#343934] font-mono text-xs text-[#F2F3F0] flex items-center justify-between overflow-x-auto">
            <code>cargo install nas-share-desktop</code>
            <span className="text-[11px] text-[#929690] pl-4">Rust / Axum runtime</span>
          </div>
        </div>
      </div>
      <Rule />
    </section>
  );
}
