import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Download, ArrowRight, RefreshCw, AlertCircle, Shield } from "lucide-react";
import { DropZone } from "./DropZone";
import { FileList } from "./FileList";
import { ConnectionVisualizer, type ConnectionState } from "./ConnectionVisualizer";
import { TransferProgress } from "./TransferProgress";
import { TransferComplete } from "./TransferComplete";
import { TOKENS } from "../../tokens";

interface TransferAppProps {
  initialMode?: "send" | "receive";
  className?: string;
}

// Generate random Crockford Base32 8-rune code
function generatePairingCode(): string {
  const alphabet = TOKENS.brand.crockfordAlphabet;
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export function TransferApp({ initialMode = "send", className = "" }: TransferAppProps) {
  const [mode, setMode] = useState<"send" | "receive">(initialMode);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [code, setCode] = useState<string>(generatePairingCode());
  const [inputCode, setInputCode] = useState<string>("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transfer simulation / metrics state
  const [currentFileIdx, setCurrentFileIdx] = useState(0);
  const [transferredBytes, setTransferredBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const speedMBs = 112.4;
  const [etaSeconds, setEtaSeconds] = useState(0.8);
  const [percent, setPercent] = useState(0);

  // Received files (with object URLs for browser downloading)
  const [receivedFiles, setReceivedFiles] = useState<{ name: string; size: number; url?: string }[]>([]);

  const activeSocketRef = useRef<WebSocket | null>(null);
  const transferTimerRef = useRef<number | null>(null);
  const { duration, ease } = TOKENS.motion;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeSocketRef.current) {
        activeSocketRef.current.close();
      }
      if (transferTimerRef.current) {
        window.clearInterval(transferTimerRef.current);
      }
    };
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setStagedFiles((prev) => [...prev, ...newFiles]);
    setErrorMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearFiles = () => {
    setStagedFiles([]);
    setErrorMessage(null);
  };

  const handleRegenerateCode = () => {
    setCode(generatePairingCode());
  };

  // Start Transfer (Send Mode)
  const handleStartSend = () => {
    if (stagedFiles.length === 0) {
      setErrorMessage("Please select at least one file to transfer.");
      return;
    }

    setErrorMessage(null);
    setConnectionState("waiting");

    const total = stagedFiles.reduce((acc, f) => acc + f.size, 0);
    setTotalBytes(total);
    setTransferredBytes(0);
    setCurrentFileIdx(0);
    setPercent(0);

    // Attempt signaling connection
    const targetRoom = code.replace("-", "");
    try {
      const wsUrl = `wss://nas-signaling.ssgginfotech.workers.dev/ws?room=${targetRoom}`;
      const ws = new WebSocket(wsUrl);
      activeSocketRef.current = ws;

      ws.onopen = () => {
        setConnectionState("connecting");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "join") {
            setConnectionState("connected");
          }
        } catch {
          // ignore parsing error
        }
      };

      ws.onerror = () => {
        // Fallback gracefully to local line-rate transfer simulation
      };
    } catch {
      // ignore
    }

    // Step through connection and line-rate transfer
    setTimeout(() => {
      setConnectionState("connected");

      setTimeout(() => {
        setConnectionState("transferring");

        let currentPercent = 0;
        const interval = window.setInterval(() => {
          currentPercent += 5;
          if (currentPercent >= 100) {
            clearInterval(interval);
            setPercent(100);
            setTransferredBytes(total);
            setConnectionState("completed");
          } else {
            setPercent(currentPercent);
            setTransferredBytes(Math.round((currentPercent / 100) * total));
            const remaining = ((100 - currentPercent) / 100) * (total / (112.4 * 1024 * 1024));
            setEtaSeconds(Math.max(remaining, 0.1));
          }
        }, 80);

        transferTimerRef.current = interval;
      }, 500);
    }, 700);
  };

  // Start Receive Mode
  const handleStartReceive = () => {
    const clean = inputCode.trim().toUpperCase();
    if (clean.length < 8) {
      setErrorMessage("Please enter a valid 8-character pairing code.");
      return;
    }

    setErrorMessage(null);
    setConnectionState("connecting");

    // Mock incoming files for receiver
    const simulatedFiles = [
      { name: "Project_Archive_Backup.tar", size: 18450000 },
      { name: "Camera_Roll_IMG_202611.heic", size: 4200000 },
    ];
    const total = simulatedFiles.reduce((acc, f) => acc + f.size, 0);
    setTotalBytes(total);
    setTransferredBytes(0);

    setTimeout(() => {
      setConnectionState("connected");

      setTimeout(() => {
        setConnectionState("transferring");

        let currentPercent = 0;
        const interval = window.setInterval(() => {
          currentPercent += 6;
          if (currentPercent >= 100) {
            clearInterval(interval);
            setPercent(100);
            setTransferredBytes(total);
            setReceivedFiles(
              simulatedFiles.map((f) => ({
                ...f,
                url: URL.createObjectURL(new Blob([`NASend verified test payload for ${f.name}`], { type: "text/plain" })),
              }))
            );
            setConnectionState("completed");
          } else {
            setPercent(currentPercent);
            setTransferredBytes(Math.round((currentPercent / 100) * total));
          }
        }, 80);

        transferTimerRef.current = interval;
      }, 500);
    }, 800);
  };

  const handleCancel = () => {
    if (transferTimerRef.current) {
      window.clearInterval(transferTimerRef.current);
    }
    if (activeSocketRef.current) {
      activeSocketRef.current.close();
    }
    setConnectionState("ready");
    setPercent(0);
  };

  const handleReset = () => {
    handleCancel();
    setStagedFiles([]);
    setReceivedFiles([]);
    setCode(generatePairingCode());
    setInputCode("");
    setErrorMessage(null);
  };

  const isBusy =
    connectionState === "waiting" ||
    connectionState === "connecting" ||
    connectionState === "connected" ||
    connectionState === "transferring";

  return (
    <div className={`window-frame w-full max-w-2xl mx-auto ${className}`}>
      {/* Window Header */}
      <div className="window-header">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#343934]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#343934]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#343934]" />
          <span className="ml-2 font-mono text-xs text-[#F2F3F0]">
            nasend://transfer-workspace
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#929690]">
          <Shield className="w-3.5 h-3.5 text-[#A3B899]" />
          <span>DTLS &amp; Ed25519 Pinning</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 bg-[#0C0D0C] space-y-6">
        {/* Mode Switcher Tabs (Send Files vs Receive Files) */}
        {!isBusy && connectionState !== "completed" && (
          <div className="flex items-center p-1 rounded-lg bg-[#1B1D1B] border border-[#343934]">
            <button
              onClick={() => {
                setMode("send");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-md text-xs font-mono font-medium transition cursor-pointer flex items-center justify-center gap-2 ${
                mode === "send"
                  ? "bg-[#252825] text-[#F2F3F0] border border-[#414741]"
                  : "text-[#929690] hover:text-[#F2F3F0]"
              }`}
            >
              <Send className="w-3.5 h-3.5 text-[#A3B899]" />
              <span>Send Files</span>
            </button>
            <button
              onClick={() => {
                setMode("receive");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-md text-xs font-mono font-medium transition cursor-pointer flex items-center justify-center gap-2 ${
                mode === "receive"
                  ? "bg-[#252825] text-[#F2F3F0] border border-[#414741]"
                  : "text-[#929690] hover:text-[#F2F3F0]"
              }`}
            >
              <Download className="w-3.5 h-3.5 text-[#A3B899]" />
              <span>Receive Files</span>
            </button>
          </div>
        )}

        {/* Dynamic State Rendering */}
        <AnimatePresence mode="wait">
          {connectionState === "completed" ? (
            <TransferComplete
              key="complete"
              files={
                mode === "send"
                  ? stagedFiles.map((f) => ({ name: f.name, size: f.size }))
                  : receivedFiles
              }
              mode={mode}
              onReset={handleReset}
            />
          ) : isBusy ? (
            <motion.div
              key="busy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: duration.normal, ease: ease.standard }}
              className="space-y-6"
            >
              <ConnectionVisualizer
                state={connectionState}
                code={mode === "send" ? code : inputCode}
              />

              <TransferProgress
                currentFileName={
                  stagedFiles[currentFileIdx]?.name || "Project_Archive_Backup.tar"
                }
                currentFileIndex={currentFileIdx}
                totalFiles={stagedFiles.length || 2}
                transferredBytes={transferredBytes}
                totalBytes={totalBytes || 18450000}
                speedMBs={speedMBs}
                etaSeconds={etaSeconds}
                percent={percent}
                onCancel={handleCancel}
              />
            </motion.div>
          ) : mode === "send" ? (
            /* SEND FILES WORKSPACE */
            <motion.div
              key="send-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.normal, ease: ease.standard }}
              className="space-y-6"
            >
              <DropZone onFilesSelected={handleFilesSelected} />

              <FileList
                files={stagedFiles}
                onRemove={handleRemoveFile}
                onClear={handleClearFiles}
              />

              {/* Pairing Code Card */}
              <div className="p-4 rounded-xl border border-[#343934] bg-[#1B1D1B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#A3B899]">
                      Single-Use Pairing Code
                    </span>
                    <span className="text-[10px] font-mono text-[#929690] bg-[#252825] px-1.5 py-0.5 rounded border border-[#343934]">
                      TTL: 5m
                    </span>
                  </div>
                  <p className="text-xs text-[#929690]">
                    Receiver enters this code to establish the direct connection.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-lg bg-[#0C0D0C] border border-[#343934] font-mono text-sm font-semibold tracking-wider text-[#A3B899]">
                    {code}
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    className="p-2 rounded-lg bg-[#252825] border border-[#343934] text-[#929690] hover:text-[#F2F3F0] transition cursor-pointer"
                    title="Generate new code"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#A3B899]" />
                  </button>
                </div>
              </div>

              {/* Validation Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Primary Action Button (Sage Green Accent) */}
              <button
                type="button"
                onClick={handleStartSend}
                className="w-full py-3.5 rounded-xl bg-[#A3B899] text-[#0C0D0C] font-mono font-medium text-xs hover:bg-[#B5C8AC] active:translate-y-px transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Connect &amp; Send Files</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            /* RECEIVE FILES WORKSPACE */
            <motion.div
              key="receive-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.normal, ease: ease.standard }}
              className="space-y-6"
            >
              <div className="p-8 rounded-xl border border-[#343934] bg-[#1B1D1B] text-center space-y-4">
                <div className="w-12 h-12 rounded-full border border-[#343934] bg-[#252825] text-[#A3B899] flex items-center justify-center mx-auto">
                  <Download className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-medium text-base text-[#F2F3F0]">
                    Ready to Receive
                  </h3>
                  <p className="text-xs text-[#929690] max-w-sm mx-auto">
                    Enter the 8-character code shown on the sending device to start direct file reception.
                  </p>
                </div>

                {/* Crockford 8-character code input */}
                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                      setInputCode(v);
                      setErrorMessage(null);
                    }}
                    placeholder="XXXX-XXXX"
                    maxLength={9}
                    className="w-full px-4 py-3 rounded-xl bg-[#0C0D0C] border border-[#343934] text-center font-mono text-lg font-semibold tracking-widest text-[#A3B899] placeholder:text-[#414741] focus:outline-none focus:border-[#A3B899] transition"
                  />
                </div>
              </div>

              {/* Validation Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleStartReceive}
                className="w-full py-3.5 rounded-xl bg-[#A3B899] text-[#0C0D0C] font-mono font-medium text-xs hover:bg-[#B5C8AC] active:translate-y-px transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Connect &amp; Receive Files</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
