import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { Layers, ShieldCheck, Signal, Wallet } from "lucide-react";
import { Reveal } from "./ui";

const stats = [
  { icon: Layers, value: 1, suffix: "", label: "pooled section for every device" },
  { icon: Signal, value: 0, suffix: "", label: "file bytes on our servers", custom: "$0" },
  { icon: ShieldCheck, value: 8, suffix: "-char", label: "pairing code, no accounts" },
  { icon: Wallet, value: 0, suffix: "", label: "server cost, forever", custom: "$0" },
];

function Counter({ value, custom }: { value: number; custom?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || custom) return;
    const obj = { n: 0 };
    const c = animate(obj, {
      n: [0, value],
      duration: 1400,
      ease: "outExpo",
      onUpdate: () => {
        if (el) el.textContent = String(Math.round(obj.n));
      },
    });
    return () => {
      c.revert();
    };
  }, [value, custom]);

  return <span ref={ref}>{custom ?? "0"}</span>;
}

export function Stats() {
  return (
    <section className="border-y border-line bg-panel/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 py-10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="px-6 py-4 text-center">
            <s.icon className="mx-auto h-5 w-5 text-primary" />
            <p className="font-display mt-2 text-4xl font-bold">
              <Counter value={s.value} custom={s.custom} />
              {s.suffix && <span className="text-accent">{s.suffix}</span>}
            </p>
            <p className="mt-1 text-sm text-fog">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
