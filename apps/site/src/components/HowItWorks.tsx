import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { QrCode, KeyRound, ArrowLeftRight, BadgeCheck } from "lucide-react";
import { SectionHead } from "./ui";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: QrCode,
    n: "01",
    title: "Share shows a code",
    body: "Device A taps Share. A code like K7M2-Q9XD appears with a QR and a 5-minute countdown.",
  },
  {
    icon: KeyRound,
    n: "02",
    title: "Enter it on device B",
    body: "Type 8 characters (or scan). SHA-256 commit verification blocks man-in-the-middle pairing.",
  },
  {
    icon: ArrowLeftRight,
    n: "03",
    title: "Identities pin",
    body: "Ed25519 keys exchange once and pin. Next time both devices connect automatically — no code.",
  },
  {
    icon: BadgeCheck,
    n: "04",
    title: "Pool lights up",
    body: "Both devices' files appear in one section. Tap to pull source → this device, LAN or relay.",
  },
];

export function HowItWorks() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 768) return;

    const dist = track.scrollWidth - wrap.clientWidth;
    const tween = gsap.to(track, {
      x: -dist,
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: `+=${dist}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section className="border-y border-line bg-panel/60 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHead
          eyebrow="pairing"
          title="Paired in under a minute"
          sub="Scroll — the steps ride past like a filmstrip."
        />
      </div>
      <div ref={wrapRef} className="overflow-hidden md:h-[70vh] md:overflow-visible">
        <div
          ref={trackRef}
          className="mx-auto flex max-w-6xl flex-col gap-4 px-5 md:w-max md:flex-row md:gap-6 md:px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]"
        >
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative w-full shrink-0 rounded-3xl border border-line bg-card p-8 md:w-[420px]"
            >
              <span className="font-display text-6xl font-bold text-line">
                {s.n}
              </span>
              <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-fog">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
