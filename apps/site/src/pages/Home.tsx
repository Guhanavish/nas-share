import { Hero } from "../components/Hero";
import { Stats } from "../components/Stats";
import { Features } from "../components/Features";
import { HowItWorks } from "../components/HowItWorks";
import { Transport } from "../components/Transport";
import { Download } from "../components/Download";
import { Faq } from "../components/Faq";
import type { ReleaseInfo } from "../lib/site";

export function Home({ release }: { release: ReleaseInfo | null }) {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Transport />
      <Download release={release} />
      <Faq />
    </>
  );
}
