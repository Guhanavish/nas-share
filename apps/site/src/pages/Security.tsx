import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useMeta } from "../lib/meta";
import { GITHUB_REPO } from "../lib/site";

export function Security() {
  useMeta({
    title: "Security & Architecture — Nasend",
    description: "Technical security architecture, DTLS 1.3 encryption, and FileProto specification for Nasend.",
    path: "/security",
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-12">
      <Breadcrumbs trail={[{ label: "Security" }]} />

      <div className="space-y-4">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
          Security &amp; Protocol Model
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f0f6fc]">
          Security Architecture
        </h1>
        <p className="text-base text-[#8b949e] leading-relaxed max-w-2xl">
          Nasend is built on the principle that files should move directly between devices without leaving copies on intermediate servers.
        </p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-[#8b949e]">
        {/* Section 1: The FileProto Protocol */}
        <section className="space-y-3 border-t border-[#30363d] pt-8">
          <h2 className="text-lg font-medium text-[#f0f6fc]">
            1. The FileProto Protocol
          </h2>
          <p>
            All file exchange is governed by the <strong className="text-[#f0f6fc]">FileProto</strong> specification. FileProto operates symmetrically across two transports:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs">
            <li>
              <span className="text-[#f0f6fc]">LAN Transport:</span> HTTP/1.1 REST-style endpoints over direct TCP sockets on port <code className="code-inline">8743</code>.
            </li>
            <li>
              <span className="text-[#f0f6fc]">WAN Transport:</span> WebRTC DataChannels using DTLS 1.3 frame streaming.
            </li>
          </ul>
          <p className="text-xs pt-1">
            Specification source:{" "}
            <a
              href={`https://github.com/${GITHUB_REPO}/blob/master/packages/protocol/protocol.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] hover:underline"
            >
              packages/protocol/protocol.md on GitHub ↗
            </a>
          </p>
        </section>

        {/* Section 2: Identity & Pairing */}
        <section className="space-y-3 border-t border-[#30363d] pt-8">
          <h2 className="text-lg font-medium text-[#f0f6fc]">
            2. Identity &amp; Key Pinning
          </h2>
          <p>
            On first startup, each device generates an Ed25519 keypair consisting of a 32-byte public key and private key stored in local application storage.
          </p>
          <p>
            When pairing two devices, an 8-character Crockford Base32 token (e.g. <code className="code-inline">K7M2-Q9XD</code>) is generated. This code excludes visually ambiguous characters (0, O, 1, I, L) to prevent human transcription errors.
          </p>
          <p>
            The pairing handshake verifies the SHA-256 commit of the code and pins the devices&apos; Ed25519 public keys into a local SQLite table (<code className="code-inline">trusted_devices</code>). The pairing code has a 5-minute time-to-live and is burned immediately upon first use. Once paired, subsequent connections verify this pinned key directly without requiring codes again.
          </p>
        </section>

        {/* Section 3: Signaling Server Scope */}
        <section className="space-y-3 border-t border-[#30363d] pt-8">
          <h2 className="text-lg font-medium text-[#f0f6fc]">
            3. Signaling Server Scope &amp; Privacy
          </h2>
          <p>
            To establish a WebRTC DataChannel across different networks, devices need to exchange session descriptions (SDP offers and answers) and network candidates (ICE). This exchange is mediated by an ephemeral Cloudflare Worker utilizing Durable Objects.
          </p>
          <div className="p-4 rounded border border-[#30363d] bg-[#161b22] space-y-2 text-xs">
            <span className="font-mono text-[#f0f6fc] font-medium block">
              What the Cloudflare Worker sees:
            </span>
            <ul className="space-y-1 font-mono text-[#8b949e]">
              <li>✓ The temporary 8-character room identifier</li>
              <li>✓ Ephemeral SDP strings containing audio/video/data codec negotiation</li>
              <li>✓ Public IP addresses and port candidates provided by STUN</li>
            </ul>
            <span className="font-mono text-[#f0f6fc] font-medium block pt-2">
              What the Cloudflare Worker CANNOT see:
            </span>
            <ul className="space-y-1 font-mono text-[#8b949e]">
              <li>✗ File names, directory listings, or folder paths</li>
              <li>✗ Private keys or cryptographic secret material</li>
              <li>✗ File contents, bytes, or checksums</li>
            </ul>
          </div>
          <p>
            The Durable Object room retains state for at most 60 seconds of inactivity or upon peers sending a <code className="code-inline">leave</code> message. No persistent database or analytics records exist on the signaling server.
          </p>
        </section>

        {/* Section 4: Range Chunk Streaming */}
        <section className="space-y-3 border-t border-[#30363d] pt-8">
          <h2 className="text-lg font-medium text-[#f0f6fc]">
            4. 16–64 KB Chunk Streaming
          </h2>
          <p>
            Large media and archive transfers are served using standard HTTP Range headers (<code className="code-inline">bytes=start-end</code>) sliced into chunks between 16 KB and 64 KB. This allows video players (such as ExoPlayer on Android TV) to scrub arbitrarily without waiting for entire file downloads, and enables interrupted transfers to resume without restarting.
          </p>
        </section>

        <div className="border-t border-[#30363d] pt-6 flex items-center justify-between text-xs font-mono">
          <Link to="/" className="text-[#38bdf8] hover:underline">
            ← Return to Home
          </Link>
          <Link to="/docs" className="text-[#38bdf8] hover:underline">
            View setup documentation →
          </Link>
        </div>
      </div>
    </div>
  );
}
