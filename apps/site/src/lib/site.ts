import { useEffect, useState } from "react";

export const SITE_URL = "https://nasend.vercel.app";

/**
 * ONE-LINE SETUP: after creating the GitHub repo + first Release, set this
 * to "owner/repo" (or VITE_GITHUB_REPO env at build time). Everything
 * follows automatically: download buttons, version badge, changelog.
 */
export const GITHUB_REPO =
  (import.meta.env.VITE_GITHUB_REPO as string | undefined)?.trim() || "Guhanavish/nas-share";

export const SIGNALING_URL =
  (import.meta.env.VITE_SIGNALING_URL as string | undefined)?.trim() ?? "";

export const APK_ASSET = "app-release.apk";
export const EXE_SETUP_ASSET = "NAS-Share-setup.exe";
export const EXE_PORTABLE_ASSET = "nas-share-desktop.exe";

export const releasesPage = `https://github.com/${GITHUB_REPO}/releases`;
export const latestPage = `https://github.com/${GITHUB_REPO}/releases/latest`;

export interface ReleaseAsset {
  name: string;
  size: number;
  downloads: number;
  url: string;
  digest?: string;
}

export interface ReleaseInfo {
  tag: string;
  name: string;
  body: string;
  publishedAt: string;
  assets: ReleaseAsset[];
  url: string;
}

export type ReleaseStatus = "loading" | "ok" | "none" | "error";

export interface LatestReleaseResult {
  status: ReleaseStatus;
  release: ReleaseInfo | null;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

function mapRelease(json: Record<string, unknown>): ReleaseInfo {
  const assets = ((json.assets ?? []) as Record<string, unknown>[]).map((a) => ({
    name: String(a.name ?? ""),
    size: Number(a.size ?? 0),
    downloads: Number(a.download_count ?? 0),
    url: String(a.browser_download_url ?? ""),
    digest: a.digest ? String(a.digest) : undefined,
  }));
  return {
    tag: String(json.tag_name ?? ""),
    name: String(json.name ?? json.tag_name ?? "Release"),
    body: String(json.body ?? ""),
    publishedAt: String(json.published_at ?? ""),
    assets,
    url: String(json.html_url ?? ""),
  };
}

export function assetUrl(release: ReleaseInfo | null, name: string): string {
  const hit = release?.assets.find((a) => a.name === name);
  return hit?.url ?? latestPage;
}

/** Live release metadata with honest status */
export function useLatestRelease(): LatestReleaseResult {
  const [result, setResult] = useState<LatestReleaseResult>({
    status: "loading",
    release: null,
  });

  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
      .then((r) => {
        if (r.status === 404) {
          if (alive) setResult({ status: "none", release: null });
          return null;
        }
        if (!r.ok) {
          if (alive) setResult({ status: "error", release: null });
          return null;
        }
        return r.json();
      })
      .then((j) => {
        if (alive && j) {
          setResult({ status: "ok", release: mapRelease(j) });
        }
      })
      .catch(() => {
        if (alive) {
          setResult({ status: "error", release: null });
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  return result;
}

/** Full release history for /changelog, with graceful fallback. */
export function useAllReleases() {
  const [releases, setReleases] = useState<ReleaseInfo[]>([]);
  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=20`)
      .then((r) => (r.ok ? r.json() : []))
      .then((j) => {
        if (alive && Array.isArray(j)) setReleases(j.map(mapRelease));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return releases;
}
