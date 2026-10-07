import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Loader2 } from "lucide-react";
import { generatePairingCode, joinPairing } from "../lib/tauri";

interface PairingDialogProps {
  initialCode?: string | null;
  onClose: () => void;
  onSuccess: (deviceName: string) => void;
}

export const PairingDialog: React.FC<PairingDialogProps> = ({
  initialCode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<"show" | "enter">(initialCode ? "show" : "enter");
  const [code, setCode] = useState<string>(initialCode || "");
  const [inputCode, setInputCode] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 min
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "show" && !code) {
      generatePairingCode()
        .then((c) => {
          setCode(c);
          setTimeLeft(300);
        })
        .catch((e) => setError(String(e)));
    }
  }, [mode, code]);

  useEffect(() => {
    if (mode === "show" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [mode, timeLeft]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
      .toUpperCase()
      .replace(/[^ABCDEFGHJKMNPQRSTVWXYZ23456789]/g, "");
    if (raw.length <= 4) {
      setInputCode(raw);
    } else {
      setInputCode(`${raw.slice(0, 4)}-${raw.slice(4, 8)}`);
    }
  };

  const handleJoin = async () => {
    if (inputCode.replace("-", "").length !== 8) return;
    setLoading(true);
    setStatusMessage("Connecting to signaling server...");
    setError(null);
    try {
      const peerName = await joinPairing(inputCode);
      setStatusMessage(`Verified and paired with ${peerName}!`);
      setTimeout(() => {
        onSuccess(peerName);
        onClose();
      }, 1500);
    } catch (e) {
      setError(String(e));
      setStatusMessage("");
    } finally {
      setLoading(false);
    }
  };

  const qrValue = `nas://join?room=${code.replace("-", "")}&v=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1B1E24] border border-[#262A33] rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {mode === "show" ? "Share This Device" : "Pair With Device"}
        </h2>

        {/* Tab switch */}
        <div className="flex bg-[#121418] p-1 rounded-xl mb-6">
          <button
            onClick={() => setMode("show")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              mode === "show" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Show Code
          </button>
          <button
            onClick={() => setMode("enter")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              mode === "enter" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Enter Code
          </button>
        </div>

        {mode === "show" ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl mb-4 shadow-md">
              <QRCodeSVG value={qrValue} size={180} />
            </div>

            <div className="flex items-center gap-3 bg-[#121418] px-4 py-2 rounded-xl mb-2 border border-[#262A33]">
              <span className="font-mono text-2xl font-black tracking-widest text-primary">
                {code || "••••-••••"}
              </span>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition"
                title="Copy code"
              >
                {copied ? <Check className="w-5 h-5 text-secondary" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Expires in {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Enter 8-Character Pairing Code
            </label>
            <input
              type="text"
              value={inputCode}
              onChange={handleInputChange}
              placeholder="K7M2-Q9XD"
              maxLength={9}
              className="bg-[#121418] border border-[#262A33] rounded-xl px-4 py-3 font-mono text-2xl text-center font-bold tracking-widest text-primary focus:outline-none focus:border-primary mb-4"
            />
            <button
              onClick={handleJoin}
              disabled={loading || inputCode.replace("-", "").length !== 8}
              className="w-full py-3 bg-primary hover:bg-blue-600 disabled:opacity-40 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Connect & Verify
            </button>
          </div>
        )}

        {statusMessage && (
          <p className="mt-4 text-center text-sm font-medium text-secondary">
            {statusMessage}
          </p>
        )}

        {error && (
          <p className="mt-4 text-center text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
