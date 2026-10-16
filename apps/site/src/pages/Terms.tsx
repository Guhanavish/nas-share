import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, FileText } from "lucide-react";
import { Reveal } from "../components/ui";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";

interface Section {
  kanji: string;
  num: string;
  h: string;
  p: string;
}

const sections: Section[] = [
  {
    kanji: "本旨",
    num: "01",
    h: "What this site is",
    p: "This site distributes Nasend, a free MIT-licensed sovereign storage ecosystem that turns your own physical devices into a private, resilient mesh. Downloads are distributed via cryptographic GitHub Releases. We sell no tokens, process zero payments, and bill zero subscriptions.",
  },
  {
    kanji: "無追",
    num: "02",
    h: "Zero Telemetry / What we collect",
    p: "Nothing. This static site sets zero tracking cookies, runs no invasive analytics, and stores zero personal identifiers. When you initiate a download, GitHub's global CDN delivers the signed binary under GitHub's standard distribution terms.",
  },
  {
    kanji: "主権",
    num: "03",
    h: "Device Sovereignty & Cryptographic Keys",
    p: "Your files never touch external clouds or relay servers. Pairing codes are CSPRNG Crockford Base32 tokens that expire after 5 minutes and burn instantly upon handshake. Device identities are Ed25519 public keys pinned strictly on your local hardware. The Cloudflare signaling Worker relays only ephemeral WebRTC SDP metadata and never observes cleartext byte streams.",
  },
  {
    kanji: "免責",
    num: "04",
    h: "MIT License & Warranty Disclaimer",
    p: "The software is provided 'as is', without warranty of any kind, express or implied, pursuant to the MIT License. Always maintain independent cold backups of mission-critical files before continuous folder synchronization.",
  },
  {
    kanji: "規律",
    num: "05",
    h: "Acceptable Use & Local Revocation",
    p: "Do not utilize Nasend to distribute materials you do not possess legal rights to transfer, nor attempt unauthorized peering against foreign nodes. You maintain unilateral authority to instantly revoke any previously trusted device fingerprint directly in-app.",
  },
  {
    kanji: "更新",
    num: "06",
    h: "Amendments",
    p: "If these covenants undergo material revisions, updated terms will be published with an updated timestamp and signed git commit.",
  },
];

export function Terms() {
  useMeta({
    title: "Terms and Conditions | 影 KAGE — Nasend",
    description: "Terms of sovereign mesh usage: free MIT license, zero subscription, device-local keys, and absolute privacy.",
    path: "/terms",
  });

  return (
    <div className="mx-auto max-w-4xl px-5 pt-32 pb-28">
      <Breadcrumbs trail={[{ label: "Terms" }]} />

      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-vermilion/30 bg-vermilion/10 px-3 py-1 font-mono text-[10px] tracking-[0.25em] text-vermilion uppercase">
          03 // 条 TERMS & COVENANTS
        </span>
        <span className="font-mono text-xs text-fog">MIT LICENSE 2026</span>
      </div>

      <h1 className="font-display mt-4 text-4xl font-black tracking-tight text-snow sm:text-5xl">
        The Sovereign Covenant
      </h1>
      <p className="mt-3 max-w-2xl text-base text-fog">
        Plain, honest terms for using Nasend. No hidden clauses, no data monetization,
        and no custody over your bytes.
      </p>

      <div className="mt-10 space-y-5">
        {sections.map((s) => (
          <Reveal key={s.num}>
            <section className="kage-card rounded-2xl p-6 transition-all hover:border-vermilion/40 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-vermilion">
                    第 {s.num} 条
                  </span>
                  <h2 className="font-display text-lg font-bold text-snow">
                    {s.h}
                  </h2>
                </div>
                <span className="rounded border border-line px-2 py-0.5 font-mono text-[10px] tracking-widest text-fog">
                  {s.kanji}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-fog">{s.p}</p>
            </section>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card/40 p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-vermilion" />
          <div>
            <p className="text-sm font-semibold text-snow">Ready to inspect the wire protocol?</p>
            <p className="text-xs text-fog">Explore our formal RPC schema, packet layout, and encryption pipeline.</p>
          </div>
        </div>
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 rounded-xl border border-vermilion/40 bg-vermilion/10 px-4 py-2 font-mono text-xs font-semibold text-snow transition hover:bg-vermilion hover:text-ink"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Read Protocol Docs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
