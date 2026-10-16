import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  CalendarDays,
  Download,
  TriangleAlert,
  WifiOff,
  RotateCcw,
} from "lucide-react";
import { Reveal } from "../components/ui";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";
import { GITHUB_REPO, releasesPage, type ReleaseInfo } from "../lib/site";

function mapRelease(json: Record<string, unknown>): ReleaseInfo {
  const assets = ((json.assets ?? []) as Record<string, unknown>[]).map((a) => ({
    name: String(a.name ?? ""),
    size: Number(a.size ?? 0),
    downloads: Number(a.download_count ?? 0),
    url: String(a.browser_download_url ?? ""),
  }));
  return {
    tag: String(json.tag_name ?? "?"),
    name: String(json.name ?? json.tag_name ?? "Release"),
    body: String(json.body ?? ""),
    publishedAt: String(json.published_at ?? ""),
    assets,
    url: String(json.html_url ?? ""),
  };
}

type Status = "loading" | "ready" | "empty" | "network" | "server";

function renderBody(body: string) {
  return body.split("\n").map((line, i) => {
    if (/^#{1,3}\s/.test(line))
      return (
        <p key={i} className="font-display mt-3 font-semibold text-snow">
          {line.replace(/^#{1,3}\s/, "")}
        </p>
      );
    if (/^[-*]\s/.test(line))
      return (
        <li key={i} className="ml-4 list-disc text-sm text-fog">
          {line.replace(/^[-*]\s/, "")}
        </li>
      );
    if (!line.trim()) return null;
    return (
      <p key={i} className="text-sm text-fog">
        {line}
      </p>
    );
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading releases">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse rounded-3xl border border-line bg-panel p-7">
          <div className="h-6 w-32 rounded-full bg-card" />
          <div className="mt-4 h-4 w-full rounded bg-card" />
          <div className="mt-2 h-4 w-4/5 rounded bg-card" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-28 rounded-xl bg-card" />
            <div className="h-8 w-28 rounded-xl bg-card" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Changelog() {
  useMeta({
    title: "Changelog | Nasend",
    description: "Every Nasend release: pooled sections, relay fallback, TV support. Version history with APK and EXE downloads.",
    path: "/changelog",
  });

  const [releases, setReleases] = useState<ReleaseInfo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [status, setStatus] = useState<Status>("loading");

  const fetchPage = useCallback(async (p: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setStatus("loading");
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10&page=${p}`
      );
      if (res.status === 404) {
        setStatus("empty");
        setHasMore(false);
        return;
      }
      if (!res.ok) {
        setStatus(append ? "ready" : "server");
        return;
      }
      const json: unknown = await res.json();
      const list = Array.isArray(json) ? json.map((j) => mapRelease(j)) : [];
      setReleases((prev) => (append ? [...prev, ...list] : list));
      setPage(p);
      setHasMore(list.length === 10);
      setStatus(list.length === 0 && !append ? "empty" : "ready");
    } catch {
      // fetch throws TypeError on connectivity loss: show the network state
      setStatus(append ? "ready" : "network");
    } finally {
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const retry = () => {
    setReleases([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, false);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pt-28 pb-24">
      <Breadcrumbs trail={[{ label: "Changelog" }]} />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-vermilion">02 // 歴 CHANGELOG</p>
      <h1 className="font-display mt-3 text-4xl font-extrabold text-snow sm:text-5xl">Release History</h1>
      <p className="mt-2 text-fog">Live releases directly from the GitHub repository.</p>

      <div className="mt-8">
        {status === "loading" && <LoadingSkeleton />}

        {status === "network" && (
          <div className="kage-card rounded-3xl p-10 text-center">
            <WifiOff className="mx-auto h-8 w-8 text-warn" />
            <h2 className="font-display mt-4 text-xl font-semibold text-snow">Can't reach GitHub</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-fog">
              Check your network connection. Your installed apps continue working normally offline.
            </p>
            <button
              onClick={retry}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-vermilion px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:bg-vermilion/90"
            >
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          </div>
        )}

        {status === "server" && (
          <div className="kage-card rounded-3xl p-10 text-center">
            <TriangleAlert className="mx-auto h-8 w-8 text-warn" />
            <h2 className="font-display mt-4 text-xl font-semibold text-snow">API Limit or Temporary Server Hiccup</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-fog">
              GitHub answered with an error. You can visit the official releases page directly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={retry}
                className="inline-flex items-center gap-2 rounded-2xl bg-vermilion px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:bg-vermilion/90"
              >
                <RotateCcw className="h-4 w-4" /> Try again
              </button>
              <a
                href={releasesPage}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-line bg-card px-6 py-3 font-semibold text-snow hover:border-white/20"
              >
                Releases on GitHub
              </a>
            </div>
          </div>
        )}

        {status === "empty" && (
          <div className="kage-card rounded-3xl p-10 text-center text-sm text-fog">
            No releases published yet. Watch the repository and check back soon.
            <br />
            <Link to="/#chapter-05" className="mt-3 inline-block text-vermilion underline hover:text-snow">
              Back to Sovereign Vault Downloads
            </Link>
          </div>
        )}

        {(status === "ready" || (status !== "loading" && releases.length > 0)) &&
          releases.length > 0 && (
            <div className="space-y-6">
              {releases.map((r, i) => (
                <Reveal key={`${r.tag}-${i}`} delay={Math.min(i, 3) * 0.04}>
                  <article className="kage-card rounded-3xl p-7">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-mono text-xs text-primary">
                        <Tag className="h-3 w-3" />
                        {r.tag}
                      </span>
                      {i === 0 && page === 1 && (
                        <span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-xs text-accent">
                          latest
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 font-mono text-xs text-fog">
                        <CalendarDays className="h-3 w-3" />
                        {r.publishedAt
                          ? new Date(r.publishedAt).toLocaleDateString()
                          : "unpublished"}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5">{renderBody(r.body || "No notes for this one.")}</div>
                    {r.assets.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {r.assets.map((a) => (
                          <a
                            key={a.name}
                            href={a.url}
                            className="flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-1.5 font-mono text-xs text-fog transition hover:border-primary/60 hover:text-snow"
                          >
                            <Download className="h-3 w-3" />
                            {a.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </article>
                </Reveal>
              ))}

              <p className="text-center font-mono text-xs text-fog">
                showing {releases.length}
                {hasMore ? " · more below" : " · that's everything"}
              </p>

              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={() => fetchPage(page + 1, true)}
                    disabled={loadingMore}
                    className="rounded-2xl border border-line bg-card px-6 py-3 font-semibold text-snow transition enabled:hover:border-primary/60 disabled:opacity-50"
                  >
                    {loadingMore ? "Loading…" : "Load older releases"}
                  </button>
                </div>
              )}
            </div>
          )}
      </div>

      <p className="mt-8 text-center text-sm text-fog">
        <Link to="/" className="inline-flex items-center gap-2 hover:text-snow">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </p>
    </div>
  );
}
