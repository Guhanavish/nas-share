import { HeroSection } from "../components/sections/HeroSection";
import { HowItWorksSection } from "../components/sections/HowItWorksSection";
import { ProductShowcaseSection } from "../components/sections/ProductShowcaseSection";
import { SecuritySection } from "../components/sections/SecuritySection";
import { DownloadSection } from "../components/sections/DownloadSection";
import { FaqAccordionSection } from "../components/sections/FaqAccordionSection";
import { FAQ_SCHEMA, SOFTWARE_SCHEMA, useMeta, useSchema } from "../lib/meta";
import type { ReleaseInfo } from "../lib/site";

export function Home({ release }: { release: ReleaseInfo | null }) {
  useMeta({
    title: "Nasend — Files between your devices, without a server.",
    description:
      "Nasend pools your phone, tablet, and PC into a direct peer-to-peer network for local file transfers and streaming.",
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
    <main className="w-full bg-[#0e1117] text-[#f0f6fc]">
      {/* 1. Hero: live device network & flip pairing code */}
      <HeroSection onNavigate={handleNavigate} />

      {/* 2. How it works: 4-step scroll pin, key exchange & transfer speed */}
      <HowItWorksSection />

      {/* 3. Product showcase: Windows host vs Android client, delta sync */}
      <ProductShowcaseSection />

      {/* 4. Security: DTLS handshake lock, path traversal guard, 5m TTL ring */}
      <SecuritySection />

      {/* 5. Download: OS auto-detection, verified SHA-256 typing decode */}
      <DownloadSection release={release} />

      {/* 6. FAQ: Technical term tooltips & rotating plus-to-close accordions */}
      <FaqAccordionSection />
    </main>
  );
}
