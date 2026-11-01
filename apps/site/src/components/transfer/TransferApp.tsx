import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Download, ArrowRight, RefreshCw, AlertCircle, Shield } from "lucide-react";
import { DropZone } from "./DropZone";
import { FileList } from "./FileList";
import { ConnectionVisualizer, type ConnectionState } from "./ConnectionVisualizer";
import { TransferProgress } from "./TransferProgress";
import { TransferComplete } from "./TransferComplete";
import { TOKENS } from "../../tokens";
import { generateCode, formatCode, isValidCode, normalizeCode } from "../../lib/pairing";

interface TransferAppProps {
  initialMode?: "send" | "receive";
  className?: string;
}

const DEMO_FILE_CONTENT = "This is a demo file generated in your browser. No transfer took place.";

function getInitialCodeFromUrl(): { code: string; error: string | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    const codeParam = url.searchParams.get("code");
    if (codeParam) {
      if (isValidCode(codeParam)) {
        return { code: formatCode(codeParam), error: null };
      } else {
        return {
          code: codeParam.toUpperCase().slice(0, 9),
          error: "Invalid pairing code in link. Crockford Base32 8-rune code required.",
        };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function TransferApp({ initialMode = "send", className = "" }: TransferAppProps) {
  const [initialDeepLink] = useState(getInitialCodeFromUrl);

  const [mode, setMode] = useState<"send" | "receive">(() => {
    if (initialDeepLink) return "receive";
    return initialMode;
  });
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [code, setCode] = useState<string>(() => generateCode());
  const [inputCode, setInputCode] = useState<string>(() => initialDeepLink?.code ?? "");
  const [connectionState, setConnectionState] = useState<ConnectionState>("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(() => initialDeepLink?.error ?? null);

  // Transfer simulation state (percent and bytes only, honest metrics)
  const [currentFileIdx, setCurrentFileIdx] = useState(0);
  const [transferredBytes, setTransferredBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [percent, setPercent] = useState(0);

  // Screen reader live region announcement
  const [announcement, setAnnouncement] = useState<string>("");
  const lastAnnouncedPercentRef = useRef<number>(-1);

  // Received files (demo text blob, object URLs revoked on reset/unmount)
  const [receivedFiles, setReceivedFiles] = useState<{ name: string; size: number; url?: string }[]>([]);
  const createdUrlsRef = useRef<string[]>([]);

  // Timer & run tracking for robust cancellation
  const runIdRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);
  const transferTimerRef = useRef<number | null>(null);

  const { duration, ease } = TOKENS.motion;

  const schedule = useCallback((fn: () => void, ms: number, runId: number) => {
    const id = window.setTimeout(() => {
      if (runIdRef.current === runId) fn();
    }, ms);
    timeoutsRef.current.push(id);
  }, []);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(window.clearTimeout);
    timeoutsRef.current = [];
    if (transferTimerRef.current) {
      window.clearInterval(transferTimerRef.current);
      transferTimerRef.current = null;
    }
  }, []);

  const revokeAllUrls = useCallback(() => {
    createdUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    });
    createdUrlsRef.current = [];
  }, []);

  // Announce live region updates (throttled to 25% steps during progress)
  const announce = useCallback((msg: string) => {
    setAnnouncement(msg);
  }, []);

  // Clean deep link ?code= from URL without refresh (T17)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("code")) {
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname + (url.search ? `?${url.searchParams.toString()}` : "") + url.hash);
      }
    } catch {
      // ignore URL parsing error
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const currentRun = runIdRef;
    return () => {
      currentRun.current++;
      clearTimers();
      revokeAllUrls();
    };
  }, [clearTimers, revokeAllUrls]);

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
    setCode(generateCode());
  };

  // Start Transfer (Send Mode - Interactive Simulation)
  const handleStartSend = () => {
    if (stagedFiles.length === 0) {
      setErrorMessage("Please select at least one file to transfer.");
      return;
    }

    const runId = ++runIdRef.current;
    clearTimers();
    setErrorMessage(null);
    setConnectionState("waiting");
    lastAnnouncedPercentRef.current = -1;
    announce("Discovering demo peer...");

    const total = stagedFiles.reduce((acc, f) => acc + f.size, 0);
    setTotalBytes(total);
    setTransferredBytes(0);
    setCurrentFileIdx(0);
    setPercent(0);

    // Step through simulated handshake and transfer
    schedule(() => {
      setConnectionState("connecting");
      announce("Simulating key exchange...");

      schedule(() => {
        setConnectionState("connected");
        announce("Connected to simulated peer.");

        schedule(() => {
          setConnectionState("transferring");
          announce("Transferring files (simulated)...");

          let currentPercent = 0;
          const interval = window.setInterval(() => {
            if (runIdRef.current !== runId) {
              clearInterval(interval);
              return;
            }

            currentPercent += 5;
            if (currentPercent >= 100) {
              clearInterval(interval);
              setPercent(100);
              setTransferredBytes(total);
              setCurrentFileIdx(stagedFiles.length - 1);
              setConnectionState("completed");
              announce("Demo complete. Nothing was sent.");
            } else {
              setPercent(currentPercent);
              const currentBytes = Math.round((currentPercent / 100) * total);
              setTransferredBytes(currentBytes);

              // Advance currentFileIdx derived from cumulative bytes
              let running = 0;
              let fileIdx = 0;
              for (let i = 0; i < stagedFiles.length; i++) {
                running += stagedFiles[i].size;
                if (currentBytes < running || i === stagedFiles.length - 1) {
                  fileIdx = i;
                  break;
                }
              }
              setCurrentFileIdx(fileIdx);

              // Throttle screen reader announcement to 25% steps
              const step = Math.floor(currentPercent / 25) * 25;
              if (step > 0 && step !== lastAnnouncedPercentRef.current) {
                lastAnnouncedPercentRef.current = step;
                announce(`Transfer ${step}%`);
              }
            }
          }, 80);

          transferTimerRef.current = interval;
        }, 500, runId);
      }, 700, runId);
    }, 600, runId);
  };

  // Start Receive Mode (Interactive Simulation)
  const handleStartReceive = () => {
    if (!isValidCode(inputCode)) {
      setErrorMessage("Please enter a valid 8-character Crockford pairing code (e.g. K7M2-Q9XD).");
      return;
    }

    const runId = ++runIdRef.current;
    clearTimers();
    revokeAllUrls();

    setErrorMessage(null);
    setConnectionState("connecting");
    lastAnnouncedPercentRef.current = -1;
    announce("Connecting to simulated peer...");

    // Honest single demo file
    const demoBlob = new Blob([DEMO_FILE_CONTENT], { type: "text/plain" });
    const demoSize = demoBlob.size;
    setTotalBytes(demoSize);
    setTransferredBytes(0);
    setCurrentFileIdx(0);
    setPercent(0);

    schedule(() => {
      setConnectionState("connected");
      announce("Connected to simulated sender.");

      schedule(() => {
        setConnectionState("transferring");
        announce("Receiving demo file...");

        let currentPercent = 0;
        const interval = window.setInterval(() => {
          if (runIdRef.current !== runId) {
            clearInterval(interval);
            return;
          }

          currentPercent += 10;
          if (currentPercent >= 100) {
            clearInterval(interval);
            setPercent(100);
            setTransferredBytes(demoSize);

            const objectUrl = URL.createObjectURL(demoBlob);
            createdUrlsRef.current.push(objectUrl);
            setReceivedFiles([{ name: "nasend-demo.txt", size: demoSize, url: objectUrl }]);

            setConnectionState("completed");
            announce("Demo complete: 1 file. Nothing was sent.");
          } else {
            setPercent(currentPercent);
            setTransferredBytes(Math.round((currentPercent / 100) * demoSize));

            const step = Math.floor(currentPercent / 25) * 25;
            if (step > 0 && step !== lastAnnouncedPercentRef.current) {
              lastAnnouncedPercentRef.current = step;
              announce(`Receive ${step}%`);
            }
          }
        }, 70);

        transferTimerRef.current = interval;
      }, 500, runId);
    }, 700, runId);
  };

  const handleCancel = () => {
    runIdRef.current++;
    clearTimers();
    setConnectionState("ready");
    setPercent(0);
    setTransferredBytes(0);
    announce("Transfer cancelled");
  };

  const handleReset = () => {
    handleCancel();
    revokeAllUrls();
    setStagedFiles([]);
    setReceivedFiles([]);
    setCode(generateCode());
    setInputCode("");
    setErrorMessage(null);
    announce("Workspace reset to ready state");
  };

  const isBusy =
    connectionState === "waiting" ||
    connectionState === "connecting" ||
    connectionState === "connected" ||
    connectionState === "transferring";

  const isReceiveValid = isValidCode(inputCode);

  return (
    <div className={`window-frame w-full max-w-2xl mx-auto ${className}`}>
      {/* Visually hidden live region for screen readers (T10.2) */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

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
          <span>Interactive demo</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 bg-[#0C0D0C] space-y-6">
        {/* Mode Switcher Tabs (Send Files vs Receive Files) */}
        {!isBusy && connectionState !== "completed" && (
          <div className="flex items-center p-1 rounded-lg bg-[#1B1D1B] border border-[#343934]">
            <button
              type="button"
              onClick={() => {
                setMode("send");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-md text-xs font-mono font-medium transition cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899] ${
                mode === "send"
                  ? "bg-[#252825] text-[#F2F3F0] border border-[#414741]"
                  : "text-[#929690] hover:text-[#F2F3F0]"
              }`}
            >
              <Send className="w-3.5 h-3.5 text-[#A3B899]" />
              <span>Send Files</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("receive");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-md text-xs font-mono font-medium transition cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899] ${
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
                  mode === "send"
                    ? stagedFiles[currentFileIdx]?.name || "payload.bin"
                    : "nasend-demo.txt"
                }
                currentFileIndex={currentFileIdx}
                totalFiles={mode === "send" ? stagedFiles.length : 1}
                transferredBytes={transferredBytes}
                totalBytes={totalBytes}
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
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#A3B899]">
                      Single-Use Pairing Code
                    </span>
                    <span className="text-[11px] font-mono text-[#929690] bg-[#252825] px-1.5 py-0.5 rounded border border-[#343934]">
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
                    className="p-2 rounded-lg bg-[#252825] border border-[#343934] text-[#929690] hover:text-[#F2F3F0] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899]"
                    title="Generate new pairing code"
                    aria-label="Generate new pairing code"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#A3B899]" />
                  </button>
                </div>
              </div>

              {/* Validation Error Message */}
              {errorMessage && (
                <div
                  id="send-error"
                  role="alert"
                  className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleStartSend}
                aria-describedby={errorMessage ? "send-error" : undefined}
                className="w-full py-3.5 rounded-xl bg-[#A3B899] text-[#0C0D0C] font-mono font-medium text-xs hover:bg-[#B5C8AC] active:translate-y-px transition cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D0C]"
              >
                <span>Connect &amp; Send Files (Demo)</span>
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
                  <p id="pairing-code-help" className="text-xs text-[#929690] max-w-sm mx-auto">
                    Enter the 8-character code shown on the sending device to start file reception.
                  </p>
                </div>

                {/* Crockford 8-character code input with strict validation */}
                <div className="max-w-xs mx-auto space-y-1.5">
                  <label htmlFor="pairing-code-input" className="sr-only">
                    8-character pairing code
                  </label>
                  <input
                    id="pairing-code-input"
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      const v = formatCode(e.target.value);
                      setInputCode(v);
                      setErrorMessage(null);
                    }}
                    placeholder="XXXX-XXXX"
                    maxLength={9}
                    autoComplete="off"
                    inputMode="text"
                    autoCapitalize="characters"
                    spellCheck="false"
                    aria-describedby={errorMessage ? "pairing-code-error" : "pairing-code-help"}
                    aria-invalid={!isReceiveValid && normalizeCode(inputCode).length > 0}
                    className="w-full px-4 py-3 rounded-xl bg-[#0C0D0C] border border-[#343934] text-center font-mono text-lg font-semibold tracking-widest text-[#A3B899] placeholder:text-[#414741] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D0C] transition"
                  />
                  {normalizeCode(inputCode).length > 0 && !isReceiveValid && (
                    <p className="text-[11px] font-mono text-[#929690]">
                      Format: 8 runes (A-Z, 2-9, excluding I, L, O, U)
                    </p>
                  )}
                </div>
              </div>

              {/* Validation Error Message */}
              {errorMessage && (
                <div
                  id="pairing-code-error"
                  role="alert"
                  className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleStartReceive}
                disabled={!isReceiveValid}
                className={`w-full py-3.5 rounded-xl font-mono font-medium text-xs transition flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D0C] ${
                  isReceiveValid
                    ? "bg-[#A3B899] text-[#0C0D0C] hover:bg-[#B5C8AC] active:translate-y-px cursor-pointer"
                    : "bg-[#252825] text-[#929690] border border-[#343934] cursor-not-allowed opacity-60"
                }`}
              >
                <span>Connect &amp; Receive (Demo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
