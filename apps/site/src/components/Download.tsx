import { useEffect, useState } from "react";
import { Smartphone, MonitorDown, HardDriveDownload, FileCheck2, WifiOff } from "lucide-react";
import { Reveal, SectionHead } from "./ui";
import {
  APK_ASSET,
  EXE_PORTABLE_ASSET,
  EXE_SETUP_ASSET,
  assetUrl,
  formatBytes,
  latestPage,
  type ReleaseInfo,
} from "../lib/site";

function asset(it: ReleaseInfo | null, name: string) {
  return it?.assets.find((a) => a.name === name);
}

export function Download({ release }: { release: ReleaseInfo | null }) {
  const apk = asset(release, APK_ASSET);
  const setup = asset(release, EXE_SETUP_ASSET);
  const portable = asset(release, EXE_PORTABLE_ASSET);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 8000);
    if (release) setSettled(true);
    return () => clearTimeout(t);
  }, [release]);

  const offline = settled && !release;

  return (
    <section id="download" className="border-t border-line bg-panel/60 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHead
          eyebrow="download"
          title="Grab the apps. Free forever."
          sub={
            release
              ? `${release.tag} · published ${new Date(release.publishedAt).toLocaleDateString()}`
              : "Latest stable from GitHub Releases"
          }
        />

        {offline && (
          <p className="mx-auto mb-6 flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-sm text-fog">
            <WifiOff className="h-4 w-4 shrink-0 text-warn" />
            Live version info did not load. Buttons below still open the
            releases page so you can download manually.
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {/* APK card */}
          <Reveal>
            <div className="spot-card flex h-full flex-col rounded-3xl border border-line bg-card p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Smartphone className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-4 text-2xl font-bold">Android APK</h3>
              <p className="mt-2 text-sm text-fog">
                One universal build for phone, tablet and Google TV. D-pad ready,
                foreground sharing, background sync.
              </p>
              <ul className="mt-4 space-y-1.5 font-mono text-xs text-fog">
                <li>requires android 8.0+</li>
                <li>size {apk ? formatBytes(apk.size) : "~24 MB"}</li>
                <li>tv banner + leanback launcher included</li>
              </ul>
              <div className="mt-auto pt-6">
                <a
                  href={assetUrl(release, APK_ASSET)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5 font-display font-semibold text-ink shadow-[0_0_36px_rgba(16,185,129,0.35)] transition hover:shadow-[0_0_52px_rgba(16,185,129,0.55)]"
                >
                  <HardDriveDownload className="h-5 w-5" />
                  Download APK
                </a>
                <p className="mt-3 text-center font-mono text-[11px] text-fog">
                  {APK_ASSET} · sideload, allow unknown apps once
                </p>
              </div>
            </div>
          </Reveal>

          {/* EXE card */}
          <Reveal delay={0.1}>
            <div className="spot-card flex h-full flex-col rounded-3xl border border-primary/40 bg-card p-8 shadow-[0_0_60px_rgba(59,130,246,0.12)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <MonitorDown className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-4 text-2xl font-bold">Windows EXE</h3>
              <p className="mt-2 text-sm text-fog">
                Tauri desktop at ~15 MB: tray app, autostart, embedded file
                server on :8743. Installer or portable.
              </p>
              <ul className="mt-4 space-y-1.5 font-mono text-xs text-fog">
                <li>windows 10/11 · webview2 runtime</li>
                <li>
                  installer {setup ? formatBytes(setup.size) : "n/a"} · portable{" "}
                  {portable ? formatBytes(portable.size) : "n/a"}
                </li>
              </ul>
              <div className="mt-auto space-y-3 pt-6">
                <a
                  href={assetUrl(release, EXE_SETUP_ASSET)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-display font-semibold text-white shadow-[0_0_36px_rgba(59,130,246,0.45)] transition hover:shadow-[0_0_52px_rgba(59,130,246,0.65)]"
                >
                  <HardDriveDownload className="h-5 w-5" />
                  Download installer
                </a>
                <a
                  href={assetUrl(release, EXE_PORTABLE_ASSET)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line px-6 py-3 font-semibold text-snow transition hover:border-primary/60"
                >
                  Portable EXE
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-6">
          <a
            href={latestPage}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line px-6 py-4 text-sm text-fog transition hover:border-accent/50 hover:text-snow"
          >
            <FileCheck2 className="h-4 w-4" />
            Verify SHA-256 checksums and older versions on the releases page
          </a>
        </Reveal>
      </div>
    </section>
  );
}
