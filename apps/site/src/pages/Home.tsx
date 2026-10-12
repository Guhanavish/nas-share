import { Hero } from "../components/Hero";
import { Stats } from "../components/Stats";
import { Features } from "../components/Features";
import { HowItWorks } from "../components/HowItWorks";
import { Transport } from "../components/Transport";
import { Download } from "../components/Download";
import { Faq } from "../components/Faq";
import { FAQ_SCHEMA, SOFTWARE_SCHEMA, useMeta, useSchema } from "../lib/meta";
import type { ReleaseInfo } from "../lib/site";

export function Home({ release }: { release: ReleaseInfo | null }) {
  useMeta({
    title: "NAS Share | Your Devices Are the Cloud",
    description:
      "NAS Share turns your phone, TV and PC into one private device cloud. Pool every device into a single section, pair with an 8-character code, download the free APK and EXE.",
    path: "/",
  });
  useSchema("schema-software", SOFTWARE_SCHEMA);
  useSchema("schema-faq", FAQ_SCHEMA);

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
