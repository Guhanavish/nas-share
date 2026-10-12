import { Link } from "react-router-dom";
import { Smartphone, MonitorDown, Tv, RefreshCw, LifeBuoy } from "lucide-react";
import { Reveal } from "../components/ui";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";

const guides = [
  {
    icon: Smartphone,
    title: "Pair phone ↔ PC",
    steps: [
      "Start both apps on the same WiFi (relay covers you anywhere else).",
      "On the PC open Shared Folders → Pair Device. A code like K7M2-Q9XD appears.",
      "On the phone tap the QR icon → Enter Code → type it → Connect & Pair.",
      "Open Pool. Both devices' files are now in one list.",
    ],
  },
  {
    icon: Tv,
    title: "Pair with Google TV",
    steps: [
      "Install the same APK on the TV. It appears in the Leanback launcher.",
      "Show the code on the TV (large QR, readable from the couch).",
      "Scan it with your phone camera or type the code on the phone.",
      "Browse with the remote: arrows move, OK opens, Back goes up.",
    ],
  },
  {
    icon: MonitorDown,
    title: "Windows first run",
    steps: [
      "Run the installer (or portable EXE). Allow the firewall prompt for port 8743.",
      "Pick folders in Shared Folders. The tray icon pulses while serving.",
      "Keep WebView2 updated, since the UI renders on it.",
      "Logs live at %AppData%/nas-share/nas.log if anything misbehaves.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Sync & resume",
    steps: [
      "Enable Automatic Background Backup in Sync on the phone.",
      "Interrupted transfers resume from the last byte on next attempt.",
      "Conflicts keep both copies. Nothing is ever silently overwritten.",
      "Relay transfers are slower than LAN; the Pool badge tells you which.",
    ],
  },
  {
    icon: LifeBuoy,
    title: "Troubleshooting",
    steps: [
      "Device not found? Same WiFi, mDNS allowed, or check relay presence.",
      "Download stuck? The source went offline, so its section greys out.",
      "Code expired? Codes live 5 minutes; generate a fresh one.",
      "Pairing rejected? After 5 wrong tries the room rate-limits for a minute.",
    ],
  },
];

export function Docs() {
  useMeta({
    title: "Setup Docs | Nasend",
    description: "Pair phone with PC, set up Google TV, run the Windows app, sync with resume, and fix common issues. Five short guides.",
    path: "/docs",
  });

  return (
    <div className="mx-auto max-w-4xl px-5 pt-28 pb-24">
      <Breadcrumbs trail={[{ label: "Docs" }]} />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">docs</p>
      <h1 className="font-display mt-3 text-4xl font-bold">Setup in two minutes</h1>
      <p className="mt-2 text-fog">Five guides. No account creation anywhere in them.</p>
      <p className="mt-4 text-sm text-fog">
        Grab the builds first on the{" "}
        <Link to="/#download" className="underline hover:text-snow">
          download section
        </Link>
        , then come back here.
      </p>
      <div className="space-y-5">
        {guides.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.05}>
            <div className="rounded-3xl border border-line bg-panel p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <g.icon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-semibold">{g.title}</h2>
              </div>
              <ol className="mt-4 space-y-2.5">
                {g.steps.map((s, n) => (
                  <li key={n} className="flex gap-3 text-sm leading-relaxed text-fog">
                    <span className="font-mono text-accent">{String(n + 1).padStart(2, "0")}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
