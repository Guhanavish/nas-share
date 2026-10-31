import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { GlassCard } from "../glass/GlassCard";
import { zenAudioEngine } from "../audio/ZenAudio";

export function FaqAccordionSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Nasend operate with zero VPS servers and $0 operating cost?",
      a: "Commercial cloud storage companies charge recurring fees because they maintain costly central datacenters to host your data. Nasend recognizes that your devices already contain terabytes of high-speed NVMe flash storage. By using Cloudflare Workers and Durable Objects solely for ephemeral signaling (a few kilobytes of JSON), all file bytes stream directly peer-to-peer over your local Wi-Fi or encrypted WebRTC DataChannels.",
    },
    {
      q: "Does Nasend work completely offline when the internet is down?",
      a: "Yes. When your devices are connected to the same local Wi-Fi network (or a travel router / phone hotspot), they discover each other automatically using local mDNS (Multicast DNS). Files and media stream at line-rate Gigabit speeds without touching the external internet at all.",
    },
    {
      q: "How does the 8-Rune Crockford Base32 pairing secure my devices?",
      a: "Crockford Base32 removes ambiguous characters (0/O, 1/I/L) to prevent verbal and visual errors. When pairing, devices exchange ephemeral cryptographic tokens and derive pinned Ed25519 public key fingerprints. Once paired, your devices recognize each other automatically without needing pairing codes ever again.",
    },
    {
      q: "Can I stream 4K HDR video straight to my TV without transcoding lag?",
      a: "Yes. Nasend implements the standard HTTP 206 Partial Content Range specification. When ExoPlayer on Android TV or your phone requests a frame, Nasend streams only the specific 64KB byte chunk needed. You can scrub anywhere in a 30GB movie and video begins playback in under a millisecond.",
    },
    {
      q: "How does Nasend compare to Syncthing or AirDrop?",
      a: "AirDrop is locked to the Apple ecosystem and cannot do continuous folder synchronization or remote WAN transfers. Syncthing requires complex multi-step folder configuration and doesn't support sub-millisecond media streaming. Nasend unifies instant ad-hoc pairing, continuous folder delta sync, and instant media streaming across Android, Windows, and TV.",
    },
  ];

  const handleToggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
    zenAudioEngine.playChime(500 + idx * 40);
  };

  return (
    <section id="faq" className="relative py-28 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-mesh/20 bg-indigo-mesh/5 text-[11px] font-mono text-indigo-mesh uppercase tracking-widest">
            <HelpCircle size={14} />
            <span>Architecture &amp; Security</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions.
          </h2>
          <p className="text-fog text-sm sm:text-base leading-relaxed">
            Everything you need to know about the peer-to-peer mesh architecture,
            cryptographic identity pinning, and zero-cloud operation.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <GlassCard
                key={idx}
                glowColor="indigo"
                onClick={() => handleToggle(idx)}
                className="p-6 cursor-pointer border border-white/10 transition-all select-none"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display font-semibold text-base sm:text-lg text-white">
                    {faq.q}
                  </h3>
                  <div
                    className={`w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-cyan-mesh transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-cyan-mesh/10 border-cyan-mesh/30" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Animated Drawer Body */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] pt-4" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-fog leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
