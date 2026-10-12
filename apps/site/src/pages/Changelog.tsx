import { Link } from "react-router-dom";
import { ArrowLeft, Tag, CalendarDays, Download } from "lucide-react";
import { Reveal, SectionHead } from "../components/ui";
import { releasesPage, type ReleaseInfo } from "../lib/site";

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

export function Changelog({ releases }: { releases: ReleaseInfo[] }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-32 pb-24">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-fog hover:text-snow">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
      <SectionHead
        eyebrow="changelog"
        title="What shipped"
        sub="Every release, straight from GitHub."
      />

      {releases.length === 0 ? (
        <Reveal>
          <div className="rounded-3xl border border-dashed border-line p-10 text-center text-sm text-fog">
            No releases published yet — or the repo slug isn't set.
            <br />
            Set <span className="font-mono text-accent">VITE_GITHUB_REPO</span> to
            owner/repo and publish your first Release.
          </div>
        </Reveal>
      ) : (
        <div className="space-y-5">
          {releases.map((r, i) => (
            <Reveal key={r.tag} delay={i * 0.04}>
              <article className="rounded-3xl border border-line bg-panel p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-mono text-xs text-primary">
                    <Tag className="h-3 w-3" />
                    {r.tag}
                  </span>
                  {i === 0 && (
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
                <div className="mt-3 space-y-1.5">{renderBody(r.body || "_No notes._")}</div>
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
        </div>
      )}

      <p className="mt-8 text-center text-sm text-fog">
        <a href={releasesPage} target="_blank" rel="noreferrer" className="underline hover:text-snow">
          All releases on GitHub
        </a>
      </p>
    </div>
  );
}
