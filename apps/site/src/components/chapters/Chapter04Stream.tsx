import { StreamSeeker } from "../interactive/StreamSeeker";
import { FolderSync, ShieldAlert, Waves } from "lucide-react";

export function Chapter04Stream() {
  return (
    <section id="chapter-04" className="relative min-h-[100dvh] flex flex-col justify-center px-5 py-24">
      <div className="mx-auto max-w-5xl w-full">
        {/* Chapter marker */}
        <div className="flex items-center gap-3 font-mono text-xs text-cyan-mesh">
          <span className="flex h-2 w-2 rounded-full bg-cyan-mesh animate-pulse" />
          <span className="uppercase tracking-widest font-bold">04 // 流 The River of Bytes</span>
          <span className="text-fog/40">|</span>
          <span className="text-fog">FileProto & Range Seek Engine</span>
        </div>

        <div className="mt-6">
          <h2 className="font-display text-3xl font-extrabold text-snow sm:text-5xl">
            Stream 4K Video Instantly. <br />
            <span className="text-cyan-mesh">Zero Transcoding Delay.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-fog sm:text-lg">
            Built-in HTTP Range request support (`206 Partial Content`) allows ExoPlayer
            and web players to seek to any byte offset in a 50GB MKV or video instantly,
            streaming 16–64KB encrypted chunks directly from your PC.
          </p>
        </div>

        {/* The Live Interactive Streaming Seeker */}
        <div className="mt-10">
          <StreamSeeker />
        </div>

        {/* FileProto Protocol Highlights */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <div className="kage-card rounded-2xl p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-mesh/15 text-cyan-mesh">
              <Waves className="h-5 w-5" />
            </div>
            <h4 className="font-display mt-4 text-base font-bold text-snow">FileProto Framing</h4>
            <p className="mt-2 text-xs text-fog leading-relaxed">
              Unified protocol over both direct LAN HTTP and WAN WebRTC DataChannel.
              Operates with JSON control headers and binary 16–64KB stream chunks.
            </p>
          </div>

          <div className="kage-card rounded-2xl p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/15 text-amber">
              <FolderSync className="h-5 w-5" />
            </div>
            <h4 className="font-display mt-4 text-base font-bold text-snow">Two-Way Delta Sync</h4>
            <p className="mt-2 text-xs text-fog leading-relaxed">
              Manifest diffs compare SHA-256 hashes and modification timestamps.
              Auto-resume on network drop; keep-both conflict resolution avoids data loss.
            </p>
          </div>

          <div className="kage-card rounded-2xl p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vermilion/15 text-vermilion">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h4 className="font-display mt-4 text-base font-bold text-snow">Path Sandboxing</h4>
            <p className="mt-2 text-xs text-fog leading-relaxed">
              Every read/write is strictly sandboxed. Resolves canonical filesystem paths;
              all directory traversal (`..`, symlink escapes) are rejected with HTTP 403 Forbidden.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
