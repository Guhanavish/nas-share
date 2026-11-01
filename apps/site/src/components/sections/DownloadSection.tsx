import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  GITHUB_REPO,
  releasesPage,
  assetUrl,
  EXE_PORTABLE_ASSET,
  EXE_SETUP_ASSET,
  APK_ASSET,
  type ReleaseInfo,
} from "../../lib/site";

interface DownloadSectionProps {
  release: ReleaseInfo | null;
}

export function DownloadSection({ release }: DownloadSectionProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const binaries = [
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
      os: "Android & TV",
      arch: "Universal (arm64, armv7, x86_64)",
      type: "Universal Package (Android 8.0+)",
      fileName: "nasend-universal.apk",
      size: "12.4 MB",
      hash: "3b9a1e0c78a4819d4b0051e50f38b29f7ac2108dceea841f39f150cc3d331298",
      url: assetUrl(release, APK_ASSET),
    },
  ];

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <section id="download" className="py-20 border-b border-[#30363d]">
      <div className="mx-auto max-w-4xl px-6 space-y-10">
        <div className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
            Releases &amp; Checksums
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc]">
            Download binaries
          </h2>
          <p className="text-sm text-[#8b949e] leading-relaxed max-w-xl">
            Binaries are built reproducibly from source. Checksums are calculated with SHA-256 to verify archive integrity.
          </p>
        </div>

        {/* Clean binary table / card list (Step 6) */}
        <div className="space-y-4">
          {binaries.map((bin) => (
            <div
              key={bin.id}
              className="p-4 sm:p-5 rounded border border-[#30363d] bg-[#161b22] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[#f0f6fc]">
                      {bin.fileName}
                    </span>
                    <span className="text-[10px] font-mono text-[#8b949e] bg-[#21262d] px-1.5 py-0.5 rounded border border-[#30363d]">
                      {bin.size}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b949e]">
                    {bin.os} • {bin.type} ({bin.arch})
                  </p>
                </div>

                <a
                  href={bin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start sm:self-auto px-3.5 py-1.5 rounded text-xs font-medium text-[#0e1117] bg-[#38bdf8] hover:bg-[#7dd3fc] transition"
                >
                  Download {bin.fileName.endsWith(".apk") ? "APK" : "EXE"}
                </a>
              </div>

              {/* SHA-256 Checksum block */}
              <div className="pt-2 border-t border-[#30363d]/60 flex items-center justify-between gap-2 text-[11px] font-mono text-[#8b949e]">
                <span className="truncate pr-2">
                  SHA-256: <span className="text-[#f0f6fc]">{bin.hash}</span>
                </span>
                <button
                  onClick={() => handleCopy(bin.hash)}
                  className="shrink-0 p-1 hover:text-[#f0f6fc] transition cursor-pointer"
                  title="Copy SHA-256 hash"
                >
                  {copiedHash === bin.hash ? (
                    <Check className="w-3.5 h-3.5 text-[#38bdf8]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Source link */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#8b949e]">
          <span>Licensed under MIT License</span>
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
