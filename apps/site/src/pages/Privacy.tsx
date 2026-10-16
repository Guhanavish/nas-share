import { Link } from "react-router-dom";
import { Lock, EyeOff, ShieldAlert, ArrowRight, Download } from "lucide-react";
import { Reveal } from "../components/ui";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";

const privacyTable: Array<{ item: string; kanji: string; status: string; detail: string }> = [
  {
    item: "User Accounts",
    kanji: "無口座",
    status: "ZERO",
    detail: "We have no registration system, no emails, no phone numbers, and no passwords. The app exists as pure autonomous binary.",
  },
  {
    item: "Site Analytics",
    kanji: "無追跡",
    status: "NONE",
    detail: "This website embeds zero tracking scripts, zero marketing pixels, and zero third-party telemetry beacons.",
  },
  {
    item: "File Bytes",
    kanji: "非通過",
    status: "P2P ENCRYPTED",
    detail: "File contents flow exclusively over direct LAN sockets or DTLS-encrypted WebRTC DataChannels between your devices. No file bytes traverse any central server.",
  },
  {
    item: "Signaling Ephemerality",
    kanji: "瞬間揮発",
    status: "5-MIN TTL",
    detail: "The Cloudflare Worker Durable Object holds SDP offers/answers solely during handshake. Rooms hold a max of 2 sockets and are destroyed immediately upon pair or after 5 minutes.",
  },
  {
    item: "Cryptographic Keys",
    kanji: "端末保管",
    status: "HARDWARE-LOCAL",
    detail: "Ed25519 device identities and trusted fingerprint pins live in app-private SQLite/Room databases on your physical hardware.",
  },
  {
    item: "Cookies & Storage",
    kanji: "無痕跡",
    status: "ZERO COOKIES",
    detail: "No browser cookies are set by this website. Any preference changes are kept in volatile React state or local session.",
  },
  {
    item: "Data Deletion",
    kanji: "即時破棄",
    status: "CLIENT-AUTONOMOUS",
    detail: "There is nothing to delete on any server. Tap 'Revoke Device' in-app to purge that device's fingerprint from your local trusted mesh.",
  },
];

export function Privacy() {
  useMeta({
    title: "Privacy Policy | 影 KAGE — Nasend",
    description: "Cryptographic zero-knowledge privacy: no user accounts, no analytics, no file storage. All data stays on your physical devices.",
    path: "/privacy",
  });

  return (
    <div className="mx-auto max-w-4xl px-5 pt-32 pb-28">
      <Breadcrumbs trail={[{ label: "Privacy" }]} />

      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-vermilion/30 bg-vermilion/10 px-3 py-1 font-mono text-[10px] tracking-[0.25em] text-vermilion uppercase">
          04 // 隠 PRIVACY ARCHITECTURE
        </span>
        <span className="font-mono text-xs text-fog">ZERO CUSTODY</span>
      </div>

      <h1 className="font-display mt-4 text-4xl font-black tracking-tight text-snow sm:text-5xl">
        Cryptographic Privacy
      </h1>
      <p className="mt-3 max-w-2xl text-base text-fog">
        Privacy is not a promise made in legalese—it is an architectural impossibility to spy
        on your data because we never touch your keys or your bytes.
      </p>

      {/* Highlights */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="kage-card rounded-2xl p-5">
          <Lock className="h-6 w-6 text-vermilion" />
          <h3 className="font-display mt-3 text-base font-bold text-snow">End-to-End DTLS</h3>
          <p className="mt-1 text-xs leading-relaxed text-fog">
            All remote payloads are encrypted with authenticated DTLS 1.2/1.3 ciphersuites.
          </p>
        </div>
        <div className="kage-card rounded-2xl p-5">
          <EyeOff className="h-6 w-6 text-amber" />
          <h3 className="font-display mt-3 text-base font-bold text-snow">Blind Signaling</h3>
          <p className="mt-1 text-xs leading-relaxed text-fog">
            Cloudflare signaling relays SDP offers blind without inspecting or logging payloads.
          </p>
        </div>
        <div className="kage-card rounded-2xl p-5">
          <ShieldAlert className="h-6 w-6 text-moss" />
          <h3 className="font-display mt-3 text-base font-bold text-snow">Zero Cloud Custody</h3>
          <p className="mt-1 text-xs leading-relaxed text-fog">
            No R2 buckets, no S3 disks, no VPS filesystems. Everything stays in your physical realm.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <Reveal className="mt-10">
        <div className="kage-card overflow-hidden rounded-2xl">
          <div className="border-b border-line bg-card/60 px-6 py-4">
            <h2 className="font-display text-sm font-bold tracking-wider text-snow uppercase">
              Privacy Vectors & Commitments
            </h2>
          </div>
          <div className="divide-y divide-line/60">
            {privacyTable.map((row) => (
              <div
                key={row.item}
                className="grid gap-2 px-6 py-4 transition hover:bg-white/[0.02] sm:grid-cols-[180px_130px_1fr] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-snow">{row.item}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded border border-line bg-surface/40 px-2 py-0.5 font-mono text-[10px] text-fog">
                    {row.kanji}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-vermilion">
                    {row.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs leading-relaxed text-fog">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Footer navigation */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card/40 p-6">
        <div>
          <p className="text-sm font-semibold text-snow">Ready to establish your sovereign mesh?</p>
          <p className="text-xs text-fog">Download the signed binaries and pair your first node in 30 seconds.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/terms"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-fog hover:text-snow"
          >
            <span>Read Terms</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/#chapter-05"
            className="inline-flex items-center gap-2 rounded-xl border border-vermilion/40 bg-vermilion/10 px-4 py-2 font-mono text-xs font-semibold text-snow transition hover:bg-vermilion hover:text-ink"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Get Downloads</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
