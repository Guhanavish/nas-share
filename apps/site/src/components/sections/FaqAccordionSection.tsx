import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { SectionHeader } from "../motion/SectionHeader";
import { Rule } from "../motion/Rule";
import { TOKENS } from "../../tokens";

interface TooltipTermProps {
  term: string;
  definition: string;
}

// Tooltip on technical terms that fades and slides up 4px on hover
function TechnicalTerm({ term, definition }: TooltipTermProps) {
  const [hovered, setHovered] = useState(false);
  const { duration, ease } = TOKENS.motion;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`Definition of ${term}`}
    >
      <span className="cursor-help border-b border-dotted border-[#A3B899] text-[#F2F3F0] font-medium outline-none">
        {term}
      </span>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: duration.fast, ease: ease.standard }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-[#252825] border border-[#343934] text-[11px] font-sans text-[#F2F3F0] leading-normal z-30 pointer-events-none"
          >
            <div className="font-mono text-[10px] text-[#A3B899] uppercase tracking-wider mb-1">
              {term} Protocol
            </div>
            {definition}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export function FaqAccordionSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const { duration, ease } = TOKENS.motion;

  const faqs = [
    {
      q: "How does NASend transfer files without central cloud storage servers?",
      answerNode: (
        <span>
          Traditional cloud storage companies store duplicate copies of your data on centralized
          datacenter disks. NASend uses your existing phone, TV, and PC storage directly. The Cloudflare
          Worker acts only as an ephemeral signaling channel (exchanging SDP strings under 2 KB).
          File payload bytes travel directly peer-to-peer over local LAN or encrypted WebRTC DataChannels.
        </span>
      ),
    },
    {
      q: "Does NASend work completely offline when external internet is down?",
      answerNode: (
        <span>
          Yes. When devices are connected to the same local Wi-Fi or mobile hotspot, NASend discovers
          peers automatically via{" "}
          <TechnicalTerm
            term="mDNS"
            definition="Multicast DNS enables zero-configuration host discovery across local subnets without querying external DNS servers."
          />
          . Transfers and media streaming run over direct TCP sockets on port 8743
          without requiring external internet connectivity.
        </span>
      ),
    },
    {
      q: "How does the single-use 8-character pairing code work?",
      answerNode: (
        <span>
          Pairing uses a Crockford Base32 alphabet (omitting visually ambiguous glyphs I, L, O, U) formatted
          as <code className="font-mono text-[#A3B899]">XXXX-XXXX</code>. It has a strict 5-minute
          lifetime and single-use burn guarantee. Devices verify the pairing commitment and derive pinned
          Ed25519 identity keys for all subsequent transactions.
        </span>
      ),
    },
    {
      q: "Can I stream 4K video straight to my TV without transcoding latency?",
      answerNode: (
        <span>
          Yes. NASend implements the standard HTTP/1.1 Range specification. When media players
          (such as ExoPlayer or VLC) request frames, the host sends exact chunk segments directly
          into playback memory. Seeking anywhere in a 4K file initiates playback directly from peer hardware.
        </span>
      ),
    },
    {
      q: "How does encrypted WebRTC NAT traversal function across different networks?",
      answerNode: (
        <span>
          When devices reside on different networks, NASend coordinates candidate discovery via{" "}
          <TechnicalTerm
            term="NAT traversal"
            definition="STUN and ICE candidate harvesting identify public port mappings to negotiate direct peer-to-peer firewall pinholes."
          />{" "}
          and establishes a{" "}
          <TechnicalTerm
            term="DTLS"
            definition="Datagram Transport Layer Security encrypts WebRTC DataChannels end-to-end with cryptographic key pinning."
          />{" "}
          encrypted tunnel. The signaling server coordinates connection metadata but cannot inspect or decrypt
          transferred file bytes.
        </span>
      ),
    },
  ];

  const handleToggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-24 bg-[#0C0D0C] overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 space-y-12">
        {/* Item 19: Unified SectionHeader */}
        <SectionHeader
          eyebrow="Specifications & Questions"
          title="Frequently asked questions"
          description="Technical architecture, local-first protocols, and cryptographic transport guarantees."
        />

        {/* Accordions (Item 34: smooth height animation, 45deg plus rotation, keyboard accessible) */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const contentId = `faq-answer-${idx}`;

            return (
              <div
                key={idx}
                className="rounded-xl border border-[#343934] bg-[#1B1D1B] transition-colors duration-150"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#A3B899] rounded-xl"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <span className="font-display text-sm sm:text-base font-medium text-[#F2F3F0]">
                    {faq.q}
                  </span>

                  {/* Plus icon rotates 45 degrees to become a close icon */}
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: duration.fast, ease: ease.standard }}
                    className="shrink-0 p-1 rounded text-[#929690] hover:text-[#F2F3F0]"
                  >
                    <Plus className="w-4 h-4 text-[#A3B899]" />
                  </motion.div>
                </button>

                {/* Smooth height transition */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={contentId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: ease.standard }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#929690] leading-relaxed border-t border-[#343934]/60 font-sans">
                        {faq.answerNode}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
      <Rule />
    </section>
  );
}
