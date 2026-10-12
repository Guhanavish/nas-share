import { useEffect } from "react";
import {
  Layers,
  QrCode,
  Tv,
  CloudOff,
  PlayCircle,
  RefreshCw,
  Lock,
  Zap,
} from "lucide-react";
import { Reveal, SectionHead } from "./ui";

const features = [
  {
    icon: Layers,
    title: "One Pool section",
    body: "Every trusted device's files merged into a single list with device badges. Same file on two devices? Two tagged rows — no silent dedupe.",
  },
  {
    icon: QrCode,
    title: "8-character pairing",
    body: "Crockford Base32 codes like K7M2-Q9XD. Single-use, 5-minute expiry, SHA-256 commit check. No email, no login.",
  },
  {
    icon: Tv,
    title: "TV-remote ready",
    body: "One universal APK for phone, tablet and Google TV. Full D-pad focus halos, 10-foot type, real scannable QR codes.",
  },
  {
    icon: CloudOff,
    title: "Offline, greyed",
    body: "Dead devices stay visible but dimmed and untappable. Back online and the section lights up — no re-pairing.",
  },
  {
    icon: PlayCircle,
    title: "Stream with seek",
    body: "Range-request playback jumps straight to any timestamp. Thumbnails on demand. 500 MB videos seek instantly.",
  },
  {
    icon: RefreshCw,
    title: "Sync & backup",
    body: "Folder sync with resume and keep-both conflicts. Kill the app mid-transfer and pick up at the same byte.",
  },
  {
    icon: Lock,
    title: "Pinned identities",
    body: "Ed25519 keys pinned on first trust. Revoke any device in one tap. Path-traversal guard and per-share ACLs.",
  },
  {
    icon: Zap,
    title: "LAN first, relay fallback",
    body: "Direct HTTP on WiFi, Worker-relayed FileProto anywhere else. Pool badges every row LAN or Relay so you know.",
  },
];

function spotlight(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export function Features() {
  useEffect(() => {
    document.documentElement.classList.add("spot-on");
    return () => document.documentElement.classList.remove("spot-on");
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <SectionHead
        eyebrow="features"
        title="Everything a NAS does. None of what it costs."
        sub="No box to buy, no account to make, no subscription to forget."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={(i % 4) * 0.07}>
            <div
              onMouseMove={spotlight}
              className="spot-card h-full rounded-2xl border border-line bg-card p-6 transition hover:-translate-y-1 hover:border-primary/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
