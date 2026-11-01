import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { GlassCard } from "../glass/GlassCard";
import { KeyRound, Radio, Zap, Shield, Laptop, Smartphone, Tv } from "lucide-react";

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<SVGSVGElement>(null);
  const isDiagramInView = useInView(diagramRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"],
  });

  // Vertical timeline line draws on scroll (Item 14)
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Parallax subtle background movement (Item 16)
  const bgY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  const steps = [
    {
      step: "01",
      title: "Zero-Conf Discovery & Rendezvous",
      desc: "When connected to your local home Wi-Fi, devices detect each other automatically via mDNS (_nasend._tcp.local). If across different Wi-Fi networks or cellular, a lightweight ephemeral Cloudflare Durable Object provides a 60-second handshake rendezvous.",
      badge: "mDNS Port 8743 • Zero Setup",
      accent: "text-cyan-mesh",
      icon: Radio,
    },
    {
      step: "02",
      title: "8-Rune Crockford Key Exchange",
      desc: "Pairing requires zero user accounts or passwords. Enter an 8-character Crockford Base32 token (e.g. K7M2-Q9XD) or scan the QR code. Nodes negotiate an encrypted DTLS session and pin each other's Ed25519 cryptographic fingerprints.",
      badge: "Zero Ambiguity Base32 • Ed25519",
      accent: "text-indigo-mesh",
      icon: KeyRound,
    },
    {
      step: "03",
      title: "Sub-Millisecond Range Slicing",
      desc: "Stream 4K Blu-ray remuxes or transfer 50GB photo archives at line-rate Gigabit Wi-Fi speed. Nasend slices files into 64KB chunks with HTTP/1.1 Range headers, providing zero-lag scrubbing and multi-threaded throughput.",
      badge: "64KB Range Chunks • 112+ MB/s",
      accent: "text-emerald-mesh",
      icon: Zap,
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 overflow-hidden border-t border-white/10"
    >
      {/* Parallax background ambient glow (Item 16) */}
      <motion.div
        style={{ y: bgY }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-mesh/10 via-indigo-mesh/10 to-emerald-mesh/10 rounded-full blur-[140px] pointer-events-none -z-10"
      />

      <div className="mx-auto max-w-7xl">
        {/* Section Header (Staggered fade-and-rise, Item 17) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-mesh/30 bg-cyan-mesh/10 text-cyan-mesh font-mono text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Architecture & Security Mechanics</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            How The Sovereign Mesh Works
          </h2>
          <p className="text-base sm:text-lg text-fog">
            No central database. No account logins. Just your hardware communicating directly
            over encrypted, authenticated channels.
          </p>
        </motion.div>

        {/* Animated Architecture Diagram with Stroke-Dash Draw (Item 13) */}
        <div className="mb-24 p-6 sm:p-10 rounded-3xl bg-ink/75 border border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-mesh">
              Interactive Mesh Topography
            </span>
            <span className="text-[11px] font-mono text-fog">
              Stroke-dash animated on viewport entry
            </span>
          </div>

          <div className="relative w-full aspect-[21/9] min-h-[220px] sm:min-h-[280px]">
            <svg
              ref={diagramRef}
              viewBox="0 0 900 360"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background grid */}
              <defs>
                <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                </pattern>
                <linearGradient id="cyanIndigoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
                <linearGradient id="indigoEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <rect width="900" height="360" fill="url(#archGrid)" />

              {/* Stroke-dash animated paths (Item 13) */}
              <motion.path
                d="M 180 180 C 300 80, 400 80, 450 180"
                stroke="url(#cyanIndigoGrad)"
                strokeWidth="3"
                strokeDasharray="8 6"
                initial={{ pathLength: 0 }}
                animate={isDiagramInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
              />

              <motion.path
                d="M 450 180 C 500 280, 600 280, 720 180"
                stroke="url(#indigoEmeraldGrad)"
                strokeWidth="3"
                strokeDasharray="8 6"
                initial={{ pathLength: 0 }}
                animate={isDiagramInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.6, delay: 0.3, ease: "easeInOut" }}
              />

              <motion.path
                d="M 180 180 C 350 320, 550 320, 720 180"
                stroke="#14b8a6"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                initial={{ pathLength: 0 }}
                animate={isDiagramInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.8, delay: 0.6, ease: "easeInOut" }}
              />

              {/* Node 1: Mobile Phone (180, 180) */}
              <g transform="translate(180, 180)">
                <circle r="44" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                <foreignObject x="-24" y="-24" width="48" height="48">
                  <div className="w-full h-full flex items-center justify-center text-cyan-mesh">
                    <Smartphone className="w-6 h-6" />
                  </div>
                </foreignObject>
                <text x="0" y="65" textAnchor="middle" fill="#ffffff" fontFamily="Space Grotesk" fontSize="13" fontWeight="600">
                  Android Phone
                </text>
                <text x="0" y="82" textAnchor="middle" fill="#94a3b8" fontFamily="JetBrains Mono" fontSize="10">
                  Ktor Server :8743
                </text>
              </g>

              {/* Node 2: Ephemeral DO / Rendezvous (450, 180) */}
              <g transform="translate(450, 180)">
                <circle r="40" fill="#0b101e" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" />
                <foreignObject x="-20" y="-20" width="40" height="40">
                  <div className="w-full h-full flex items-center justify-center text-indigo-mesh">
                    <Radio className="w-5 h-5" />
                  </div>
                </foreignObject>
                <text x="0" y="62" textAnchor="middle" fill="#ffffff" fontFamily="Space Grotesk" fontSize="13" fontWeight="600">
                  Cloudflare DO
                </text>
                <text x="0" y="79" textAnchor="middle" fill="#94a3b8" fontFamily="JetBrains Mono" fontSize="10">
                  Signaling Only ($0)
                </text>
              </g>

              {/* Node 3: Windows PC (720, 180) */}
              <g transform="translate(720, 180)">
                <circle r="44" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
                <foreignObject x="-24" y="-24" width="48" height="48">
                  <div className="w-full h-full flex items-center justify-center text-emerald-mesh">
                    <Laptop className="w-6 h-6" />
                  </div>
                </foreignObject>
                <text x="0" y="65" textAnchor="middle" fill="#ffffff" fontFamily="Space Grotesk" fontSize="13" fontWeight="600">
                  Windows PC
                </text>
                <text x="0" y="82" textAnchor="middle" fill="#94a3b8" fontFamily="JetBrains Mono" fontSize="10">
                  Axum Engine :8743
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Vertical Timeline with Drawing Connector Line (Item 14) & Sticky Step Cards (Item 12) */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Sticky Timeline Spine & Steps */}
          <div className="lg:col-span-8 relative pl-8 sm:pl-12">
            {/* Background static line */}
            <div className="absolute left-3 sm:left-5 top-4 bottom-4 w-0.5 bg-white/10" />

            {/* Scroll-driven animated drawing line (Item 14) */}
            <motion.div
              style={{ scaleY: lineScaleY }}
              className="absolute left-3 sm:left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-mesh via-indigo-mesh to-emerald-mesh origin-top"
            />

            <div className="space-y-12">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="relative"
                  >
                    {/* Node Dot on Timeline */}
                    <div className="absolute -left-8 sm:-left-12 top-6 w-6 h-6 -translate-x-1/2 rounded-full bg-ink border-2 border-cyan-mesh flex items-center justify-center shadow-md shadow-cyan-500/20 z-10">
                      <span className="w-2 h-2 rounded-full bg-cyan-mesh" />
                    </div>

                    <GlassCard className="p-6 sm:p-8 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-3xl font-black text-white/20">
                          {step.step}
                        </span>
                        <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-card border border-white/10 ${step.accent}`}>
                          {step.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
                          <IconComponent className="w-5 h-5 text-cyan-mesh" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-white">
                          {step.title}
                        </h3>
                      </div>

                      <p className="text-fog text-sm sm:text-base leading-relaxed">
                        {step.desc}
                      </p>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sticky Summary & Guarantees */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <GlassCard className="p-6 sm:p-7 space-y-5 border border-cyan-mesh/20">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-mesh">
                Sovereign Guarantee
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                Zero Cloud Storage Cost
              </h3>
              <p className="text-xs text-fog leading-relaxed">
                Your data resides on physical flash storage inside your devices. We don&apos;t run
                costly storage buckets, which means zero subscription fees, zero telemetry, and
                zero privacy risks.
              </p>

              <div className="space-y-3 pt-2 font-mono text-xs text-snow border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-fog">Signaling Host:</span>
                  <span className="text-white">Cloudflare DO</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-fog">Signaling Cost:</span>
                  <span className="text-emerald-mesh">$0.00 / month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-fog">File Storage:</span>
                  <span className="text-cyan-mesh">Local NVMe Flash</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-fog">Encryption:</span>
                  <span className="text-indigo-mesh">DTLS 1.3 / AES-GCM</span>
                </div>
              </div>
            </GlassCard>

            <div className="p-5 rounded-2xl bg-card/60 border border-white/10 flex items-center gap-3 text-xs font-mono text-fog">
              <Tv className="w-6 h-6 text-emerald-mesh shrink-0" />
              <span>Full Android TV support for seamless 4K movie nights without USB drives.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
