import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wifi, Repeat, Rocket } from "lucide-react";
import { Reveal, SectionHead } from "./ui";

gsap.registerPlugin(ScrollTrigger);

const rows = [
  { icon: Wifi, name: "LAN direct", desc: "same wifi · http :8743", width: 100, tag: "fastest", hot: true },
  { icon: Repeat, name: "Relay", desc: "anywhere · worker forwards chunks", width: 62, tag: "reliable", hot: false },
  { icon: Rocket, name: "P2P upgrade", desc: "webrtc datachannel · on the roadmap", width: 38, tag: "soon", hot: false },
];

export function Transport() {
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bars = el.querySelectorAll(".tbar");
    gsap.fromTo(
      bars,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.15,
        transformOrigin: "left center",
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      }
    );
    return () => {
      gsap.killTweensOf(bars);
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <SectionHead
        eyebrow="transport"
        title="Right pipe for the moment"
        sub="Pool picks LAN when it can, relay when it must — and tells you which."
      />
      <Reveal>
        <div ref={barsRef} className="mx-auto max-w-3xl space-y-5 rounded-3xl border border-line bg-panel p-8">
          {rows.map((r) => (
            <div key={r.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <r.icon className={`h-4 w-4 ${r.hot ? "text-accent" : "text-fog"}`} />
                  {r.name}
                  <span className="font-mono text-[11px] font-normal text-fog">{r.desc}</span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] ${
                    r.hot ? "bg-accent/15 text-accent" : "bg-card text-fog"
                  }`}
                >
                  {r.tag}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-card">
                <div
                  className={`tbar h-full rounded-full ${
                    r.hot
                      ? "bg-gradient-to-r from-accent to-primary shadow-[0_0_16px_rgba(16,185,129,0.5)]"
                      : "bg-gradient-to-r from-primary/70 to-primary/30"
                  }`}
                  style={{ width: `${r.width}%` }}
                />
              </div>
            </div>
          ))}
          <p className="pt-2 text-center font-mono text-xs text-fog">
            relative throughput · your network will vary
          </p>
        </div>
      </Reveal>
    </section>
  );
}
