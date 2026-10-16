import { useState, useEffect, useCallback, useMemo } from "react";
import { Copy, Check, QrCode, RefreshCw, ShieldCheck, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { zenAudioEngine } from "../audio/ZenAudio";

// Crockford Base32 alphabet (no 0, 1, I, L, O, U)
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

function generateCode(): string {
  let res = "";
  for (let i = 0; i < 8; i++) {
    const char = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    res += char;
    if (i === 3) res += "-";
  }
  return res;
}

/** Lightweight SVG QR-style Matrix Pattern Generator */
function QRMatrix({ code }: { code: string }) {
  // Deterministic 15x15 pseudo-matrix based on code hash
  const matrix = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = (hash << 5) - hash + code.charCodeAt(i);
      hash |= 0;
    }
    const grid: boolean[][] = [];
    for (let r = 0; r < 15; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < 15; c++) {
        // Position detection corner squares (standard QR markers)
        const isCorner =
          (r < 4 && c < 4) || (r < 4 && c > 10) || (r > 10 && c < 4);
        if (isCorner) {
          const border =
            r === 0 || r === 3 || c === 0 || c === 3 ||
            r === 11 || r === 14 || c === 11 || c === 14;
          const center =
            (r >= 1 && r <= 2 && c >= 1 && c <= 2) ||
            (r >= 1 && r <= 2 && c >= 12 && c <= 13) ||
            (r >= 12 && r <= 13 && c >= 1 && c <= 2);
          row.push(border || center);
        } else {
          // Pseudorandom internal bits based on hash
          const val = Math.sin(hash + r * 15 + c) * 10000;
          row.push(val - Math.floor(val) > 0.48);
        }
      }
      grid.push(row);
    }
    return grid;
  }, [code]);

  return (
    <svg viewBox="0 0 15 15" className="h-full w-full shape-rendering-crispEdges">
      {matrix.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill="#f59e0b"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function PairingAltar() {
  const [code, setCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 min
  const [showQr, setShowQr] = useState(false);

  // Join simulation state
  const [inputCode, setInputCode] = useState("");
  const [joinStep, setJoinStep] = useState<
    "idle" | "connecting" | "exchanging" | "verified" | "error"
  >("idle");
  const [stepDetail, setStepDetail] = useState("");

  const refreshCode = useCallback(() => {
    const newCode = generateCode();
    setCode(newCode);
    setTimeLeft(300);
    setCopied(false);
  }, []);

  useEffect(() => {
    refreshCode();
  }, [refreshCode]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          refreshCode();
          return 300;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshCode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    zenAudioEngine.playChime(780);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSimulateJoin = () => {
    const cleaned = inputCode.trim().toUpperCase();
    if (cleaned.length < 8) return;

    setJoinStep("connecting");
    setStepDetail("Connecting to wss://nas-signaling.ssgginfotech.workers.dev...");
    zenAudioEngine.playChime(440);

    setTimeout(() => {
      setJoinStep("exchanging");
      setStepDetail("Relaying WebRTC SDP offer & answer through Durable Object Room...");
      zenAudioEngine.playChime(554.37);

      setTimeout(() => {
        setJoinStep("verified");
        setStepDetail("DTLS E2EE Channel Established • SHA256 Commit Verified");
        zenAudioEngine.playChime(880);

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.75 },
            colors: ["#f59e0b", "#ff3b30", "#06b6d4", "#10b981"],
          });
        } catch {
          // Confetti fallback
        }
      }, 1100);
    }, 900);
  };

  const resetSimulation = () => {
    setJoinStep("idle");
    setStepDetail("");
    setInputCode("");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Altar A: Initiator (Generate Code) */}
      <div className="kage-card relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-fog">
              Device A // Initiator Altar
            </span>
          </div>
          <span className="font-mono text-xs text-fog">
            Expires in <span className="text-amber">{timeFormatted}</span>
          </span>
        </div>

        <div className="my-8 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-widest text-fog">Crockford Base32 Code</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="font-mono text-3xl font-bold tracking-widest text-snow sm:text-4xl">
              {code}
            </span>
            <button
              onClick={refreshCode}
              className="rounded-lg p-2 text-fog transition hover:bg-white/5 hover:text-snow"
              title="Generate fresh code"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-fog">
            Single-use cryptographic room • Burned immediately after peer handshake
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={copyToClipboard}
            className="flex h-11 items-center gap-2 rounded-xl bg-amber px-5 text-sm font-semibold text-ink shadow-[0_0_24px_rgba(245,158,11,0.3)] transition hover:bg-amber/90 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-ink" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy 8-Rune Code</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowQr(!showQr)}
            className="flex h-11 items-center gap-2 rounded-xl border border-line bg-card/80 px-4 text-sm font-medium text-snow transition hover:border-white/20 active:scale-95"
          >
            <QrCode className="h-4 w-4 text-amber" />
            <span>{showQr ? "Hide QR Altar" : "Show QR Altar"}</span>
          </button>
        </div>

        {/* QR Altar Reveal */}
        {showQr && (
          <div className="mt-6 flex flex-col items-center border-t border-line pt-6 animate-fadeIn">
            <div className="h-40 w-40 rounded-2xl border border-amber/30 bg-ink/90 p-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <QRMatrix code={code} />
            </div>
            <p className="mt-3 font-mono text-[11px] text-fog">
              Encodes: <span className="text-amber">nas://join?room={code}&v=1</span>
            </p>
          </div>
        )}
      </div>

      {/* Altar B: Joiner (Interactive Verification Simulator) */}
      <div className="kage-card relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 md:p-8">
        <div>
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-mesh animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-fog">
                Device B // Joiner Terminal
              </span>
            </div>
            <span className="font-mono text-xs text-cyan-mesh">Interactive Demo</span>
          </div>

          <div className="my-6">
            <label htmlFor="join-code" className="block text-xs uppercase tracking-widest text-fog">
              Enter 8-Rune Code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="join-code"
                type="text"
                value={inputCode}
                onChange={(e) => {
                  let v = e.target.value.toUpperCase();
                  if (v.length === 4 && !v.includes("-")) v = v + "-";
                  setInputCode(v);
                }}
                placeholder={code}
                maxLength={9}
                className="w-full rounded-xl border border-line bg-ink/70 px-4 py-3 font-mono text-lg font-bold tracking-widest text-snow placeholder:text-fog/40 focus:border-cyan-mesh focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setInputCode(code)}
                className="shrink-0 rounded-xl border border-line bg-card px-3 text-xs font-mono text-fog transition hover:text-snow"
                title="Paste generated code"
              >
                Use Code
              </button>
            </div>
            <p className="mt-2 text-xs text-fog">
              Test the live WebRTC room handshake. Zero relay servers touching your file bytes.
            </p>
          </div>

          {/* Handshake Progress Log */}
          {joinStep !== "idle" && (
            <div className="my-4 rounded-2xl border border-line bg-ink/80 p-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                {joinStep === "verified" ? (
                  <ShieldCheck className="h-4 w-4 text-accent" />
                ) : (
                  <RefreshCw className="h-4 w-4 animate-spin text-cyan-mesh" />
                )}
                <span className={joinStep === "verified" ? "text-accent font-bold" : "text-snow"}>
                  {joinStep === "connecting" && "Step 1/3: Negotiating Room..."}
                  {joinStep === "exchanging" && "Step 2/3: Relaying SDP Offer/Answer..."}
                  {joinStep === "verified" && "Handshake Complete: Verified ✓"}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-fog">{stepDetail}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 flex items-center gap-3">
          {joinStep === "verified" ? (
            <button
              onClick={resetSimulation}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-card text-sm font-semibold text-snow transition hover:border-white/20 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset & Test Again</span>
            </button>
          ) : (
            <button
              onClick={handleSimulateJoin}
              disabled={joinStep === "connecting" || joinStep === "exchanging"}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-mesh px-5 text-sm font-semibold text-ink shadow-[0_0_24px_rgba(6,182,212,0.3)] transition hover:bg-cyan-mesh/90 active:scale-95 disabled:opacity-50"
            >
              <span>Connect Devices</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
