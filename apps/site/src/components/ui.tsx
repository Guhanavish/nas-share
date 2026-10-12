import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** GSAP scroll reveal wrapper (ReactBits-style fade/slide entrance). */
export function Reveal({
  children,
  y = 36,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  y?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) return;
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [y, delay]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/** Magnetic hover button (Uiverse-inspired glow + magnet pull). */
export function MagnetButton({
  children,
  href,
  primary = false,
  className = "",
}: {
  children: ReactNode;
  href: string;
  primary?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(el, { x: x * 0.18, y: y * 0.28, duration: 0.4, ease: "power2.out" });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 font-display font-semibold transition-shadow ${
        primary
          ? "bg-primary text-white shadow-[0_0_36px_rgba(59,130,246,0.45)] hover:shadow-[0_0_52px_rgba(59,130,246,0.65)]"
          : "border border-line bg-card text-snow hover:border-primary/60 hover:shadow-[0_0_28px_rgba(59,130,246,0.25)]"
      } ${className}`}
    >
      {children}
    </a>
  );
}

/** Section eyebrow + title block. */
export function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
        {eyebrow}
      </p>
      <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-fog">{sub}</p>}
    </Reveal>
  );
}
