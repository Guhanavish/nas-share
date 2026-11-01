import { useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { MobileNodeLogo, WorkstationNodeLogo, LivingRoomTvLogo } from "../brand/DeviceLogos";
import { CloudTollLogo } from "../brand/DeviceLogos";
import { Wifi, Globe, ShieldCheck } from "lucide-react";
import { zenAudioEngine } from "../audio/ZenAudio";

export function HeroLiveNetwork() {
  const [transportMode, setTransportMode] = useState<"lan" | "wan">("lan");
  const { scrollY } = useScroll();

  // Devices split apart as user scrolls down (item 11)
  const phoneX = useTransform(scrollY, [0, 600], [0, -35]);
  const phoneY = useTransform(scrollY, [0, 600], [0, -25]);
  const pcX = useTransform(scrollY, [0, 600], [0, 35]);
  const pcY = useTransform(scrollY, [0, 600], [0, -25]);
  const tvY = useTransform(scrollY, [0, 600], [0, 35]);

  const toggleTransport = (mode: "lan" | "wan") => {
    setTransportMode(mode);
    zenAudioEngine.playChime(mode === "lan" ? 587.33 : 440);
  };

  const isLan = transportMode === "lan";
  const lineColor = isLan ? "#2dd4bf" : "#c084fc"; // teal for LAN, violet for WAN

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-card/85 to-ink/90 border border-white/10 p-5 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-2xl">
      {/* Top Header & Transport Toggle */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-fog/70 block">
            Mesh Topology
          </span>
          <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-2">
            <span>Sovereign Tri-Node Mesh</span>
            <span
              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold transition-colors ${
                isLan ? "bg-lan-badge text-lan-teal-light" : "bg-wan-badge text-wan-violet-light"
              }`}
            >
              {isLan ? "Direct LAN • 0.2ms" : "WAN Relay • End-to-End"}
            </span>
          </h3>
        </div>

        {/* LAN / WAN Toggle Switch */}
        <div className="inline-flex p-1 rounded-xl bg-ink/80 border border-white/10 text-xs font-mono">
          <button
            onClick={() => toggleTransport("lan")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              isLan
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                : "text-fog hover:text-white"
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>LAN</span>
          </button>
          <button
            onClick={() => toggleTransport("wan")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              !isLan
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-fog hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>WAN Relay</span>
          </button>
        </div>
      </div>

      {/* Interactive Network Stage */}
      <div className="relative h-64 sm:h-72 w-full flex items-center justify-center">
        {/* SVG connection lines and animated data packets */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 280">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {isLan ? (
            /* Direct LAN Triangle Paths */
            <>
              {/* Phone (80, 70) to PC (320, 70) */}
              <path
                id="path-phone-pc"
                d="M 80 70 Q 200 40 320 70"
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
              />
              {/* PC (320, 70) to TV (200, 220) */}
              <path
                id="path-pc-tv"
                d="M 320 70 Q 280 160 200 220"
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
              />
              {/* TV (200, 220) to Phone (80, 70) */}
              <path
                id="path-tv-phone"
                d="M 200 220 Q 120 160 80 70"
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
              />

              {/* Data Packets flowing on LAN */}
              <circle r="4" fill="#2dd4bf" filter="url(#glow)">
                <animateMotion dur="2.4s" repeatCount="indefinite" path="M 80 70 Q 200 40 320 70" />
              </circle>
              <circle r="4" fill="#2dd4bf" filter="url(#glow)">
                <animateMotion dur="2.8s" repeatCount="indefinite" path="M 320 70 Q 280 160 200 220" />
              </circle>
              <circle r="4" fill="#2dd4bf" filter="url(#glow)">
                <animateMotion dur="2.6s" repeatCount="indefinite" path="M 200 220 Q 120 160 80 70" />
              </circle>
            </>
          ) : (
            /* WAN Relayed Paths through Cloudflare DO Center (200, 130) */
            <>
              {/* Phone to Relay */}
              <path
                d="M 80 70 L 200 130"
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeOpacity="0.7"
              />
              {/* PC to Relay */}
              <path
                d="M 320 70 L 200 130"
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeOpacity="0.7"
              />
              {/* TV to Relay */}
              <path
                d="M 200 220 L 200 130"
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeOpacity="0.7"
              />

              {/* Data Packets on WAN */}
              <circle r="4" fill="#c084fc" filter="url(#glow)">
                <animateMotion dur="2.2s" repeatCount="indefinite" path="M 80 70 L 200 130" />
              </circle>
              <circle r="4" fill="#c084fc" filter="url(#glow)">
                <animateMotion dur="2.2s" repeatCount="indefinite" path="M 200 130 L 320 70" />
              </circle>
              <circle r="4" fill="#c084fc" filter="url(#glow)">
                <animateMotion dur="2.5s" repeatCount="indefinite" path="M 200 130 L 200 220" />
              </circle>
            </>
          )}
        </svg>

        {/* Central Relay Node (Visible on WAN) */}
        {!isLan && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-[130px] left-[200px] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
          >
            <div className="w-10 h-10 rounded-full bg-purple-950/80 border border-purple-500/60 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <CloudTollLogo size={20} />
            </div>
            <span className="font-mono text-[9px] text-purple-300 mt-1 bg-ink/90 px-1.5 py-0.5 rounded border border-purple-500/30">
              Ephemeral DO
            </span>
          </motion.div>
        )}

        {/* Node 1: Mobile Phone (Top-Left) */}
        <motion.div
          style={{ x: phoneX, y: phoneY }}
          className="absolute top-4 left-6 sm:left-12 flex flex-col items-center gap-1.5 z-10 cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-cyan-mesh/10 border border-cyan-mesh/30 flex items-center justify-center shadow-xl shadow-cyan-500/10 transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-mesh/60">
            <MobileNodeLogo size={32} />
          </div>
          <span className="font-mono text-xs font-semibold text-white">Pixel 9 Pro</span>
          <span className="font-mono text-[10px] text-fog">10.166.83.175</span>
        </motion.div>

        {/* Node 2: Windows PC (Top-Right) */}
        <motion.div
          style={{ x: pcX, y: pcY }}
          className="absolute top-4 right-6 sm:right-12 flex flex-col items-center gap-1.5 z-10 cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-mesh/10 border border-indigo-mesh/30 flex items-center justify-center shadow-xl shadow-indigo-500/10 transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-mesh/60">
            <WorkstationNodeLogo size={32} />
          </div>
          <span className="font-mono text-xs font-semibold text-white">Workstation PC</span>
          <span className="font-mono text-[10px] text-fog">10.166.83.68</span>
        </motion.div>

        {/* Node 3: Living Room TV (Bottom-Center) */}
        <motion.div
          style={{ y: tvY }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10 cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-mesh/10 border border-emerald-mesh/30 flex items-center justify-center shadow-xl shadow-emerald-500/10 transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-mesh/60">
            <LivingRoomTvLogo size={32} />
          </div>
          <span className="font-mono text-xs font-semibold text-white">Shield TV 4K</span>
          <span className="font-mono text-[10px] text-fog">10.166.83.92</span>
        </motion.div>
      </div>

      {/* Bottom Live Diagnostic Bar */}
      <div className="mt-3 p-3 rounded-xl bg-ink/70 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-mesh" />
          <span className="text-white font-medium">
            {isLan ? "Direct mDNS Line-Rate Gigabit" : "DTLS End-to-End Encrypted Relay"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-fog text-[11px]">
          <span>0 Bytes Stored on VPS</span>
          <span className="text-white/20">•</span>
          <span className="text-cyan-mesh">Sub-millisecond Range Slicing</span>
        </div>
      </div>
    </div>
  );
}
