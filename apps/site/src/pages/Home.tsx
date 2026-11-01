import { useState, Suspense, lazy } from "react";
import { HeroSection } from "../components/sections/HeroSection";
import { HowItWorksSection } from "../components/sections/HowItWorksSection";
import { Rule } from "../components/motion/Rule";
import { FAQ_SCHEMA, SOFTWARE_SCHEMA, useMeta, useSchema } from "../lib/meta";
import type { ReleaseInfo } from "../lib/site";

// Lazy load below-the-fold sections to prevent large main chunk (T15.1)
const TransferApp = lazy(() =>
  import("../components/transfer/TransferApp").then((m) => ({ default: m.TransferApp }))
);
const ProductShowcaseSection = lazy(() =>
  import("../components/sections/ProductShowcaseSection").then((m) => ({
    default: m.ProductShowcaseSection,
  }))
);
const SecuritySection = lazy(() =>
  import("../components/sections/SecuritySection").then((m) => ({
    default: m.SecuritySection,
  }))
);
const DownloadSection = lazy(() =>
  import("../components/sections/DownloadSection").then((m) => ({
    default: m.DownloadSection,
  }))
);
const FaqAccordionSection = lazy(() =>
  import("../components/sections/FaqAccordionSection").then((m) => ({
    default: m.FaqAccordionSection,
  }))
);

function SectionSkeleton({ minHeight = "min-h-[400px]" }: { minHeight?: string }) {
  return (
    <div className={`w-full ${minHeight} flex items-center justify-center p-8 bg-[#0C0D0C]`}>
      <div className="w-8 h-8 rounded-full border border-[#343934] border-t-[#A3B899] animate-spin" />
    </div>
  );
}

export function Home({
  release,
  releaseStatus = "ok",
}: {
  release: ReleaseInfo | null;
  releaseStatus?: "loading" | "ok" | "none" | "error";
}) {
  const [transferMode, setTransferMode] = useState<"send" | "receive">("send");

  useMeta({
    title: "NASend — Your files. A direct connection.",
    description:
      "Move files directly between your devices over local LAN or encrypted WebRTC.",
    path: "/",
  });
  useSchema("schema-software", SOFTWARE_SCHEMA);
  useSchema("schema-faq", FAQ_SCHEMA);

  return (
    <div className="w-full bg-[#0C0D0C] text-[#F2F3F0]">
      {/* 1. Hero: Space Grotesk headline, device diagram, and primary CTAs */}
      <HeroSection
        onSelectSend={() => setTransferMode("send")}
        onSelectReceive={() => setTransferMode("receive")}
      />

      {/* 2. Interactive Demo Transfer Workspace (Honest labeling: T1.1) */}
      <section id="transfer" className="relative py-20 bg-[#0C0D0C]">
        <div className="mx-auto max-w-5xl px-6 space-y-8">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[11px] font-mono text-[#929690] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A3B899]" />
              <span>Try the transfer flow</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#F2F3F0]">
              Interactive transfer demo
            </h2>
            <p className="text-xs sm:text-sm text-[#929690] font-sans">
              This workspace simulates a transfer in your browser. No files leave your device. Use the Android or Windows app to transfer real files.
            </p>
          </div>

          <Suspense fallback={<SectionSkeleton minHeight="min-h-[460px]" />}>
            <TransferApp key={transferMode} initialMode={transferMode} />
          </Suspense>
        </div>
        <Rule />
      </section>

      {/* 3. How it works: 4 steps with pinned timeline */}
      <HowItWorksSection />

      {/* 4. Product showcase: Window frame, cross-fade, directory tree */}
      <Suspense fallback={<SectionSkeleton minHeight="min-h-[500px]" />}>
        <ProductShowcaseSection />
      </Suspense>

      {/* 5. Security: Cryptographic boundaries, path traversal guard, server visibility */}
      <Suspense fallback={<SectionSkeleton minHeight="min-h-[450px]" />}>
        <SecuritySection />
      </Suspense>

      {/* 6. Download: Platform detection, honest SHA-256 and release asset bindings */}
      <Suspense fallback={<SectionSkeleton minHeight="min-h-[400px]" />}>
        <DownloadSection release={release} releaseStatus={releaseStatus} />
      </Suspense>

      {/* 7. FAQ: Accordions with technical depth */}
      <Suspense fallback={<SectionSkeleton minHeight="min-h-[350px]" />}>
        <FaqAccordionSection />
      </Suspense>
    </div>
  );
}
