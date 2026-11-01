import { motion } from "motion/react";
import { PcIcon, PhoneIcon } from "../brand/DeviceIcons";
import { Check } from "lucide-react";
import { TOKENS } from "../../tokens";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

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
  const reduced = usePrefersReducedMotion();
  const { duration, ease } = TOKENS.motion;

  // Item 23: Map connection status to 4 visible steps
  // 0: Discovering, 1: Exchanging keys, 2: Identity pinned, 3: Streaming
  let currentStepIdx = -1;
  if (state === "waiting") currentStepIdx = 0;
  else if (state === "connecting") currentStepIdx = 1;
  else if (state === "connected") currentStepIdx = 2;
  else if (state === "transferring" || state === "completed") currentStepIdx = 3;

  const stepperSteps = [
    { label: "Discovering" },
    { label: "Exchanging keys" },
    { label: "Identity pinned" },
    { label: "Streaming" },
  ];

  return (
    <div className="w-full p-4 rounded-xl border border-[#343934] bg-[#1B1D1B] space-y-4">
      {/* Topology Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[#929690] pb-2 border-b border-[#343934]">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isConnected
                ? "bg-[#A3B899]"
                : state === "connecting" || state === "waiting"
                ? "bg-[#A3B899]/60 motion-safe:animate-pulse"
                : isFailed
                ? "bg-rose-400"
                : "bg-[#414741]"
            }`}
          />
          <span className="uppercase tracking-wider">
            {state === "ready"
              ? "Standby"
              : state === "waiting"
              ? "Discovering peer"
              : state === "connecting"
              ? "Exchanging keys"
              : state === "connected"
              ? "Identity pinned"
              : state === "transferring"
              ? "Streaming chunks"
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
      <div className="relative py-2 flex items-center justify-between px-4 sm:px-8">
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
          {isTransferring && !reduced && (
            <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
              <motion.div
                initial={{ x: "-10%" }}
                animate={{ x: "110%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "linear",
                }}
                className="w-2 h-2 rounded-full bg-[#A3B899]"
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
                className="w-1.5 h-1.5 rounded-full bg-[#A3B899]/70"
              />
            </div>
          )}

          {/* Protocol pill badge in center */}
          <div className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#0C0D0C] border border-[#343934] text-[10px] font-mono text-[#929690] select-none">
            {isConnected ? "DTLS" : "Signaling"}
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

      {/* Item 23: Handshake Stepper */}
      {currentStepIdx >= 0 && (
        <div className="pt-2 border-t border-[#343934]/60">
          <div className="grid grid-cols-4 gap-2">
            {stepperSteps.map((step, idx) => {
              const isPast = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={step.label} className="flex flex-col items-center gap-1 text-center">
                  <div className="flex items-center w-full justify-center relative">
                    {/* Connector line between stepper dots */}
                    {idx > 0 && (
                      <div className="absolute right-1/2 left-[-50%] top-1/2 -translate-y-1/2 h-[1px] bg-[#343934] -z-0">
                        <div
                          className="h-full bg-[#A3B899] origin-left transition-all duration-300"
                          style={{
                            transform: `scaleX(${isPast || isCurrent ? 1 : 0})`,
                          }}
                        />
                      </div>
                    )}

                    {/* Step Icon / Dot */}
                    <div
                      className={`relative z-10 w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                        isPast
                          ? "bg-[#A3B899] border-[#A3B899] text-[#0C0D0C]"
                          : isCurrent
                          ? "bg-[#252825] border-[#A3B899] text-[#A3B899]"
                          : "bg-[#0C0D0C] border-[#343934] text-transparent"
                      }`}
                    >
                      {isPast ? (
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      ) : isCurrent ? (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#A3B899]" />
                          {!reduced && (
                            <motion.span
                              initial={{ scale: 1, opacity: 0.8 }}
                              animate={{ scale: 2.2, opacity: 0 }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                              className="absolute inset-0 rounded-full border border-[#A3B899]"
                            />
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[9px] tracking-tight ${
                      isCurrent
                        ? "text-[#A3B899] font-medium"
                        : isPast
                        ? "text-[#F2F3F0]"
                        : "text-[#929690]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
