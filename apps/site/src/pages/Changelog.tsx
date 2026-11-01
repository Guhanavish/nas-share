import { useEffect, useState } from "react";
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
import { Reveal } from "../components/motion/Reveal";
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
        <p key={i} className="font-display mt-3 font-semibold text-[#F2F3F0]">
          {line.replace(/^#{1,3}\s/, "")}
        </p>
      );
    if (/^[-*]\s/.test(line))
      return (
        <li key={i} className="ml-4 list-disc text-sm text-[#929690]">
          {line.replace(/^[-*]\s/, "")}
        </li>
      );
    if (!line.trim()) return null;
    return (
      <p key={i} className="text-sm text-[#929690]">
        {line}
      </p>
    );
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading releases">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-[#343934] bg-[#1B1D1B] p-7">
          <div className="h-6 w-32 rounded-full bg-[#252825]" />
          <div className="mt-4 h-4 w-full rounded bg-[#252825]" />
          <div className="mt-2 h-4 w-4/5 rounded bg-[#252825]" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-28 rounded-xl bg-[#252825]" />
            <div className="h-8 w-28 rounded-xl bg-[#252825]" />
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
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10&page=1`
        );
        if (!active) return;
        if (res.status === 404) {
          setStatus("empty");
          setHasMore(false);
          return;
        }
        if (!res.ok) {
          setStatus("server");
          return;
        }
        const json: unknown = await res.json();
        const list = Array.isArray(json) ? json.map((j) => mapRelease(j as Record<string, unknown>)) : [];
        if (!active) return;
        setReleases(list);
        setPage(1);
        setHasMore(list.length === 10);
        setStatus(list.length === 0 ? "empty" : "ready");
      } catch {
        if (active) setStatus("network");
      }
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10&page=${nextPage}`
      );
      if (res.ok) {
        const json: unknown = await res.json();
        const list = Array.isArray(json) ? json.map((j) => mapRelease(j as Record<string, unknown>)) : [];
        setReleases((prev) => [...prev, ...list]);
        setPage(nextPage);
        setHasMore(list.length === 10);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  };

  const retry = () => {
    setStatus("loading");
    setReleases([]);
    setPage(1);
    setHasMore(true);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pt-28 pb-24 text-[#F2F3F0]">
      <Breadcrumbs trail={[{ label: "Changelog" }]} />
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#343934] bg-[#1B1D1B] px-3 py-1 font-mono text-[11px] text-[#A3B899] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3B899]" />
          <span>Release History</span>
        </span>
      </div>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-[#F2F3F0] sm:text-5xl">
        Changelog
      </h1>
      <p className="mt-2 text-sm text-[#929690]">
        Releases and native binary assets published directly from the GitHub repository.
      </p>

      <div className="mt-8">
        {status === "loading" && <LoadingSkeleton />}

        {status === "network" && (
          <div className="rounded-2xl border border-[#343934] bg-[#1B1D1B] p-10 text-center space-y-3">
            <WifiOff className="mx-auto h-8 w-8 text-rose-400" />
            <h2 className="font-display text-xl font-semibold text-[#F2F3F0]">
              Can't reach GitHub
            </h2>
            <p className="mx-auto max-w-sm text-xs sm:text-sm text-[#929690]">
              Check your network connection. Your installed apps continue working normally offline.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-2 rounded-xl bg-[#A3B899] px-5 py-2.5 font-mono text-xs font-semibold text-[#0C0D0C] hover:bg-[#B5C8AC] transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Try again</span>
              </button>
            </div>
          </div>
        )}

        {status === "server" && (
          <div className="rounded-2xl border border-[#343934] bg-[#1B1D1B] p-10 text-center space-y-3">
            <TriangleAlert className="mx-auto h-8 w-8 text-amber-400" />
            <h2 className="font-display text-xl font-semibold text-[#F2F3F0]">
              GitHub API Limit or Network Unavailable
            </h2>
            <p className="mx-auto max-w-sm text-xs sm:text-sm text-[#929690]">
              GitHub answered with an error. You can visit the official releases page directly.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-2 rounded-xl bg-[#A3B899] px-5 py-2.5 font-mono text-xs font-semibold text-[#0C0D0C] hover:bg-[#B5C8AC] transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Try again</span>
              </button>
              <a
                href={releasesPage}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[#343934] bg-[#252825] px-5 py-2.5 font-mono text-xs font-semibold text-[#F2F3F0] hover:border-[#414741] transition"
              >
                Releases on GitHub ↗
              </a>
            </div>
          </div>
        )}

        {status === "empty" && (
          <div className="rounded-2xl border border-[#343934] bg-[#1B1D1B] p-10 text-center text-sm text-[#929690] space-y-3">
            <p>No releases published yet. Watch the repository and check back soon.</p>
            <div>
              <Link
                to="/#download"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[#A3B899] hover:underline"
              >
                <span>Go to native downloads</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}

        {(status === "ready" || (status !== "loading" && releases.length > 0)) &&
          releases.length > 0 && (
            <div className="space-y-6">
              {releases.map((r, i) => (
                <Reveal key={`${r.tag}-${i}`} delay={Math.min(i, 3) * 0.04}>
                  <article className="rounded-2xl border border-[#343934] bg-[#1B1D1B] p-7 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5 rounded-full bg-[#252825] border border-[#343934] px-3 py-1 font-mono text-xs text-[#A3B899]">
                        <Tag className="h-3 w-3" />
                        {r.tag}
                      </span>
                      {i === 0 && page === 1 && (
                        <span className="rounded-full bg-[#A3B899]/15 border border-[#A3B899]/30 px-3 py-1 font-mono text-xs text-[#A3B899]">
                          latest
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 font-mono text-xs text-[#929690]">
                        <CalendarDays className="h-3 w-3" />
                        {r.publishedAt
                          ? new Date(r.publishedAt).toLocaleDateString()
                          : "unpublished"}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm text-[#929690]">
                      {renderBody(r.body || "No release notes provided.")}
                    </div>
                    {r.assets.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {r.assets.map((a) => (
                          <a
                            key={a.name}
                            href={a.url}
                            download={a.name}
                            className="flex items-center gap-1.5 rounded-xl border border-[#343934] bg-[#252825] px-3 py-1.5 font-mono text-xs text-[#929690] transition hover:border-[#A3B899] hover:text-[#F2F3F0]"
                          >
                            <Download className="h-3 w-3 text-[#A3B899]" />
                            <span>{a.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </article>
                </Reveal>
              ))}

              <p className="text-center font-mono text-xs text-[#929690]">
                showing {releases.length}
                {hasMore ? " · more below" : " · that's everything"}
              </p>

              {hasMore && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-xl border border-[#343934] bg-[#252825] px-6 py-2.5 font-mono text-xs font-semibold text-[#F2F3F0] transition hover:border-[#414741] disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? "Loading…" : "Load older releases"}
                  </button>
                </div>
              )}
            </div>
          )}
      </div>

      <p className="mt-8 text-center text-xs font-mono text-[#929690]">
        <Link to="/" className="inline-flex items-center gap-2 hover:text-[#F2F3F0] transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </p>
    </div>
  );
}
