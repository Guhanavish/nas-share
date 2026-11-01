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
      {/* Titlebar & Mode Switcher (Item 22) */}
      <div className="window-header">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#38bdf8] inline-block animate-pulse" />
          <span>network_topology</span>
        </div>

        {/* LAN / WAN Toggle */}
        <div className="flex items-center gap-1 bg-[#0e1117] p-0.5 rounded border border-[#30363d] text-[10px]">
          <button
            onClick={() => setMode("lan")}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              isLan ? "bg-[#21262d] text-[#f0f6fc] font-medium" : "text-[#8b949e] hover:text-[#f0f6fc]"
            }`}
          >
            LAN (Direct)
          </button>
          <button
            onClick={() => setMode("wan")}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              !isLan ? "bg-[#21262d] text-[#f0f6fc] font-medium" : "text-[#8b949e] hover:text-[#f0f6fc]"
            }`}
          >
            WAN (Relay)
          </button>
        </div>
      </div>

      {/* Schematic Canvas */}
      <div className="relative p-6 h-64 sm:h-72 flex items-center justify-center bg-[#0e1117] select-none">
        <svg viewBox="0 0 360 220" fill="none" className="w-full h-full text-[#30363d]">
          {/* Animated discovery / connection dashed paths (Item 19 & 22) */}
          {isLan ? (
            /* Direct LAN triangular paths */
            <>
              {/* Phone (60, 60) to PC (300, 60) */}
              <motion.line
                x1="60"
                y1="60"
                x2="300"
                y2="60"
                stroke="#38bdf8"
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
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: duration.normal }}
              />
              {/* TV (180, 175) to Phone (60, 60) */}
              <motion.line
                x1="180"
                y1="175"
                x2="60"
                y2="60"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: duration.normal }}
              />

              {/* Moving packet in small steps along connection path (Item 21) */}
              <circle r="3" fill="#38bdf8">
                <animateMotion
                  path="M 60 60 L 300 60 L 180 175 Z"
                  dur="6s"
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
                stroke="#8b949e"
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
                stroke="#8b949e"
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
                stroke="#8b949e"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: duration.normal }}
              />

              {/* Moving packet to relay */}
              <circle r="3" fill="#8b949e">
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
            <div className="w-8 h-8 rounded border border-[#30363d] bg-[#161b22] flex items-center justify-center text-[#8b949e]">
              <CloudRelayIcon size={16} />
            </div>
            <span className="font-mono text-[9px] text-[#8b949e] mt-1">Signaling DO</span>
          </div>
        )}

        {/* Node 1: Phone (Top-Left) with hover tooltip (Item 23) */}
        <div
          onMouseEnter={() => setHoveredNode("phone")}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute top-4 left-6 flex flex-col items-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded border border-[#30363d] bg-[#161b22] flex items-center justify-center text-[#f0f6fc] group-hover:border-[#38bdf8] transition">
            <PhoneIcon size={20} />
          </div>
          <span className="font-mono text-[11px] text-[#f0f6fc] mt-1.5">Phone</span>
          <span className="font-mono text-[9px] text-[#8b949e]">10.0.0.4:8743</span>
        </div>

        {/* Node 2: PC (Top-Right) */}
        <div
          onMouseEnter={() => setHoveredNode("pc")}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute top-4 right-6 flex flex-col items-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded border border-[#30363d] bg-[#161b22] flex items-center justify-center text-[#f0f6fc] group-hover:border-[#38bdf8] transition">
            <PcIcon size={20} />
          </div>
          <span className="font-mono text-[11px] text-[#f0f6fc] mt-1.5">Workstation</span>
          <span className="font-mono text-[9px] text-[#8b949e]">10.0.0.2:8743</span>
        </div>

        {/* Node 3: TV (Bottom-Center) */}
        <div
          onMouseEnter={() => setHoveredNode("tv")}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded border border-[#30363d] bg-[#161b22] flex items-center justify-center text-[#f0f6fc] group-hover:border-[#38bdf8] transition">
            <TvIcon size={20} />
          </div>
          <span className="font-mono text-[11px] text-[#f0f6fc] mt-1.5">Android TV</span>
          <span className="font-mono text-[9px] text-[#8b949e]">10.0.0.8:8743</span>
        </div>

        {/* Active Node Detail Tooltip (Item 23) */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: duration.fast, ease: ease.standard }}
              className="absolute bottom-2 left-4 font-mono text-[10px] text-[#38bdf8] bg-[#161b22] px-2 py-1 rounded border border-[#30363d]"
            >
              {hoveredNode === "phone"
                ? "Node: Pixel 9 Pro • Ktor 2.3 • mDNS active"
                : hoveredNode === "pc"
                ? "Node: Windows Axum • Tauri v2 • 4TB Storage"
                : "Node: Shield TV • ExoPlayer HTTP/1.1 Range"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer bar */}
      <div className="px-4 py-2 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
        <span>Discovery: mDNS _nasend._tcp.local</span>
        <span className="text-[#38bdf8]">{isLan ? "Direct Socket (112 MB/s)" : "DTLS 1.3 DataChannel"}</span>
      </div>
    </div>
  );
}
