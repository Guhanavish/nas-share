import { HeroSection } from "../components/sections/HeroSection";
import { HowItWorksSection } from "../components/sections/HowItWorksSection";
import { SecuritySection } from "../components/sections/SecuritySection";
import { DownloadSection } from "../components/sections/DownloadSection";
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
      {/* Five clean editorial sections (Step 3) */}
      {/* 1. Hero */}
      <HeroSection onNavigate={handleNavigate} />

      {/* 2. How it works */}
      <HowItWorksSection />

      {/* 3. Security */}
      <SecuritySection />

      {/* 4. Download */}
      <DownloadSection release={release} />
    </main>
  );
}
