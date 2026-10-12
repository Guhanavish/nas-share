import { Link } from "react-router-dom";
import { Reveal } from "../components/ui";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";

const sections = [
  {
    h: "What this site is",
    p: "This site distributes Nasend, a free MIT-licensed app that turns your own devices into private shared storage. Downloads come from GitHub Releases. We sell nothing and bill nothing.",
  },
  {
    h: "What we collect",
    p: "Almost nothing. This static site sets no accounts, runs no analytics of its own, and stores no personal data. If you open a download, GitHub serves the file under GitHub's own privacy terms.",
  },
  {
    h: "What the apps do with your data",
    p: "Your files stay on your devices. Pairing codes are single-use and expire in 5 minutes. Device identities are Ed25519 keys stored only on your own hardware. The Cloudflare signaling Worker sees room codes and connection metadata, never file contents, and keeps no file store.",
  },
  {
    h: "No warranties",
    p: "The software is provided as is, without warranty of any kind, per the MIT license. Back up anything you cannot afford to lose before syncing or updating.",
  },
  {
    h: "Acceptable use",
    p: "Do not use the apps to share content you have no right to share, or to probe devices you do not own. Revoke any device you no longer trust from the Trusted Devices list.",
  },
  {
    h: "Changes",
    p: "If these terms change materially, the new version will be posted here with the revision date below.",
  },
];

export function Terms() {
  useMeta({
    title: "Terms and Conditions | Nasend",
    description: "Terms for downloading and using Nasend: free MIT software, your files stay on your devices, no warranty.",
    path: "/terms",
  });

  return (
    <div className="mx-auto max-w-3xl px-5 pt-28 pb-24">
      <Breadcrumbs trail={[{ label: "Terms" }]} />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">terms</p>
      <h1 className="font-display mt-3 text-4xl font-bold">Terms and Conditions</h1>
      <p className="mt-2 font-mono text-xs text-fog">Last revised: October 2026</p>
      <div className="mt-8 space-y-6">
        {sections.map((s) => (
          <Reveal key={s.h}>
            <section className="rounded-2xl border border-line bg-panel p-6">
              <h2 className="font-display font-semibold">{s.h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-fog">{s.p}</p>
            </section>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-sm text-fog">
        Questions about these terms?{" "}
        <Link to="/docs" className="underline hover:text-snow">
          Start with the docs
        </Link>
        .
      </p>
    </div>
  );
}
