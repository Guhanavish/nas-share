import { motion } from "motion/react";
import { PcIcon, PhoneIcon } from "../brand/DeviceIcons";
import { TOKENS } from "../../tokens";

export type ConnectionState =
  | "ready"
  | "waiting"
  | "connecting"
  | "connected"
  | "transferring"
  | "completed"
  | "failed"
  | "disconnected";

interface ConnectionVisualizerProps {
  state: ConnectionState;
  senderLabel?: string;
  receiverLabel?: string;
  code?: string;
}

export function ConnectionVisualizer({
  state,
  senderLabel = "Local Device",
  receiverLabel = "Remote Peer",
  code,
}: ConnectionVisualizerProps) {
  const isConnected = state === "connected" || state === "transferring" || state === "completed";
  const isTransferring = state === "transferring";
  const isFailed = state === "failed" || state === "disconnected";
  const { duration, ease } = TOKENS.motion;

  return (
    <div className="w-full p-4 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-3">
      {/* Topology Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[#929690] pb-2 border-b border-[#343934]">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isConnected
                ? "bg-[#A3B899]"
                : state === "connecting" || state === "waiting"
                ? "bg-[#A3B899]/60 animate-pulse"
                : isFailed
                ? "bg-rose-400"
                : "bg-[#414741]"
            }`}
          />
          <span className="uppercase tracking-wider">
            {state === "ready"
              ? "Standby"
              : state === "waiting"
              ? "Waiting for peer"
              : state === "connecting"
              ? "Handshake in progress"
              : state === "connected"
              ? "Encrypted P2P Active"
              : state === "transferring"
              ? "Transferring at line-rate"
              : state === "completed"
              ? "Transfer Complete"
              : "Disconnected"}
          </span>
        </span>

        {code && (
          <span className="text-[#A3B899] font-medium tracking-wider">
            Room: {code}
          </span>
        )}
      </div>

      {/* Abstract Device Connection Path */}
      <div className="relative py-4 flex items-center justify-between px-4 sm:px-8">
        {/* Device A (Sender) */}
        <div className="flex flex-col items-center gap-1.5 z-10">
          <div
            className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-colors ${
              isConnected
                ? "border-[#A3B899] bg-[#252825] text-[#A3B899]"
                : "border-[#343934] bg-[#252825] text-[#F2F3F0]"
            }`}
          >
            <PcIcon size={20} />
          </div>
          <span className="text-[11px] font-mono text-[#929690]">{senderLabel}</span>
        </div>

        {/* Center Connecting Path */}
        <div className="relative flex-1 mx-4 sm:mx-8 h-8 flex items-center">
          {/* Base hairline connection wire */}
          <div className="w-full h-[1.5px] bg-[#343934]" />

          {/* Active Sage Connection Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isConnected ? 1 : state === "connecting" ? 0.5 : 0 }}
            transition={{ duration: duration.normal, ease: ease.standard }}
            className="absolute inset-x-0 h-[1.5px] bg-[#A3B899] origin-left"
          />

          {/* Transfer particles moving between devices */}
          {isTransferring && (
            <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
              <motion.div
                initial={{ x: "-10%" }}
                animate={{ x: "110%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "linear",
                }}
                className="w-2.5 h-2.5 rounded-full bg-[#A3B899] shadow-[0_0_8px_rgba(163,184,153,0.6)]"
              />
              <motion.div
                initial={{ x: "-30%" }}
                animate={{ x: "110%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: 0.4,
                  ease: "linear",
                }}
                className="w-2 h-2 rounded-full bg-[#A3B899]/70"
              />
            </div>
          )}

          {/* Protocol pill badge in center */}
          <div className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#0C0D0C] border border-[#343934] text-[10px] font-mono text-[#929690] select-none">
            {isConnected ? "DTLS 1.3" : "Signaling"}
          </div>
        </div>

        {/* Device B (Receiver) */}
        <div className="flex flex-col items-center gap-1.5 z-10">
          <div
            className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-colors ${
              isConnected
                ? "border-[#A3B899] bg-[#252825] text-[#A3B899]"
                : "border-[#343934] bg-[#252825] text-[#929690]"
            }`}
          >
            <PhoneIcon size={20} />
          </div>
          <span className="text-[11px] font-mono text-[#929690]">{receiverLabel}</span>
        </div>
      </div>
    </div>
  );
}
