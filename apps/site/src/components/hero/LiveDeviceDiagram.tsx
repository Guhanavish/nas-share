import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhoneIcon, PcIcon, TvIcon, CloudRelayIcon } from "../brand/DeviceIcons";
import { TOKENS } from "../../tokens";

export function LiveDeviceDiagram() {
  const [mode, setMode] = useState<"lan" | "wan">("lan");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { duration, ease } = TOKENS.motion;
  const isLan = mode === "lan";

  return (
    <div className="window-frame">
      {/* Titlebar & Mode Switcher */}
      <div className="window-header">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A3B899] inline-block animate-pulse" />
          <span className="text-[#F2F3F0]">device_connection_topology</span>
        </div>

        {/* LAN / WAN Toggle */}
        <div className="flex items-center gap-1 bg-[#0C0D0C] p-0.5 rounded border border-[#343934] text-[10px]">
          <button
            onClick={() => setMode("lan")}
            className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
              isLan ? "bg-[#252825] text-[#F2F3F0] font-medium border border-[#414741]" : "text-[#929690] hover:text-[#F2F3F0]"
            }`}
          >
            Direct LAN
          </button>
          <button
            onClick={() => setMode("wan")}
            className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
              !isLan ? "bg-[#252825] text-[#F2F3F0] font-medium border border-[#414741]" : "text-[#929690] hover:text-[#F2F3F0]"
            }`}
          >
            Encrypted WAN
          </button>
        </div>
      </div>

      {/* Schematic Canvas */}
      <div className="relative p-6 h-64 sm:h-72 flex items-center justify-center bg-[#0C0D0C] select-none">
        <svg viewBox="0 0 360 220" fill="none" className="w-full h-full text-[#343934]">
          {isLan ? (
            /* Direct LAN Connection Paths */
            <>
              {/* Phone (60, 60) to PC (300, 60) */}
              <motion.line
                x1="60"
                y1="60"
                x2="300"
                y2="60"
                stroke="#A3B899"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: duration.normal }}
              />
              {/* PC (300, 60) to TV (180, 175) */}
              <motion.line
                x1="300"
                y1="60"
                x2="180"
                y2="175"
                stroke="#A3B899"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: duration.normal }}
              />
              {/* TV (180, 175) to Phone (60, 60) */}
              <motion.line
                x1="180"
                y1="175"
                x2="60"
                y2="60"
                stroke="#A3B899"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: duration.normal }}
              />

              {/* Moving sage particles between devices */}
              <circle r="3" fill="#A3B899">
                <animateMotion
                  path="M 60 60 L 300 60 L 180 175 Z"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="2" fill="#A3B899" opacity="0.6">
                <animateMotion
                  path="M 300 60 L 60 60"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          ) : (
            /* WAN Relayed through Cloudflare Worker (180, 100) */
            <>
              <motion.line
                x1="60"
                y1="60"
                x2="180"
                y2="100"
                stroke="#929690"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: duration.normal }}
              />
              <motion.line
                x1="300"
                y1="60"
                x2="180"
                y2="100"
                stroke="#929690"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: duration.normal }}
              />
              <motion.line
                x1="180"
                y1="175"
                x2="180"
                y2="100"
                stroke="#929690"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: duration.normal }}
              />

              {/* Moving packet to relay */}
              <circle r="3" fill="#A3B899">
                <animateMotion
                  path="M 60 60 L 180 100 L 300 60"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
        </svg>

        {/* Central Relay Node (Shown in WAN mode) */}
        {!isLan && (
          <div className="absolute top-[100px] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-8 h-8 rounded-lg border border-[#343934] bg-[#1B1D1B] flex items-center justify-center text-[#929690]">
              <CloudRelayIcon size={16} />
            </div>
            <span className="font-mono text-[9px] text-[#929690] mt-1">Signaling DO</span>
          </div>
        )}

        {/* Node 1: Phone (Top-Left) with hover tooltip */}
        <div
          onMouseEnter={() => setHoveredNode("phone")}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute top-4 left-6 flex flex-col items-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl border border-[#343934] bg-[#1B1D1B] flex items-center justify-center text-[#F2F3F0] group-hover:border-[#A3B899] transition">
            <PhoneIcon size={20} />
          </div>
          <span className="font-mono text-[11px] text-[#F2F3F0] mt-1.5">Phone Node</span>
          <span className="font-mono text-[9px] text-[#929690]">10.0.0.4:8743</span>
        </div>

        {/* Node 2: PC (Top-Right) */}
        <div
          onMouseEnter={() => setHoveredNode("pc")}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute top-4 right-6 flex flex-col items-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl border border-[#343934] bg-[#1B1D1B] flex items-center justify-center text-[#F2F3F0] group-hover:border-[#A3B899] transition">
            <PcIcon size={20} />
          </div>
          <span className="font-mono text-[11px] text-[#F2F3F0] mt-1.5">Workstation</span>
          <span className="font-mono text-[9px] text-[#929690]">10.0.0.2:8743</span>
        </div>

        {/* Node 3: TV (Bottom-Center) */}
        <div
          onMouseEnter={() => setHoveredNode("tv")}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl border border-[#343934] bg-[#1B1D1B] flex items-center justify-center text-[#F2F3F0] group-hover:border-[#A3B899] transition">
            <TvIcon size={20} />
          </div>
          <span className="font-mono text-[11px] text-[#F2F3F0] mt-1.5">Android TV</span>
          <span className="font-mono text-[9px] text-[#929690]">10.0.0.8:8743</span>
        </div>

        {/* Active Node Detail Tooltip */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: duration.fast, ease: ease.standard }}
              className="absolute bottom-2 left-4 font-mono text-[10px] text-[#A3B899] bg-[#252825] px-2.5 py-1 rounded-md border border-[#343934]"
            >
              {hoveredNode === "phone"
                ? "Node: Pixel 9 Pro • Ktor 2.3 • Port 8743"
                : hoveredNode === "pc"
                ? "Node: Windows Host • Axum 0.7 • 4TB Storage"
                : "Node: Shield TV • ExoPlayer HTTP/1.1 Range"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer bar */}
      <div className="px-4 py-2 border-t border-[#343934] bg-[#1B1D1B] flex items-center justify-between text-[11px] font-mono text-[#929690]">
        <span>Discovery: mDNS _nasend._tcp.local</span>
        <span className="text-[#A3B899]">{isLan ? "Direct Socket (112.4 MB/s)" : "DTLS 1.3 DataChannel"}</span>
      </div>
    </div>
  );
}
