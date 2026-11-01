import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, FileText } from "lucide-react";
import { Reveal } from "../components/motion/Reveal";
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
    p: "This site distributes Nasend, a free MIT-licensed ecosystem that turns your own physical devices into a private, resilient mesh. Downloads are distributed via GitHub Releases. We sell no tokens, process zero payments, and bill zero subscriptions.",
  },
  {
    kanji: "無追",
    num: "02",
    h: "Data Collection & Telemetry",
    p: "Nothing. This static site sets zero tracking cookies, runs no invasive analytics, and stores zero personal identifiers. When you initiate a download, GitHub's global CDN delivers the binary under GitHub's standard distribution terms.",
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
    p: "The software is provided 'as is', without warranty of any kind, express or implied, pursuant to the MIT License. Always maintain independent backups of mission-critical files before continuous folder synchronization.",
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
    p: "If these terms undergo material revisions, updated terms will be published with an updated timestamp in the repository commit history.",
  },
];

export function Terms() {
  useMeta({
    title: "Terms and Conditions — Nasend",
    description: "Terms of sovereign mesh usage: free MIT license, zero subscription, device-local keys, and absolute privacy.",
    path: "/terms",
  });

  return (
    <div className="mx-auto max-w-4xl px-5 pt-32 pb-28 text-[#F2F3F0]">
      <Breadcrumbs trail={[{ label: "Terms" }]} />

      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#343934] bg-[#1B1D1B] px-3 py-1 font-mono text-[11px] text-[#A3B899] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3B899]" />
          <span>Terms &amp; License</span>
        </span>
        <span className="font-mono text-xs text-[#929690]">MIT LICENSE</span>
      </div>

      <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-[#F2F3F0] sm:text-5xl">
        Terms of Service
      </h1>
      <p className="mt-3 max-w-2xl text-base text-[#929690]">
        Plain, honest terms for using Nasend. No hidden clauses, no data monetization,
        and no custody over your bytes.
      </p>

      <div className="mt-10 space-y-5">
        {sections.map((s) => (
          <Reveal key={s.num}>
            <section className="rounded-2xl border border-[#343934] bg-[#1B1D1B] p-6 transition-colors hover:border-[#414741] sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#A3B899]">
                    Section {s.num}
                  </span>
                  <h2 className="font-display text-lg font-semibold text-[#F2F3F0]">
                    {s.h}
                  </h2>
                </div>
                <span className="rounded border border-[#343934] bg-[#252825] px-2 py-0.5 font-mono text-[10px] tracking-widest text-[#929690]">
                  {s.kanji}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#929690]">{s.p}</p>
            </section>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#343934] bg-[#1B1D1B] p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-[#A3B899]" />
          <div>
            <p className="text-sm font-semibold text-[#F2F3F0]">Inspect the documentation</p>
            <p className="text-xs text-[#929690]">Read the setup guide, network ports, and sync instructions.</p>
          </div>
        </div>
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 rounded-xl bg-[#A3B899] text-[#0C0D0C] px-4 py-2 font-mono text-xs font-semibold hover:bg-[#B5C8AC] transition"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Read Documentation</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
