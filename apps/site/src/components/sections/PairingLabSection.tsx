import { useState } from "react";
import confetti from "canvas-confetti";
import { Copy, Check, RefreshCw, ShieldCheck, Sparkles, QrCode } from "lucide-react";
import { GlassCard } from "../glass/GlassCard";
import { MagneticButton } from "../glass/MagneticButton";
import { RunePairingGlyph } from "../brand/FeatureLogos";
import { zenAudioEngine } from "../audio/ZenAudio";

export function PairingLabSection() {
  const [code, setCode] = useState("K7M2-Q9XD");
  const [copied, setCopied] = useState(false);
  const [handshakeState, setHandshakeState] = useState<"idle" | "pairing" | "paired">("idle");
  const [showQr, setShowQr] = useState(false);

  // Valid Crockford Base32 alphabet (no I, L, O, U)
  const CROCKFORD_CHARS = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

  const generateNewCode = () => {
    let part1 = "";
    let part2 = "";
    for (let i = 0; i < 4; i++) {
      part1 += CROCKFORD_CHARS[Math.floor(Math.random() * CROCKFORD_CHARS.length)];
      part2 += CROCKFORD_CHARS[Math.floor(Math.random() * CROCKFORD_CHARS.length)];
    }
    const newCode = `${part1}-${part2}`;
    setCode(newCode);
    setHandshakeState("idle");
    zenAudioEngine.playChime(640);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    zenAudioEngine.playChime(880);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateHandshake = () => {
    if (handshakeState === "pairing") return;
    setHandshakeState("pairing");
    zenAudioEngine.playChime(500);

    setTimeout(() => {
      setHandshakeState("paired");
      zenAudioEngine.playChime(920);

      // Trigger celebratory glass confetti burst
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#38bdf8", "#818cf8", "#34d399", "#fbbf24"],
        disableForReducedMotion: true,
      });
    }, 1200);
  };

  return (
    <section id="pairing" className="relative py-28 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-5xl w-full space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-mesh/20 bg-amber-mesh/5 text-[11px] font-mono text-amber-mesh uppercase tracking-widest">
            <RunePairingGlyph size={14} />
            <span>Interactive Protocol Lab</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            The 8-Rune Altar.
          </h2>
          <p className="text-fog text-sm sm:text-base leading-relaxed">
            No emails. No passwords. No cloud accounts. Pair any two devices in under
            120 milliseconds using an ephemeral Crockford Base32 cryptographic code.
          </p>
        </div>

        {/* The Interactive Altar Glass Box */}
        <GlassCard glowColor="amber" className="p-8 sm:p-12 border border-white/10 shadow-2xl">
          <div className="max-w-xl mx-auto space-y-8 text-center">
            {/* Animated 8-Rune Code Display */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-widest text-fog/70">
                Ephemeral Pairing Key (Expires in 5m)
              </span>

              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {code.split("").map((char, idx) => (
                  <span
                    key={`${char}-${idx}`}
                    className={`inline-flex items-center justify-center rounded-xl font-mono text-2xl sm:text-4xl font-bold transition-all duration-300 ${
                      char === "-"
                        ? "text-fog/40 w-4"
                        : "w-10 h-14 sm:w-14 sm:h-18 bg-white/[0.05] border border-white/15 text-white shadow-inner shadow-black/40 hover:border-amber-mesh/60 hover:text-amber-mesh"
                    }`}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Control Strip */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={generateNewCode}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-snow font-mono text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-mesh" />
                <span>Roll New Code</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-snow font-mono text-xs flex items-center gap-2 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-mesh" />
                    <span className="text-emerald-mesh">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-mesh" />
                    <span>Copy Rune String</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowQr(!showQr)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-snow font-mono text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-mesh" />
                <span>{showQr ? "Hide QR" : "Show QR Altar"}</span>
              </button>
            </div>

            {/* QR Code Simulation Dropdown */}
            {showQr && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 inline-flex flex-col items-center gap-3 animate-fade-in">
                <div className="w-40 h-40 rounded-xl bg-white p-3 flex items-center justify-center shadow-lg">
                  {/* Stylized simulated QR Matrix */}
                  <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-slate-900 rounded">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          (i % 2 === 0 || i % 5 === 0) && i !== 12
                            ? "bg-cyan-400"
                            : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-mono text-fog">Scan with Android Camera</p>
              </div>
            )}

            {/* Handshake Simulation Trigger */}
            <div className="pt-4 border-t border-white/10">
              <MagneticButton
                variant={handshakeState === "paired" ? "glass" : "primary"}
                onClick={handleSimulateHandshake}
                disabled={handshakeState === "pairing"}
                className="w-full sm:w-auto"
              >
                {handshakeState === "idle" && (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-mesh" />
                    <span>Simulate Peer Handshake</span>
                  </>
                )}
                {handshakeState === "pairing" && (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-mesh" />
                    <span>Verifying Crockford Checksum & Ed25519 Keys...</span>
                  </>
                )}
                {handshakeState === "paired" && (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-mesh" />
                    <span>Pairing Verified & Trusted!</span>
                  </>
                )}
              </MagneticButton>
            </div>

            {/* Telemetry Output Box */}
            {handshakeState === "paired" && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left font-mono text-xs text-emerald-300 space-y-1 animate-fade-in">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>[ACK] SHA-256 Room Commit Hash Matched</span>
                </p>
                <p className="flex items-center gap-2 text-fog">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>[TRUST] Ed25519 Fingerprint Pinned into Local Keystore</span>
                </p>
                <p className="flex items-center gap-2 text-fog">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>[P2P] WebRTC DataChannel Opened (DTLS-SRTP Active)</span>
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Feature Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-fog">
          <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02]">
            <h4 className="font-mono text-white font-semibold">Crockford Base32</h4>
            <p>Eliminates easily misread characters (no I, L, O, or U). Case-insensitive and resistant to verbal typos.</p>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02]">
            <h4 className="font-mono text-white font-semibold">Ed25519 Identity</h4>
            <p>Every device generates its own private keypair. Once paired, future connections happen automatically without codes.</p>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02]">
            <h4 className="font-mono text-white font-semibold">Zero-Knowledge Relay</h4>
            <p>Cloudflare Workers only broker the WebRTC ICE handshake. Not a single byte of your file content ever touches the server.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
