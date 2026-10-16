import { PairingAltar } from "../interactive/PairingAltar";

export function Chapter03Altar() {
  return (
    <section id="chapter-03" className="relative min-h-[100dvh] flex flex-col justify-center px-5 py-24">
      <div className="mx-auto max-w-5xl w-full">
        {/* Chapter marker */}
        <div className="flex items-center gap-3 font-mono text-xs text-amber">
          <span className="flex h-2 w-2 rounded-full bg-amber animate-pulse" />
          <span className="uppercase tracking-widest font-bold">03 // 契 The 8-Rune Altar</span>
          <span className="text-fog/40">|</span>
          <span className="text-fog">Cryptographic Pairing Ritual</span>
        </div>

        <div className="mt-6">
          <h2 className="font-display text-3xl font-extrabold text-snow sm:text-5xl">
            Eight Runes. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber via-vermilion to-cyan-mesh">
              Zero Accounts. Zero Email.
            </span>
          </h2>
          <p className="mt-4 max-w-2xl text-fog sm:text-lg">
            No username or password database to get breached. Tap Share on Device A,
            read the 8-character Crockford code or scan the QR code on Device B.
            Both devices pin each other’s Ed25519 public keys forever.
          </p>
        </div>

        {/* The Live Interactive Pairing Altar */}
        <div className="mt-10">
          <PairingAltar />
        </div>

        {/* Pairing Protocol Steps */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="kage-card rounded-2xl p-5">
            <span className="font-mono text-xs font-bold text-amber">Phase 1 // Ephemeral Code</span>
            <h4 className="font-display mt-2 text-base font-bold text-snow">Crockford Base32</h4>
            <p className="mt-1.5 text-xs text-fog leading-relaxed">
              Excludes ambiguous characters (0, 1, I, L, O, U). CSPRNG generated, 5-minute expiry, burned on success.
            </p>
          </div>

          <div className="kage-card rounded-2xl p-5">
            <span className="font-mono text-xs font-bold text-vermilion">Phase 2 // E2EE Handshake</span>
            <h4 className="font-display mt-2 text-base font-bold text-snow">SHA256 Commit</h4>
            <p className="mt-1.5 text-xs text-fog leading-relaxed">
              Inside the encrypted WebRTC channel, Initiator sends SHA256(code). Joiner verifies before exchanging Ed25519 keys.
            </p>
          </div>

          <div className="kage-card rounded-2xl p-5">
            <span className="font-mono text-xs font-bold text-cyan-mesh">Phase 3 // Permanent Reconnect</span>
            <h4 className="font-display mt-2 text-base font-bold text-snow">Device Pinning</h4>
            <p className="mt-1.5 text-xs text-fog leading-relaxed">
              Future reconnections happen automatically via mDNS or pinned fingerprint. Never re-type the code.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
