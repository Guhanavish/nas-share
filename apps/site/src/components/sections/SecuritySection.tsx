import { Link } from "react-router-dom";

export function SecuritySection() {
  return (
    <section id="security" className="py-20 border-b border-[#30363d]">
      <div className="mx-auto max-w-4xl px-6 space-y-12">
        <div className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
            Security &amp; Privacy
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc]">
            What the signaling server sees
          </h2>
          {/* One clear paragraph on what the signaling server can and cannot see (Step 5) */}
          <p className="text-base text-[#8b949e] leading-relaxed max-w-2xl">
            When devices are on different networks, an ephemeral Cloudflare Worker (Durable Object) brokers the initial connection by passing session descriptions (SDP) and network candidates (ICE). The signaling server sees only random room identifiers, IP addresses, and routing candidates required to negotiate the connection. It never receives file names, folder structures, cryptographic keys, or file bytes. Once peers open a direct WebRTC DataChannel, they disconnect from the signaling worker entirely.
          </p>
        </div>

        {/* Technical boundary matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded border border-[#30363d] bg-[#161b22] space-y-2">
            <span className="font-mono font-medium text-[#f0f6fc] block">
              Direct peer channel (LAN &amp; WebRTC)
            </span>
            <ul className="space-y-1 text-[#8b949e] font-mono leading-relaxed">
              <li>• Direct TCP socket on LAN (:8743)</li>
              <li>• DTLS 1.3 encryption on WAN DataChannels</li>
              <li>• Ed25519 identity key pinning</li>
              <li>• File contents stream between hardware only</li>
            </ul>
          </div>

          <div className="p-4 rounded border border-[#30363d] bg-[#161b22] space-y-2">
            <span className="font-mono font-medium text-[#f0f6fc] block">
              Signaling worker boundaries
            </span>
            <ul className="space-y-1 text-[#8b949e] font-mono leading-relaxed">
              <li>• 5-minute room TTL; memory is ephemeral</li>
              <li>• No database records or persistent logs</li>
              <li>• Zero access to file metadata or payloads</li>
              <li>• Disconnected immediately post-handshake</li>
            </ul>
          </div>
        </div>

        {/* Short FAQ answering strictly from code and README (Step 5) */}
        <div className="border-t border-[#30363d] pt-8 space-y-6">
          <h3 className="text-base font-medium text-[#f0f6fc]">
            Frequently asked questions
          </h3>

          <div className="space-y-6 text-xs max-w-2xl">
            <div className="space-y-1">
              <h4 className="font-medium text-[#f0f6fc]">
                Must both devices be online at the same time?
              </h4>
              <p className="text-[#8b949e] leading-relaxed">
                Yes. Because Nasend stores zero files on central cloud servers, both the sending device and the receiving device must be active and running to stream or sync files between each other.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-medium text-[#f0f6fc]">
                What happens without Wi-Fi or internet?
              </h4>
              <p className="text-[#8b949e] leading-relaxed">
                Nasend does not require an active internet connection on local networks. If your internet cable is disconnected or you are traveling with a battery-powered travel router, devices discover each other through local mDNS and stream files at full local network speed.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-medium text-[#f0f6fc]">
                How are identities authenticated?
              </h4>
              <p className="text-[#8b949e] leading-relaxed">
                Each device generates a 32-byte Ed25519 public key pair on first run. During pairing, the devices verify the SHA-256 commit of the 8-character Crockford code and pin the public keys into a local SQLite database. Future connections authenticate this pinned key directly.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/security"
              className="text-xs text-[#38bdf8] hover:underline"
            >
              Read full protocol security specification →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
