import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { TOKENS } from "../../tokens";

interface TooltipTermProps {
  term: string;
  definition: string;
}

// Item 44: Tooltip on technical terms that fades and slides up 4px on hover
function TechnicalTerm({ term, definition }: TooltipTermProps) {
  const [hovered, setHovered] = useState(false);
  const { duration, ease } = TOKENS.motion;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="cursor-help border-b border-dotted border-[#38bdf8] text-[#f0f6fc] font-medium">
        {term}
      </span>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: duration.fast, ease: ease.standard }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded bg-[#21262d] border border-[#30363d] text-[11px] font-sans text-[#f0f6fc] leading-normal shadow-lg z-30 pointer-events-none"
          >
            <div className="font-mono text-[10px] text-[#38bdf8] uppercase tracking-wider mb-1">
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
      q: "How does Nasend operate with zero VPS servers and $0 operating cost?",
      answerNode: (
        <span>
          Traditional cloud storage hosts terabytes of duplicate storage in centralized datacenters.
          Nasend turns your local phone, TV, and PC into the storage tier. The Cloudflare Worker only
          handles ephemeral room signaling (exchanging small SDP strings under 2 KB). File payload
          bytes never touch the worker or any third-party infrastructure.
        </span>
      ),
    },
    {
      q: "Does Nasend work completely offline when external internet is down?",
      answerNode: (
        <span>
          Yes. On your home Wi-Fi or phone hotspot, Nasend discovers peers via{" "}
          <TechnicalTerm
            term="mDNS"
            definition="Multicast DNS enables zero-configuration host discovery across the local subnet without requiring a central DNS server."
          />
          . File transfers and high-bitrate media streaming run directly over LAN sockets on port
          8743 at full line-rate Gigabit speeds without querying the external internet.
        </span>
      ),
    },
    {
      q: "How does the single-use 8-character pairing code work?",
      answerNode: (
        <span>
          Pairing uses a Crockford Base32 alphabet (omitting ambiguous glyphs I, L, O, U) formatted
          as <code className="font-mono text-[#38bdf8]">XXXX-XXXX</code>. It has a strict 5-minute
          time-to-live and can only be used once. After completing the handshake, devices derive and
          pin an Ed25519 cryptographic key for continuous authentication.
        </span>
      ),
    },
    {
      q: "Can I stream 4K video straight to my TV without transcoding latency?",
      answerNode: (
        <span>
          Yes. Nasend implements standard HTTP/1.1 Range requests (RFC 7233). When ExoPlayer or VLC
          requests a frame, the host delivers precise 16–64 KB chunk segments directly into memory.
          Scrubbing through a 30 GB 4K video begins playback in under 2 milliseconds.
        </span>
      ),
    },
    {
      q: "How does encrypted WebRTC NAT traversal function across different networks?",
      answerNode: (
        <span>
          When devices are on separate networks, Nasend negotiates direct connections via{" "}
          <TechnicalTerm
            term="NAT traversal"
            definition="STUN and ICE candidate harvesting discover public IP mappings to punch through firewalls for direct P2P connections."
          />{" "}
          and establishes a{" "}
          <TechnicalTerm
            term="DTLS"
            definition="Datagram Transport Layer Security (v1.3) encrypts WebRTC DataChannels end-to-end, preventing intermediaries from intercepting file payload."
          />{" "}
          encrypted tunnel. The signaling server coordinates the handshake but cannot decrypt the
          payload stream.
        </span>
      ),
    },
  ];

  const handleToggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 border-b border-[#30363d]">
      <div className="mx-auto max-w-4xl px-6 space-y-10">
        <div className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
            Specifications &amp; Inquiries
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc]">
            Frequently asked questions
          </h2>
          <p className="text-sm text-[#8b949e] leading-relaxed max-w-xl">
            Technical architecture, local-first protocols, and cryptographic transport guarantees.
          </p>
        </div>

        {/* Item 43: Accordions with smooth height transition & rotating plus sign */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div
                key={idx}
                className="rounded border border-[#30363d] bg-[#161b22] transition-colors duration-150"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-[#f0f6fc]">
                    {faq.q}
                  </span>

                  {/* Plus icon rotates 45 degrees to become a close icon (Item 43) */}
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: duration.fast, ease: ease.standard }}
                    className="shrink-0 p-1 rounded text-[#8b949e] hover:text-[#f0f6fc]"
                  >
                    <Plus className="w-4 h-4 text-[#38bdf8]" />
                  </motion.div>
                </button>

                {/* Smooth height transition */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: duration.normal, ease: ease.standard }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-[#8b949e] leading-relaxed border-t border-[#30363d]/50">
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
    </section>
  );
}
