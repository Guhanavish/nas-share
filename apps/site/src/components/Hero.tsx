import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { ArrowDownToLine, BookOpenText, MonitorSmartphone } from "lucide-react";
import { MagnetButton } from "./ui";

const reduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Animated phone ↔ PC file-flow diagram (Anime.js stroke + packet loop). */
function FlowDiagram() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || reduced) return;
    const packets = ref.current.querySelectorAll(".packet");
    const anim = animate(packets, {
      offsetDistance: ["0%", "100%"],
      duration: 2600,
      delay: stagger(850),
      loop: true,
      ease: "inOutSine",
    });
    const pulse = animate(ref.current.querySelectorAll(".node"), {
      scale: [1, 1.06, 1],
      duration: 2200,
      loop: true,
      ease: "inOutSine",
    });
    return () => {
      anim.revert();
      pulse.revert();
    };
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 560 260"
      className="h-auto w-full"
      role="img"
      aria-label="Files flowing between phone, relay and PC"
    >
      <defs>
        <path id="laneA" d="M120 130 C 220 60, 340 60, 440 130" fill="none" />
        <path id="laneB" d="M440 130 C 340 200, 220 200, 120 130" fill="none" />
      </defs>

      {/* lanes */}
      <use href="#laneA" stroke="#3b82f6" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 8" fill="none" />
      <use href="#laneB" stroke="#10b981" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 8" fill="none" />

      {/* packets ride the lanes via CSS offset-path */}
      {[0, 1, 2].map((i) => (
        <g key={`a${i}`}>
          <circle
            className="packet"
            r="6"
            fill="#3b82f6"
            style={{ offsetPath: "path('M120 130 C 220 60, 340 60, 440 130')" }}
          />
        </g>
      ))}
      {[0, 1].map((i) => (
        <circle
          key={`b${i}`}
          className="packet"
          r="5"
          fill="#10b981"
          style={{ offsetPath: "path('M440 130 C 340 200, 220 200, 120 130')" }}
        />
      ))}

      {/* phone node */}
      <g className="node" style={{ transformOrigin: "70px 130px" }}>
        <rect x="38" y="82" width="64" height="96" rx="14" fill="#1b1f29" stroke="#3b82f6" strokeWidth="2" />
        <rect x="48" y="96" width="44" height="6" rx="3" fill="#3b82f6" opacity="0.7" />
        <rect x="48" y="108" width="44" height="6" rx="3" fill="#262b38" />
        <rect x="48" y="120" width="30" height="6" rx="3" fill="#262b38" />
        <circle cx="70" cy="166" r="4" fill="#10b981" />
        <text x="70" y="200" textAnchor="middle" fill="#9ca3af" fontSize="13" fontFamily="monospace">phone</text>
      </g>

      {/* cloud-relay node */}
      <g className="node" style={{ transformOrigin: "280px 130px" }}>
        <rect x="238" y="100" width="84" height="60" rx="14" fill="#12151c" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" />
        <text x="280" y="126" textAnchor="middle" fill="#f59e0b" fontSize="12" fontFamily="monospace">relay</text>
        <text x="280" y="144" textAnchor="middle" fill="#9ca3af" fontSize="11" fontFamily="monospace">signal only</text>
      </g>

      {/* pc node */}
      <g className="node" style={{ transformOrigin: "490px 130px" }}>
        <rect x="448" y="92" width="84" height="60" rx="10" fill="#1b1f29" stroke="#10b981" strokeWidth="2" />
        <rect x="482" y="152" width="16" height="8" fill="#262b38" />
        <rect x="462" y="160" width="56" height="6" rx="3" fill="#262b38" />
        <text x="490" y="200" textAnchor="middle" fill="#9ca3af" fontSize="13" fontFamily="monospace">pc</text>
      </g>
    </svg>
  );
}

const words = ["Your", "devices", "are", "the", "cloud."];

export function Hero() {
  const titleEl = useRef<Element | null>(null);
  const subRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const t1 = animate(titleEl.current?.querySelectorAll(".w") ?? [], {
      opacity: [0, 1],
      translateY: [44, 0],
      rotateX: [70, 0],
      duration: 900,
      delay: stagger(90, { start: 150 }),
      ease: "outExpo",
    });
    const t2 = animate(subRef.current ?? [], {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 800,
      delay: 700,
      ease: "outExpo",
    });
    return () => {
      t1.revert();
      t2.revert();
    };
  }, []);

  return (
    <section className="grid-bg relative overflow-hidden pt-36 pb-20">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <div className="relative mx-auto max-w-6xl px-5 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-4 py-1.5 font-mono text-xs text-accent">
          <MonitorSmartphone className="h-3.5 w-3.5" />
          apk for android · tv · exe for windows
        </div>

        <h1
          ref={(el) => {
            titleEl.current = el;
          }}
          className="font-display text-glow mx-auto max-w-4xl text-5xl font-bold leading-[1.05] sm:text-7xl"
          style={{ perspective: "800px" }}
        >
          {words.map((w, i) => (
            <span key={i} className="w inline-block" style={{ opacity: reduced ? 1 : 0 }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>

        <div ref={subRef} style={{ opacity: reduced ? 1 : 0 }}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-fog">
            Pool your phone, TV and PC into{" "}
            <span className="text-snow font-semibold">one section</span>. Pair
            with an 8-character code. Files fly direct — LAN or relay,{" "}
            <span className="text-snow font-semibold">never stored on a server</span>.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <MagnetButton href="#download" primary>
              <ArrowDownToLine className="h-5 w-5" />
              Download free
            </MagnetButton>
            <MagnetButton href="/docs">
              <BookOpenText className="h-5 w-5" />
              Setup in 2 minutes
            </MagnetButton>
          </div>
          <p className="mt-5 font-mono text-xs text-fog">
            no accounts · no servers · no fees · mit licensed
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-line bg-panel/70 p-6 shadow-[0_0_80px_rgba(59,130,246,0.12)] backdrop-blur">
          <FlowDiagram />
          <div className="mt-2 flex items-center justify-center gap-6 font-mono text-[11px] text-fog">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> p2p file bytes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> lan direct
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warn" /> signal only
            </span>
          </div>
        </div>

        <p className="mt-6 font-mono text-xs text-fog">
          tip: pair code looks like{" "}
          <span className="rounded bg-card px-2 py-1 text-accent">K7M2-Q9XD</span>
        </p>
      </div>
    </section>
  );
}
