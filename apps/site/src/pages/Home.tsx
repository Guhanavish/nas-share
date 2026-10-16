import { Chapter01Threshold } from "../components/chapters/Chapter01Threshold";
import { Chapter02Peers } from "../components/chapters/Chapter02Peers";
import { Chapter03Altar } from "../components/chapters/Chapter03Altar";
import { Chapter04Stream } from "../components/chapters/Chapter04Stream";
import { Chapter05Vault } from "../components/chapters/Chapter05Vault";
import { KageCanvas } from "../components/canvas/KageCanvas";
import { PointerTrail } from "../components/canvas/PointerTrail";
import { FAQ_SCHEMA, SOFTWARE_SCHEMA, useMeta, useSchema } from "../lib/meta";
import type { ReleaseInfo } from "../lib/site";

export function Home({ release }: { release: ReleaseInfo | null }) {
  useMeta({
    title: "Nasend // 影 — Your Devices Are The Cloud",
    description:
      "Nasend turns your Phone, Android TV, and Windows PC into one sovereign, private device-mesh. 8-rune Crockford pairing, zero VPS servers, sub-millisecond Range streaming. Free forever.",
    path: "/",
  });
  useSchema("schema-software", SOFTWARE_SCHEMA);
  useSchema("schema-faq", FAQ_SCHEMA);

  return (
    <div className="relative selection:bg-vermilion/30 selection:text-white">
      {/* 3D WebGL Environmental Engine */}
      <KageCanvas />

      {/* Interactive Firefly Pointer Trail on desktop */}
      <PointerTrail />

      {/* The 5-Chapter Cinematic Walkthrough */}
      <div className="relative z-10">
        <Chapter01Threshold release={release} />
        <Chapter02Peers />
        <Chapter03Altar />
        <Chapter04Stream />
        <Chapter05Vault release={release} />
      </div>
    </div>
  );
}
