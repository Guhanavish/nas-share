import { useState, lazy, Suspense } from "react";
import { PointerGlow } from "../components/canvas/PointerGlow";
import { CustomCursor } from "../components/canvas/CustomCursor";
import { HeroSection } from "../components/sections/HeroSection";
import { TechMarquee } from "../components/sections/TechMarquee";
import { QuickStartTerminal } from "../components/terminal/QuickStartTerminal";
import { HowItWorksSection } from "../components/sections/HowItWorksSection";
import { BuildPhasesStrip } from "../components/sections/BuildPhasesStrip";
import { BentoFeaturesSection } from "../components/sections/BentoFeaturesSection";
import { PairingLabSection } from "../components/sections/PairingLabSection";
import { SecurityDtlsSection } from "../components/sections/SecurityDtlsSection";
import { LiveTransferSimulatorSection } from "../components/sections/LiveTransferSimulatorSection";
import { StreamBenchmarkSection } from "../components/sections/StreamBenchmarkSection";
import { BinaryVaultSection } from "../components/sections/BinaryVaultSection";
import { FaqAccordionSection } from "../components/sections/FaqAccordionSection";
import { AnimatedToast } from "../components/toast/AnimatedToast";
import { FAQ_SCHEMA, SOFTWARE_SCHEMA, useMeta, useSchema } from "../lib/meta";
import type { ReleaseInfo } from "../lib/site";

// Lazy-load Three.js 3D WebGL Canvas for optimal initial paint (Item 36)
const FluidConstellationCanvas = lazy(() =>
  import("../components/canvas/FluidConstellationCanvas").then((m) => ({
    default: m.FluidConstellationCanvas,
  }))
);

export function Home({ release }: { release: ReleaseInfo | null }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useMeta({
    title: "Nasend — Sovereign Device-as-NAS Mesh",
    description:
      "Nasend unites your Phone, Android TV, and Windows PC into one sovereign, private device cloud. 8-rune Crockford pairing, zero VPS servers, sub-millisecond Range streaming. Free forever.",
    path: "/",
  });
  useSchema("schema-software", SOFTWARE_SCHEMA);
  useSchema("schema-faq", FAQ_SCHEMA);

  const handleNavigate = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="relative selection:bg-cyan-mesh/30 selection:text-white bg-ink text-snow min-h-screen">
      {/* Custom Expanding Cursor Ring (Item 26) */}
      <CustomCursor />

      {/* Subtle Grain/Noise Texture Overlay for Atmospheric Depth (Item 3) */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Lazy-loaded 3D WebGL Fluid Constellation (Item 36) */}
      <Suspense fallback={null}>
        <FluidConstellationCanvas />
      </Suspense>

      {/* Ambient Mouse Specular Lighting Bloom (Item 4) */}
      <PointerGlow />

      {/* Main Narrative Flow */}
      <div className="relative z-10">
        {/* 1. Hero Section with Live Network, Headline Cycler, and Flipping Code (Items 6, 7, 8, 9, 10, 11, 23) */}
        <HeroSection
          release={release}
          onNavigate={handleNavigate}
          onPairingCodeCopied={(code) => showToast(`Copied Pairing Code: ${code}`)}
        />

        {/* 2. Platform & Protocol Infinite Marquee (Item 21) */}
        <TechMarquee />

        {/* 3. Terminal Quick-Start Block with Self-Typing Commands (Item 22) */}
        <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto">
          <QuickStartTerminal />
        </section>

        {/* 4. How It Works with Stroke-Dash Diagram & Scroll Timeline (Items 12, 13, 14, 16, 17) */}
        <HowItWorksSection />

        {/* 5. Horizontal Build Phases Strip P0-P4 (Item 15) */}
        <BuildPhasesStrip />

        {/* 6. Bento Grid with 3D Tilt, Gradient Border, and Sliding Pill Tabs (Items 18, 19, 20, 25) */}
        <BentoFeaturesSection />

        {/* 7. Interactive Pairing Lab with Crockford Slot Machine & Confetti */}
        <PairingLabSection />

        {/* 8. Cryptographic Security Section with DTLS Handshake Simulation (Item 31) */}
        <SecurityDtlsSection />

        {/* 9. Live Transfer Simulator with Progress, Speed, and Moving File Icon (Item 32) */}
        <LiveTransferSimulatorSection />

        {/* 10. 4K Video Range Streaming Sub-Millisecond Benchmark */}
        <StreamBenchmarkSection />

        {/* 11. Sovereign Binary Vault with Platform Detection & Shimmer (Item 24) */}
        <BinaryVaultSection
          release={release}
          onCopyToast={(msg) => showToast(msg)}
        />

        {/* 12. FAQ Accordion Section */}
        <FaqAccordionSection />
      </div>

      {/* Animated Copied Toast (Item 29) */}
      <AnimatedToast message={toastMessage} />
    </div>
  );
}
