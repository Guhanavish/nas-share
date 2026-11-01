import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhoneIcon, PcIcon, TvIcon, CloudRelayIcon } from "../brand/DeviceIcons";
import { TOKENS } from "../../tokens";
import { useActive } from "../../lib/useActive";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

export function LiveDeviceDiagram() {
  const [mode, setMode] = useState<"lan" | "wan">("lan");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [wanPhase, setWanPhase] = useState<"signaling" | "direct">("signaling");
  const [pingKey, setPingKey] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isActive = useActive(containerRef);
  const reduced = usePrefersReducedMotion();

  const { ease } = TOKENS.motion;
  const isLan = mode === "lan";

  // Re-trigger discovery ping once when switching mode
  const handleModeChange = (newMode: "lan" | "wan") => {
    if (newMode !== mode) {
      setMode(newMode);
      setPingKey((k) => k + 1);
    }
  };

  // Item 5: WAN 6s cycle (2s signaling, 4s direct)
  useEffect(() => {
    if (isLan || reduced || !isActive) return;

    let timer: number;
    const runCycle = () => {
      setWanPhase("signaling");
      timer = window.setTimeout(() => {
        setWanPhase("direct");
        timer = window.setTimeout(runCycle, 4000);
      }, 2000);
    };

    timer = window.setTimeout(runCycle, 100);

    return () => window.clearTimeout(timer);
  }, [isLan, reduced, isActive]);

  const currentWanPhase = (isLan || reduced || !isActive) ? "direct" : wanPhase;

  // Coordinates: Phone=(60, 60), PC=(300, 60), TV=(180, 175), Relay=(180, 100)
  return (
    <div ref={containerRef} className="window-frame">
      {/* Titlebar & Mode Switcher */}
      <div className="window-header">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A3B899] inline-block motion-safe:animate-pulse" />
          <span className="text-[#F2F3F0]">device_connection_topology</span>
        </div>

        {/* LAN / WAN Toggle */}
        <div className="flex items-center gap-1 bg-[#0C0D0C] p-0.5 rounded border border-[#343934] text-[10px]">
          <button
            type="button"
            onClick={() => handleModeChange("lan")}
            className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
              isLan
                ? "bg-[#252825] text-[#F2F3F0] font-medium border border-[#414741]"
                : "text-[#929690] hover:text-[#F2F3F0]"
            }`}
          >
            Direct LAN
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("wan")}
            className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
              !isLan
                ? "bg-[#252825] text-[#F2F3F0] font-medium border border-[#414741]"
                : "text-[#929690] hover:text-[#F2F3F0]"
            }`}
          >
            Encrypted WAN
          </button>
        </div>
      </div>

      {/* Schematic Canvas */}
      <div className="relative p-6 h-64 sm:h-72 flex items-center justify-center bg-[#0C0D0C] select-none">
        <svg viewBox="0 0 360 220" fill="none" className="w-full h-full text-[#343934]">
          {/* Item 6: Discovery pings on mount/mode change (Phone, PC, TV: 150ms apart, 0.9s duration, r 14→28) */}
          {!reduced && (
            <g key={pingKey}>
              {/* Phone ping */}
              <motion.circle
                cx="60"
                cy="60"
                r="14"
                stroke="#A3B899"
                strokeWidth="1"
                fill="none"
                initial={{ r: 14, opacity: 0.5 }}
                animate={{ r: 28, opacity: 0 }}
                transition={{ duration: 0.9, delay: 0, ease: ease.standard }}
              />
              {/* PC ping */}
              <motion.circle
                cx="300"
                cy="60"
                r="14"
                stroke="#A3B899"
                strokeWidth="1"
                fill="none"
                initial={{ r: 14, opacity: 0.5 }}
                animate={{ r: 28, opacity: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: ease.standard }}
              />
              {/* TV ping */}
              <motion.circle
                cx="180"
                cy="175"
                r="14"
                stroke="#A3B899"
                strokeWidth="1"
                fill="none"
                initial={{ r: 14, opacity: 0.5 }}
                animate={{ r: 28, opacity: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease: ease.standard }}
              />
            </g>
          )}

          {isLan ? (
            /* Direct LAN Connection Paths */
            <>
              {/* Phone (60, 60) to PC (300, 60) */}
              <line
                x1="60"
                y1="60"
                x2="300"
                y2="60"
                stroke="#A3B899"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              {/* Phone (60, 60) to TV (180, 175) */}
              <line
                x1="60"
                y1="60"
                x2="180"
                y2="175"
                stroke="#A3B899"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              {/* PC (300, 60) to TV (180, 175) */}
              <line
                x1="300"
                y1="60"
                x2="180"
                y2="175"
                stroke="#A3B899"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.3"
              />

              {/* Item 4: Packets traveling along LAN paths (transform-only, 1.6s trip) */}
              {!reduced && isActive && (
                <>
                  {/* Phone -> PC: delta x=240, y=0 */}
                  <motion.g
                    initial={{ x: 60, y: 60 }}
                    animate={{
                      x: [60, 300],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      repeatDelay: 0.4,
                      ease: "linear",
                    }}
                  >
                    <circle r="2.5" fill="#A3B899" />
                  </motion.g>

                  {/* Phone -> TV: delta x=120, y=115 */}
                  <motion.g
                    initial={{ x: 60, y: 60 }}
                    animate={{
                      x: [60, 180],
                      y: [60, 175],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 1.6,
                      delay: 0.5,
                      repeat: Infinity,
                      repeatDelay: 0.4,
                      ease: "linear",
                    }}
                  >
                    <circle r="2.5" fill="#A3B899" />
                  </motion.g>

                  {/* PC <-> TV: delta x=-120, y=115 */}
                  <motion.g
                    initial={{ x: 300, y: 60 }}
                    animate={{
                      x: [300, 180],
                      y: [60, 175],
                      opacity: [0, 0.7, 0.7, 0],
                    }}
                    transition={{
                      duration: 1.6,
                      delay: 1.0,
                      repeat: Infinity,
                      repeatDelay: 0.4,
                      ease: "linear",
                    }}
                  >
                    <circle r="2" fill="#A3B899" />
                  </motion.g>
                </>
              )}
            </>
          ) : (
            /* WAN Relayed through Cloudflare Worker (180, 100) */
            <>
              {/* Relay lines (fade to 15% in direct phase) */}
              <line
                x1="60"
                y1="60"
                x2="180"
                y2="100"
                stroke="#929690"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity={currentWanPhase === "signaling" ? 0.6 : 0.15}
                className="transition-opacity duration-300"
              />
              <line
                x1="300"
                y1="60"
                x2="180"
                y2="100"
                stroke="#929690"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity={currentWanPhase === "signaling" ? 0.6 : 0.15}
                className="transition-opacity duration-300"
              />
              <line
                x1="180"
                y1="175"
                x2="180"
                y2="100"
                stroke="#929690"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity={currentWanPhase === "signaling" ? 0.6 : 0.15}
                className="transition-opacity duration-300"
              />

              {/* Direct path draws between devices during direct phase */}
              <motion.line
                x1="60"
                y1="60"
                x2="300"
                y2="60"
                stroke="#A3B899"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                animate={{ opacity: currentWanPhase === "direct" ? 0.6 : 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Packets in WAN mode */}
              {!reduced && isActive && currentWanPhase === "signaling" && (
                <motion.g
                  initial={{ x: 60, y: 60 }}
                  animate={{
                    x: [60, 180],
                    y: [60, 100],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <circle r="2" fill="#929690" />
                </motion.g>
              )}

              {!reduced && isActive && currentWanPhase === "direct" && (
                <motion.g
                  initial={{ x: 60, y: 60 }}
                  animate={{
                    x: [60, 300],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    repeatDelay: 0.3,
                    ease: "linear",
                  }}
                >
                  <circle r="2.5" fill="#A3B899" />
                </motion.g>
              )}
            </>
          )}
        </svg>

        {/* Central Relay Node (Shown in WAN mode) */}
        {!isLan && (
          <div
            className={`absolute top-[100px] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-opacity duration-300 ${
              currentWanPhase === "signaling" ? "opacity-100" : "opacity-40"
            }`}
          >
            <div className="w-8 h-8 rounded-lg border border-[#343934] bg-[#1B1D1B] flex items-center justify-center text-[#929690]">
              <CloudRelayIcon size={16} />
            </div>
            <span className="font-mono text-[9px] text-[#929690] mt-1">Signaling DO</span>
          </div>
        )}

        {/* Item 7: Node 1: Phone (Top-Left) with hover & focus tooltip */}
        <div
          tabIndex={0}
          role="img"
          aria-label="Phone Android Device Node"
          aria-describedby="tooltip-phone"
          onMouseEnter={() => setHoveredNode("phone")}
          onMouseLeave={() => setHoveredNode(null)}
          onFocus={() => setHoveredNode("phone")}
          onBlur={() => setHoveredNode(null)}
          onClick={() => setHoveredNode((curr) => (curr === "phone" ? null : "phone"))}
          className="absolute top-4 left-6 flex flex-col items-center cursor-pointer group outline-none"
        >
          <div className="w-12 h-12 rounded-xl border border-[#343934] bg-[#1B1D1B] flex items-center justify-center text-[#F2F3F0] group-hover:border-[#A3B899] group-focus-visible:border-[#A3B899] transition">
            <PhoneIcon size={20} />
          </div>
          <span className="font-mono text-[11px] text-[#F2F3F0] mt-1.5">Phone · Android</span>
          <span className="font-mono text-[9px] text-[#929690]">{isLan ? "HTTP :8743" : "WebRTC · DTLS"}</span>
        </div>

        {/* Item 7: Node 2: PC (Top-Right) */}
        <div
          tabIndex={0}
          role="img"
          aria-label="PC Windows Device Node"
          aria-describedby="tooltip-pc"
          onMouseEnter={() => setHoveredNode("pc")}
          onMouseLeave={() => setHoveredNode(null)}
          onFocus={() => setHoveredNode("pc")}
          onBlur={() => setHoveredNode(null)}
          onClick={() => setHoveredNode((curr) => (curr === "pc" ? null : "pc"))}
          className="absolute top-4 right-6 flex flex-col items-center cursor-pointer group outline-none"
        >
          <div className="w-12 h-12 rounded-xl border border-[#343934] bg-[#1B1D1B] flex items-center justify-center text-[#F2F3F0] group-hover:border-[#A3B899] group-focus-visible:border-[#A3B899] transition">
            <PcIcon size={20} />
          </div>
          <span className="font-mono text-[11px] text-[#F2F3F0] mt-1.5">PC · Windows</span>
          <span className="font-mono text-[9px] text-[#929690]">{isLan ? "HTTP :8743" : "WebRTC · DTLS"}</span>
        </div>

        {/* Item 7: Node 3: TV (Bottom-Center) */}
        <div
          tabIndex={0}
          role="img"
          aria-label="TV Android TV Device Node"
          aria-describedby="tooltip-tv"
          onMouseEnter={() => setHoveredNode("tv")}
          onMouseLeave={() => setHoveredNode(null)}
          onFocus={() => setHoveredNode("tv")}
          onBlur={() => setHoveredNode(null)}
          onClick={() => setHoveredNode((curr) => (curr === "tv" ? null : "tv"))}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group outline-none"
        >
          <div className="w-12 h-12 rounded-xl border border-[#343934] bg-[#1B1D1B] flex items-center justify-center text-[#F2F3F0] group-hover:border-[#A3B899] group-focus-visible:border-[#A3B899] transition">
            <TvIcon size={20} />
          </div>
          <span className="font-mono text-[11px] text-[#F2F3F0] mt-1.5">TV</span>
          <span className="font-mono text-[9px] text-[#929690]">{isLan ? "HTTP :8743" : "WebRTC · DTLS"}</span>
        </div>

        {/* Active Node Detail Tooltip (Fade + 4px rise, 0.18s) */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              id={`tooltip-${hoveredNode}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18, ease: ease.standard }}
              className="absolute bottom-2 left-4 font-mono text-[10px] text-[#A3B899] bg-[#252825] px-2.5 py-1 rounded-md border border-[#343934] z-20 pointer-events-none"
            >
              {hoveredNode === "phone"
                ? `Phone · Android (${isLan ? "HTTP :8743" : "WebRTC · DTLS"})`
                : hoveredNode === "pc"
                ? `PC · Windows (${isLan ? "HTTP :8743" : "WebRTC · DTLS"})`
                : `TV (${isLan ? "HTTP :8743" : "WebRTC · DTLS"})`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item 5 Caption & Footer bar */}
      <div className="px-4 py-2 border-t border-[#343934] bg-[#1B1D1B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] font-mono text-[#929690]">
        <span>
          {!isLan ? (
            <span className="text-[#A3B899]">
              {currentWanPhase === "signaling"
                ? "Signaling via Worker (room code + SDP/ICE)"
                : "Data channel, DTLS. No file bytes touch the server."}
            </span>
          ) : (
            "Direct LAN: HTTP :8743"
          )}
        </span>
        <span className="text-[#A3B899]">{isLan ? "Direct Socket" : "DTLS DataChannel"}</span>
      </div>
    </div>
  );
}
