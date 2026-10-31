import { FluidConstellationCanvas } from "../components/canvas/FluidConstellationCanvas";
import { PointerGlow } from "../components/canvas/PointerGlow";
import { HeroSection } from "../components/sections/HeroSection";
import { ConstellationSection } from "../components/sections/ConstellationSection";
import { PairingLabSection } from "../components/sections/PairingLabSection";
import { StreamBenchmarkSection } from "../components/sections/StreamBenchmarkSection";
import { BinaryVaultSection } from "../components/sections/BinaryVaultSection";
import { FaqAccordionSection } from "../components/sections/FaqAccordionSection";
import { FAQ_SCHEMA, SOFTWARE_SCHEMA, useMeta, useSchema } from "../lib/meta";
import type { ReleaseInfo } from "../lib/site";

export function Home({ release }: { release: ReleaseInfo | null }) {
  useMeta({
    title: "Nasend — Sovereign Device-as-NAS Mesh",
    description:
      "Nasend unites your Phone, Android TV, and Windows PC into one sovereign, private device-mesh. 8-rune Crockford pairing, zero VPS servers, sub-millisecond Range streaming. Free forever.",
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

  return (
    <div className="relative selection:bg-cyan-mesh/30 selection:text-white">
      {/* 3D WebGL Fluid Constellation Canvas */}
      <FluidConstellationCanvas />

      {/* Ambient Mouse Specular Lighting Glow */}
      <PointerGlow />

      {/* Main Narrative Flow */}
      <div className="relative z-10">
        <HeroSection release={release} onNavigate={handleNavigate} />
        <ConstellationSection />
        <PairingLabSection />
        <StreamBenchmarkSection />
        <BinaryVaultSection release={release} />
        <FaqAccordionSection />
      </div>
    </div>
  );
}
