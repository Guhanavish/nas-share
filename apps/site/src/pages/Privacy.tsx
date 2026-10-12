import { Link } from "react-router-dom";
import { Reveal } from "../components/ui";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";

const rows: [string, string][] = [
  ["Accounts", "We offer none, so we hold no usernames, emails, or passwords."],
  ["Site analytics", "This site runs no first-party analytics or tracking pixels."],
  ["Downloads", "Files are served by GitHub Releases. GitHub may log downloads under its own policy."],
  ["Signaling metadata", "When apps pair or relay, the Cloudflare Worker sees room codes, device IDs, and IP-level connection data. It never receives file contents and stores no files."],
  ["On-device data", "Paired device keys, shared folder lists, and sync state live only on your hardware, in app-private storage."],
  ["Cookies", "This site sets no cookies of its own. Embedded GitHub links follow GitHub's cookie policy."],
  ["Children", "Nothing here targets children, and we knowingly collect nothing from anyone."],
  ["Deletion", "There is nothing to delete server-side. Unpair a device in-app to revoke its keys locally."],
];

export function Privacy() {
  useMeta({
    title: "Privacy Policy | Nasend",
    description: "Nasend privacy: no accounts, no analytics, no file storage. What little metadata exists and where it lives.",
    path: "/privacy",
  });

  return (
    <div className="mx-auto max-w-3xl px-5 pt-28 pb-24">
      <Breadcrumbs trail={[{ label: "Privacy" }]} />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">privacy</p>
      <h1 className="font-display mt-3 text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-2 font-mono text-xs text-fog">Last revised: October 2026</p>
      <Reveal className="mt-8">
        <div className="overflow-hidden rounded-2xl border border-line">
          {rows.map(([k, v], i) => (
            <div
              key={k}
              className={`grid gap-1 px-6 py-4 sm:grid-cols-[180px_1fr] sm:gap-4 ${
                i % 2 === 0 ? "bg-panel" : "bg-card"
              }`}
            >
              <p className="font-display text-sm font-semibold">{k}</p>
              <p className="text-sm leading-relaxed text-fog">{v}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <p className="mt-8 text-sm text-fog">
        Plain version: your files never leave your devices except to reach your
        own other devices.{" "}
        <Link to="/terms" className="underline hover:text-snow">
          Read the terms too
        </Link>
        .
      </p>
    </div>
  );
}
