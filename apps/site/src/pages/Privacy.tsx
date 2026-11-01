import { Link } from "react-router-dom";
import { Lock, EyeOff, ShieldAlert, ArrowRight, Download } from "lucide-react";
import { Reveal } from "../components/motion/Reveal";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";

const privacyTable: Array<{ item: string; kanji: string; status: string; detail: string }> = [
  {
    item: "User Accounts",
    kanji: "無口座",
    status: "ZERO",
    detail: "No registration system, no emails, no phone numbers, and no passwords. The app exists as pure autonomous binaries.",
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
    detail: "No tracking cookies are set by this website. Any preference changes are kept in volatile React state or local session.",
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
    title: "Privacy Policy — Nasend",
    description: "Cryptographic zero-knowledge privacy: no user accounts, no analytics, no file storage. All data stays on your physical devices.",
    path: "/privacy",
  });

  return (
    <div className="mx-auto max-w-4xl px-5 pt-32 pb-28 text-[#F2F3F0]">
      <Breadcrumbs trail={[{ label: "Privacy" }]} />

      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#343934] bg-[#1B1D1B] px-3 py-1 font-mono text-[11px] text-[#A3B899] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3B899]" />
          <span>Privacy Architecture</span>
        </span>
        <span className="font-mono text-xs text-[#929690]">ZERO CUSTODY</span>
      </div>

      <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-[#F2F3F0] sm:text-5xl">
        Cryptographic Privacy
      </h1>
      <p className="mt-3 max-w-2xl text-base text-[#929690]">
        Privacy is not a promise made in legalese—it is an architectural guarantee because
        servers never touch your keys or your file contents.
      </p>

      {/* Highlights */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#343934] bg-[#1B1D1B] p-5 space-y-2">
          <Lock className="h-6 w-6 text-[#A3B899]" />
          <h3 className="font-display text-base font-semibold text-[#F2F3F0]">Direct DTLS</h3>
          <p className="text-xs leading-relaxed text-[#929690]">
            All remote payloads are encrypted with authenticated DTLS ciphersuites directly between peers.
          </p>
        </div>
        <div className="rounded-2xl border border-[#343934] bg-[#1B1D1B] p-5 space-y-2">
          <EyeOff className="h-6 w-6 text-[#A3B899]" />
          <h3 className="font-display text-base font-semibold text-[#F2F3F0]">Blind Signaling</h3>
          <p className="text-xs leading-relaxed text-[#929690]">
            Cloudflare signaling relays SDP offers blind without inspecting, storing, or logging payloads.
          </p>
        </div>
        <div className="rounded-2xl border border-[#343934] bg-[#1B1D1B] p-5 space-y-2">
          <ShieldAlert className="h-6 w-6 text-[#A3B899]" />
          <h3 className="font-display text-base font-semibold text-[#F2F3F0]">Zero Cloud Storage</h3>
          <p className="text-xs leading-relaxed text-[#929690]">
            No cloud buckets, no third-party disks, no central filesystems. Files stay entirely in your physical devices.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <Reveal className="mt-10">
        <div className="rounded-2xl border border-[#343934] bg-[#1B1D1B] overflow-hidden">
          <div className="border-b border-[#343934] bg-[#252825] px-6 py-4">
            <h2 className="font-display text-sm font-semibold tracking-wider text-[#F2F3F0] uppercase">
              Privacy Vectors &amp; Commitments
            </h2>
          </div>
          <div className="divide-y divide-[#343934]">
            {privacyTable.map((row) => (
              <div
                key={row.item}
                className="grid gap-2 px-6 py-4 transition hover:bg-[#252825]/50 sm:grid-cols-[180px_130px_1fr] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="font-display text-sm font-medium text-[#F2F3F0]">{row.item}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded border border-[#343934] bg-[#252825] px-2 py-0.5 font-mono text-[10px] text-[#929690]">
                    {row.kanji}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-[#A3B899]">
                    {row.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs leading-relaxed text-[#929690]">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Footer navigation */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#343934] bg-[#1B1D1B] p-6">
        <div>
          <p className="text-sm font-medium text-[#F2F3F0]">Ready to connect your devices?</p>
          <p className="text-xs text-[#929690]">Download the binaries or try the transfer demo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/terms"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#929690] hover:text-[#F2F3F0] transition"
          >
            <span>Read Terms</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/#download"
            className="inline-flex items-center gap-2 rounded-xl bg-[#A3B899] text-[#0C0D0C] px-4 py-2 font-mono text-xs font-semibold hover:bg-[#B5C8AC] transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Get Downloads</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
