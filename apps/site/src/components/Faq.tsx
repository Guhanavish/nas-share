import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { Reveal, SectionHead } from "./ui";

const faqs = [
  {
    q: "Do my files go through your servers?",
    a: "No. On WiFi, devices talk directly over HTTP. Anywhere else, the Cloudflare Worker only introduces the two devices (signaling) or forwards encrypted chunks as a last resort — files are never stored anywhere.",
  },
  {
    q: "Do I need an account?",
    a: "Never. Pairing is an 8-character code shown on one device and typed on the other. Identities pin on first trust and reconnect automatically.",
  },
  {
    q: "Will it work on my TV?",
    a: "Yes — the same APK installs on phones, tablets and Google TV. The TV interface is fully remote-driven with focus halos and large type.",
  },
  {
    q: "What if a device is offline?",
    a: "Its Pool section stays visible but greyed out, so you always know what exists. The moment it's back, the section lights up with no re-pairing.",
  },
  {
    q: "How much does it cost to run?",
    a: "$0. There is no VPS, no database to host, no storage bucket. The Worker free tier covers signaling for normal use.",
  },
  {
    q: "Is it open source?",
    a: "MIT licensed. Android (Kotlin), Windows (Tauri + Rust), Worker (Hono + Durable Objects) — audit anything.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-5 py-24">
      <SectionHead eyebrow="faq" title="Asked, answered" />
      <div className="space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 0.04}>
              <div
                className={`overflow-hidden rounded-2xl border transition ${
                  isOpen ? "border-primary/50 bg-card" : "border-line bg-panel"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-semibold"
                >
                  {f.q}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 text-primary"
                  >
                    <Plus className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-fog">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
