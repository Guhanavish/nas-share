import { useState } from "react";
import { motion } from "motion/react";
import { GlassCard } from "../glass/GlassCard";
import { Shield, Lock, CheckCircle2, RotateCcw, Key, Fingerprint } from "lucide-react";
import { zenAudioEngine } from "../audio/ZenAudio";

export function SecurityDtlsSection() {
  const [handshakeStep, setHandshakeStep] = useState<number>(3);
  const [isSimulating, setIsSimulating] = useState(false);

  const steps = [
    {
      title: "1. Ephemeral Hello & Base32 Token",
      desc: "Client and Host exchange random salt and Crockford 8-rune handshake token over local UDP broadcast.",
      status: "Verified",
    },
    {
      title: "2. Ed25519 Fingerprint Verification",
      desc: "Public cryptographic keys are verified against locally pinned authorized device ledger. MITM rejected.",
      status: "Pinned",
    },
    {
      title: "3. DTLS 1.3 / AES-256-GCM Session",
      desc: "Zero-RTT forward secrecy session established. All file chunks encrypted end-to-end between peer hardware.",
      status: "Encrypted",
    },
  ];

  const replayHandshake = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setHandshakeStep(0);
    zenAudioEngine.playChime(440);

    const t1 = setTimeout(() => {
      setHandshakeStep(1);
      zenAudioEngine.playChime(554.37);
    }, 700);

    const t2 = setTimeout(() => {
      setHandshakeStep(2);
      zenAudioEngine.playChime(659.25);
    }, 1500);

    const t3 = setTimeout(() => {
      setHandshakeStep(3);
      zenAudioEngine.playChime(880);
      setIsSimulating(false);
    }, 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  return (
    <section id="security" className="relative py-28 px-4 sm:px-6 lg:px-12 border-t border-white/10 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-mesh/30 bg-indigo-mesh/10 text-indigo-mesh font-mono text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Cryptographic Guarantees</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Zero-Trust DTLS 1.3 Handshake
          </h2>
          <p className="text-base sm:text-lg text-fog">
            Even if an attacker controls your Wi-Fi router, they cannot intercept or tamper with your files.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Animated Shield / Lock Visualization (Item 31) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-ink/80 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            {/* Ambient radial lighting */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mb-6">
              {/* Outer pulsing ring */}
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border border-indigo-mesh/40"
              />

              {/* Middle dashed rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border-2 border-dashed border-cyan-mesh/30"
              />

              {/* Central Lock / Shield Icon */}
              <motion.div
                animate={{
                  scale: handshakeStep === 3 ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.4 }}
                className={`w-28 h-28 rounded-3xl flex items-center justify-center border shadow-2xl transition-colors duration-500 ${
                  handshakeStep === 3
                    ? "bg-emerald-mesh/20 border-emerald-mesh text-emerald-mesh shadow-emerald-500/20"
                    : handshakeStep === 2
                    ? "bg-indigo-mesh/20 border-indigo-mesh text-indigo-mesh shadow-indigo-500/20"
                    : "bg-cyan-mesh/20 border-cyan-mesh text-cyan-mesh shadow-cyan-500/20"
                }`}
              >
                {handshakeStep === 3 ? (
                  <Lock className="w-12 h-12" />
                ) : handshakeStep === 2 ? (
                  <Fingerprint className="w-12 h-12" />
                ) : (
                  <Key className="w-12 h-12" />
                )}
              </motion.div>
            </div>

            <div className="text-center space-y-1 mb-6">
              <span className="font-mono text-xs text-fog uppercase tracking-widest block">
                Session Status
              </span>
              <p className="font-display text-lg font-bold text-white">
                {handshakeStep === 3
                  ? "DTLS 1.3 Channel Active"
                  : handshakeStep === 2
                  ? "Verifying Ed25519 Fingerprint..."
                  : "Exchanging Handshake Tokens..."}
              </p>
              <p className="font-mono text-xs text-emerald-mesh">
                {handshakeStep === 3 ? "256-bit AES-GCM Encrypted" : "Synchronizing..."}
              </p>
            </div>

            <button
              onClick={replayHandshake}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs transition cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
              <span>Simulate DTLS Handshake</span>
            </button>
          </div>

          {/* Handshake Step Breakdown */}
          <div className="lg:col-span-7 space-y-4">
            {steps.map((st, i) => {
              const isActive = handshakeStep >= i + 1;
              const isCurrent = handshakeStep === i + 1;

              return (
                <GlassCard
                  key={i}
                  className={`p-6 transition-all duration-300 ${
                    isCurrent
                      ? "border-cyan-mesh/60 bg-white/[0.08] shadow-lg shadow-cyan-500/10"
                      : isActive
                      ? "border-emerald-mesh/40 opacity-90"
                      : "opacity-40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-white">
                          {st.title}
                        </span>
                        {isActive && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-mesh" />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-fog leading-relaxed">
                        {st.desc}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 border ${
                        isActive
                          ? "bg-emerald-mesh/15 border-emerald-mesh/30 text-emerald-mesh"
                          : "bg-white/5 border-white/10 text-fog"
                      }`}
                    >
                      {isActive ? st.status : "Pending"}
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
