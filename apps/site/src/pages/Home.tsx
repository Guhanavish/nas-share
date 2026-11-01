import { useState } from "react";
import { HeroSection } from "../components/sections/HeroSection";
import { TransferApp } from "../components/transfer/TransferApp";
import { HowItWorksSection } from "../components/sections/HowItWorksSection";
import { ProductShowcaseSection } from "../components/sections/ProductShowcaseSection";
import { SecuritySection } from "../components/sections/SecuritySection";
import { DownloadSection } from "../components/sections/DownloadSection";
import { FaqAccordionSection } from "../components/sections/FaqAccordionSection";
import { FAQ_SCHEMA, SOFTWARE_SCHEMA, useMeta, useSchema } from "../lib/meta";
import type { ReleaseInfo } from "../lib/site";

export function Home({ release }: { release: ReleaseInfo | null }) {
  const [transferMode, setTransferMode] = useState<"send" | "receive">("send");

  useMeta({
    title: "NASend — Your files. A direct connection.",
    description:
      "Move files between your devices through a simple, seamless transfer experience over local LAN or encrypted WebRTC.",
    path: "/",
  });
  useSchema("schema-software", SOFTWARE_SCHEMA);
  useSchema("schema-faq", FAQ_SCHEMA);

  return (
    <main className="w-full bg-[#0C0D0C] text-[#F2F3F0]">
      {/* 1. Hero: Oversized Space Grotesk headline, device diagram, and primary CTAs */}
      <HeroSection
        onSelectSend={() => setTransferMode("send")}
        onSelectReceive={() => setTransferMode("receive")}
      />

      {/* 2. Primary Functional Application Entry Point: Instant Send / Receive Workspace */}
      <section id="transfer" className="py-20 border-b border-[#343934] bg-[#0C0D0C]">
        <div className="mx-auto max-w-5xl px-6 space-y-8">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[11px] font-mono text-[#929690] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A3B899]" />
              <span>Direct File Transfer Workspace</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#F2F3F0]">
              Send and receive files
            </h2>
            <p className="text-xs sm:text-sm text-[#929690] font-sans">
              Choose files to transmit or enter a pairing code to receive. Zero cloud accounts required.
            </p>
          </div>

          <TransferApp key={transferMode} initialMode={transferMode} />
        </div>
      </section>

      {/* 3. How it works: 3 clear steps with interactive verification */}
      <HowItWorksSection />

      {/* 4. Product showcase: Real app window, directory browser, and 6 compact feature cards */}
      <ProductShowcaseSection />

      {/* 5. Security: Cryptographic boundaries, DTLS 1.3 lock, path traversal guard, server visibility */}
      <SecuritySection />

      {/* 6. Download: Platform auto-detection, verified SHA-256 typing decode */}
      <DownloadSection release={release} />

      {/* 7. FAQ: Rotating plus accordions and technical term tooltips */}
      <FaqAccordionSection />
    </main>
  );
}
