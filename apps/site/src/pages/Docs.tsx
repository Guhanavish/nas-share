import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";
import { GITHUB_REPO } from "../lib/site";

const guides = [
  {
    title: "1. Pair Phone ↔ Windows PC",
    steps: [
      "Ensure both devices are on the same Wi-Fi network (or connected to the internet for WebRTC WAN relay).",
      "On Windows, open Shared Folders → Pair Device. An 8-character Crockford code (e.g. K7M2-Q9XD) appears.",
      "On your Android phone, tap Enter Code or scan the camera QR code → Connect.",
      "Both devices verify the SHA-256 commit of the code and pin each other's Ed25519 public keys.",
    ],
  },
  {
    title: "2. Android TV Living Room Setup",
    steps: [
      "Install the universal APK on your Android TV or Google TV device via USB drive or ADB install.",
      "Launch Nasend from your Leanback TV launcher.",
      "Select 'Show QR' or generate a pairing code on the TV screen; pair from your phone or PC.",
      "Navigate shared remote PC video libraries using your TV remote D-Pad.",
    ],
  },
  {
    title: "3. Windows First Run & Firewall",
    steps: [
      "Launch nas-share-desktop.exe (portable standalone) or run Nasend-Setup.exe.",
      "Allow the Windows Firewall prompt for port 8743 to permit local TCP and mDNS traffic.",
      "Add directories to the Shared Folders table in the settings window.",
      "Closing the window keeps the server running silently in the background system tray.",
    ],
  },
  {
    title: "4. Two-Way Sync & Chunked Streaming",
    steps: [
      "Enable 'Automatic Sync' in the Sync screen on mobile to automatically mirror camera photos to your PC.",
      "Transfers stream in 16 KB to 64 KB HTTP/1.1 Range chunks.",
      "Interrupted transfers resume automatically from the exact byte offset.",
      "File collisions use a keep-both strategy appended with device identifier and timestamp.",
    ],
  },
];

export function Docs() {
  useMeta({
    title: "Documentation — Nasend",
    description: "Setup guides, architecture, and protocol documentation for Nasend.",
    path: "/docs",
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-12">
      <Breadcrumbs trail={[{ label: "Docs" }]} />

      <div className="space-y-4">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
          Documentation &amp; Guides
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f0f6fc]">
          Nasend Documentation
        </h1>
        <p className="text-base text-[#8b949e] leading-relaxed max-w-2xl">
          Instructions for setting up, pairing, and configuring sovereign peer-to-peer storage across Windows, Android, and Android TV.
        </p>
      </div>

      {/* Repository documentation references (Step 3) */}
      <div className="p-4 rounded border border-[#30363d] bg-[#161b22] space-y-2 text-xs font-mono">
        <span className="text-[#f0f6fc] font-medium block">
          Repository Specifications &amp; Docs:
        </span>
        <ul className="space-y-1.5 text-[#8b949e]">
          <li>
            •{" "}
            <a
              href={`https://github.com/${GITHUB_REPO}/blob/master/packages/protocol/protocol.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] hover:underline"
            >
              packages/protocol/protocol.md
            </a>{" "}
            — Complete FileProto wire specification and message schema
          </li>
          <li>
            •{" "}
            <a
              href={`https://github.com/${GITHUB_REPO}/blob/master/docs/test-checklist.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] hover:underline"
            >
              docs/test-checklist.md
            </a>{" "}
            — Verification checklist for mDNS, Range streaming, and pairing
          </li>
          <li>
            •{" "}
            <a
              href={`https://github.com/${GITHUB_REPO}/tree/master/apps/windows`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] hover:underline"
            >
              apps/windows/
            </a>{" "}
            — Tauri v2 desktop host daemon written in Rust (Axum)
          </li>
          <li>
            •{" "}
            <a
              href={`https://github.com/${GITHUB_REPO}/tree/master/apps/android`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] hover:underline"
            >
              apps/android/
            </a>{" "}
            — Jetpack Compose &amp; Ktor client for Android 8.0+ and TV
          </li>
        </ul>
      </div>

      {/* Step by step guides */}
      <div className="space-y-8 border-t border-[#30363d] pt-8">
        {guides.map((g) => (
          <div key={g.title} className="space-y-3">
            <h2 className="text-base font-medium text-[#f0f6fc]">{g.title}</h2>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#8b949e] leading-relaxed">
              {g.steps.map((st, i) => (
                <li key={i}>{st}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="border-t border-[#30363d] pt-6 flex items-center justify-between text-xs font-mono">
        <Link to="/" className="text-[#38bdf8] hover:underline">
          ← Return to Home
        </Link>
        <Link to="/security" className="text-[#38bdf8] hover:underline">
          Review security model →
        </Link>
      </div>
    </div>
  );
}
