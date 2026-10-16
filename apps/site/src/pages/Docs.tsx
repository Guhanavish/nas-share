import { Link } from "react-router-dom";
import { Smartphone, MonitorDown, Tv, RefreshCw, LifeBuoy, Terminal } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";

const guides = [
  {
    icon: Smartphone,
    title: "1. Pair Phone ↔ Windows PC",
    steps: [
      "Ensure both devices are on the same WiFi (or connected to internet for WebRTC WAN).",
      "On Windows, open Shared Folders → Pair Device. A Crockford code like K7M2-Q9XD appears.",
      "On your phone, tap Enter Code or scan the QR code → Connect & Pair.",
      "Both devices verify the SHA-256 commit hash and pin Ed25519 identities forever.",
    ],
  },
  {
    icon: Tv,
    title: "2. Android TV Living Room Setup",
    steps: [
      "Install the universal APK on your Google TV / Android TV via ADB or USB.",
      "The app appears in your Leanback TV launcher with a custom 320x180 banner.",
      "Select 'Show QR' on the TV screen; scan from your phone or type the 8-rune code.",
      "Navigate remote folders using your TV remote D-Pad with custom halo focus states.",
    ],
  },
  {
    icon: MonitorDown,
    title: "3. Windows First Run & Firewall",
    steps: [
      "Run 'NAS Share_0.1.0_x64-setup.exe' (or the standalone portable executable).",
      "Allow the Windows Firewall prompt for port 8743 to permit local mDNS HTTP traffic.",
      "Configure shared folders. The system tray icon monitors line-speed file streams.",
      "If you exit the window, the server continues running silently in the system tray.",
    ],
  },
  {
    icon: RefreshCw,
    title: "4. Two-Way Sync & Media Streaming",
    steps: [
      "Enable 'Automatic Sync' in the Sync screen on mobile to back up photos to your PC.",
      "Interrupted transfers resume automatically from the exact byte offset.",
      "File collisions use 'Keep-Both Strategy' (tagged with device name & timestamp).",
      "4K video files seek instantly with sub-millisecond HTTP 206 Partial Content.",
    ],
  },
  {
    icon: LifeBuoy,
    title: "5. Troubleshooting & Connectivity",
    steps: [
      "Device not discovered on LAN? Verify mDNS multicast is permitted on your WiFi router.",
      "Away from home? The Cloudflare Worker WebSocket room negotiates STUN peer-to-peer WAN.",
      "Code expired? Codes have a 5-minute single-use TTL; tap refresh for a new 8-rune code.",
      "Too many attempts? The room rate-limiter temporarily blocks more than 5 joins per minute.",
    ],
  },
];

export function Docs() {
  useMeta({
    title: "Architecture & Setup Docs // 影 Nasend",
    description:
      "Technical setup documentation for Nasend device-as-NAS ecosystem: Android TV Leanback, Windows Tauri v2, FileProto range streaming, and WebRTC signaling.",
    path: "/docs",
  });

  return (
    <div className="mx-auto max-w-4xl px-5 pt-28 pb-24">
      <Breadcrumbs trail={[{ label: "Docs" }]} />

      <div className="mt-4">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-vermilion">
          01 // 書 DOCUMENTATION
        </p>
        <h1 className="font-display mt-3 text-4xl font-extrabold text-snow sm:text-5xl">
          Sovereign Mesh Setup
        </h1>
        <p className="mt-3 text-base text-fog">
          Complete guide to pairing your phone, Google TV, and PC without third-party accounts.
        </p>
        <p className="mt-2 text-sm text-fog">
          Need the installer first?{" "}
          <Link to="/#chapter-05" className="text-vermilion underline hover:text-snow">
            Jump to Sovereign Vault Downloads
          </Link>
          .
        </p>
      </div>

      {/* Guide Cards */}
      <div className="mt-10 space-y-6">
        {guides.map((g) => (
          <div key={g.title} className="kage-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3.5 border-b border-line pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-vermilion/15 text-vermilion">
                <g.icon className="h-5 w-5" />
              </span>
              <h2 className="font-display text-lg font-bold text-snow">{g.title}</h2>
            </div>
            <ol className="mt-5 space-y-3">
              {g.steps.map((s, n) => (
                <li key={n} className="flex gap-3 text-sm leading-relaxed text-fog">
                  <span className="font-mono font-bold text-amber">
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Technical Protocol Framing Specification */}
      <div className="mt-12 kage-card rounded-3xl p-6 sm:p-8 border-cyan-mesh/20">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <Terminal className="h-5 w-5 text-cyan-mesh" />
          <h3 className="font-display text-lg font-bold text-snow">
            FileProto Wire Protocol Framing
          </h3>
        </div>
        <div className="mt-4 overflow-x-auto font-mono text-xs text-fog">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-snow">
                <th className="py-2 pr-4">Command</th>
                <th className="py-2 pr-4">Parameters</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              <tr>
                <td className="py-2.5 pr-4 text-cyan-mesh font-bold">GET /api/list</td>
                <td className="py-2.5 pr-4">{`{ path?: string }`}</td>
                <td className="py-2.5">Lists files and folders with size & timestamps</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-cyan-mesh font-bold">GET /api/stat</td>
                <td className="py-2.5 pr-4">{`{ path: string }`}</td>
                <td className="py-2.5">Returns entry metadata (file vs dir)</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-cyan-mesh font-bold">GET /api/read</td>
                <td className="py-2.5 pr-4">{`{ path, offset?, len? }`}</td>
                <td className="py-2.5">Streams binary chunks with HTTP Range seek</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-cyan-mesh font-bold">POST /api/write</td>
                <td className="py-2.5 pr-4">{`{ path, offset? } + binary body`}</td>
                <td className="py-2.5">Appends chunk to file at exact offset</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-cyan-mesh font-bold">GET /api/thumb</td>
                <td className="py-2.5 pr-4">{`{ path: string }`}</td>
                <td className="py-2.5">Returns JPEG preview thumbnail</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
