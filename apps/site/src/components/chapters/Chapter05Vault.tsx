import { useState } from "react";
import {
  Download,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Terminal,
  ExternalLink,
} from "lucide-react";
import {
  APK_ASSET,
  EXE_SETUP_ASSET,
  EXE_PORTABLE_ASSET,
  assetUrl,
  releasesPage,
  type ReleaseInfo,
} from "../../lib/site";
import { zenAudioEngine } from "../audio/ZenAudio";

export function Chapter05Vault({ release }: { release: ReleaseInfo | null }) {
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const WIN_SHA = "6393004C6812F08F4B74D71A213BD548452F2583460AA7BB04CD1DEEAACEC362";
  const ANDROID_SHA = "12A6F5E7EF5D4CAF611C0D70D4A14238B1DB125700ACDB31C3D85DC41B729A0D";

  const copySha = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedSha(id);
    zenAudioEngine.playChime(660);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const winUrl = assetUrl(release, EXE_SETUP_ASSET);
  const apkUrl = assetUrl(release, APK_ASSET);
  const portableUrl = assetUrl(release, EXE_PORTABLE_ASSET);

  return (
    <section id="chapter-05" className="relative min-h-[100dvh] flex flex-col justify-center px-5 py-24">
      <div className="mx-auto max-w-5xl w-full">
        {/* Chapter marker */}
        <div className="flex items-center gap-3 font-mono text-xs text-vermilion">
          <span className="flex h-2 w-2 rounded-full bg-vermilion animate-pulse" />
          <span className="uppercase tracking-widest font-bold">05 // 蔵 The Sovereign Vault</span>
          <span className="text-fog/40">|</span>
          <span className="text-fog">Verified Binary Artifacts</span>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-snow sm:text-5xl">
              Grab The Apps. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vermilion via-amber to-snow">
                Free Forever.
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-fog sm:text-lg">
              No tracking, no paywalls, no analytics SDKs. Download the release binaries
              or audit the full source on GitHub.
            </p>
          </div>

          <a
            href={releasesPage}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-fog hover:text-snow transition"
          >
            <span>View All GitHub Releases</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Primary Download Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Card 1: Windows Desktop */}
          <div className="kage-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-primary/20">
            <div>
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-snow">Windows Desktop</h3>
                    <p className="font-mono text-xs text-primary">Tauri v2 • Rust Axum • SQLite</p>
                  </div>
                </div>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                  v0.1.0 (3.68 MiB)
                </span>
              </div>

              <div className="mt-6 space-y-2 text-xs text-fog">
                <p>• System tray menu with auto-start and single instance lock.</p>
                <p>• Embedded Axum server on port 8743 with path traversal sandboxing.</p>
                <p>• Compatible with Windows 10 & 11 (64-bit x64).</p>
              </div>

              {/* SHA256 Verification */}
              <div className="mt-5 rounded-xl border border-line bg-ink/70 p-3 font-mono text-[11px]">
                <div className="flex items-center justify-between text-fog">
                  <span>SHA-256 Checksum:</span>
                  <button
                    onClick={() => copySha(WIN_SHA, "win")}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    {copiedSha === "win" ? (
                      <>
                        <Check className="h-3 w-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 truncate text-snow">{WIN_SHA}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <a
                href={winUrl}
                onClick={() => zenAudioEngine.playChime(660)}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.35)] transition hover:bg-primary/90 active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Download NSIS Setup (.exe)</span>
              </a>
              <a
                href={portableUrl}
                className="flex h-12 items-center justify-center rounded-xl border border-line bg-card px-4 text-xs font-mono text-fog transition hover:text-snow hover:border-white/20 active:scale-95"
                title="Download standalone portable binary"
              >
                Portable .exe
              </a>
            </div>
          </div>

          {/* Card 2: Android & Android TV Universal */}
          <div className="kage-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-amber/20">
            <div>
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber/15 text-amber">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-snow">Universal Android</h3>
                    <p className="font-mono text-xs text-amber">Phone • Tablet • Android TV</p>
                  </div>
                </div>
                <span className="rounded-full border border-amber/30 bg-amber/10 px-3 py-1 font-mono text-xs text-amber">
                  v0.1.0 (24.97 MiB)
                </span>
              </div>

              <div className="mt-6 space-y-2 text-xs text-fog">
                <p>• 1 Universal APK with TV Banner and Leanback launcher intent.</p>
                <p>• Full D-pad navigation with focus halos & touchscreen optional.</p>
                <p>• Ktor HTTP server inside Android ForegroundService.</p>
              </div>

              {/* SHA256 Verification */}
              <div className="mt-5 rounded-xl border border-line bg-ink/70 p-3 font-mono text-[11px]">
                <div className="flex items-center justify-between text-fog">
                  <span>SHA-256 Checksum:</span>
                  <button
                    onClick={() => copySha(ANDROID_SHA, "android")}
                    className="flex items-center gap-1 text-amber hover:underline"
                  >
                    {copiedSha === "android" ? (
                      <>
                        <Check className="h-3 w-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 truncate text-snow">{ANDROID_SHA}</p>
              </div>
            </div>

            <div className="mt-6">
              <a
                href={apkUrl}
                onClick={() => zenAudioEngine.playChime(554)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber px-5 text-sm font-semibold text-ink shadow-[0_0_24px_rgba(245,158,11,0.35)] transition hover:bg-amber/90 active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Download Universal APK (.apk)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Self-Host Signaling & ADB Instructions */}
        <div className="mt-10 rounded-2xl border border-line bg-ink/90 p-5 font-mono text-xs">
          <div className="flex items-center gap-2 text-snow font-bold">
            <Terminal className="h-4 w-4 text-vermilion" />
            <span>Fast CLI Install Commands</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line/50 bg-card/60 p-3">
              <span className="text-[10px] text-fog uppercase tracking-wider">Install on Android Device via ADB:</span>
              <pre className="mt-1 text-accent select-all overflow-x-auto">
                adb install -r app-debug.apk
              </pre>
            </div>
            <div className="rounded-xl border border-line/50 bg-card/60 p-3">
              <span className="text-[10px] text-fog uppercase tracking-wider">Deploy Cloudflare Signaling:</span>
              <pre className="mt-1 text-cyan-mesh select-all overflow-x-auto">
                cd server/cloudflare && npx wrangler deploy
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
