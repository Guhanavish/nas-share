export function TechMarquee() {
  const items = [
    { name: "Android", tag: "Jetpack Compose & Ktor" },
    { name: "Windows", tag: "Tauri v2 & Rust Axum" },
    { name: "WebRTC", tag: "DTLS 1.3 DataChannels" },
    { name: "Cloudflare", tag: "Durable Objects Signaling" },
    { name: "mDNS", tag: "Zero-Conf Offline Discovery" },
    { name: "Crockford Base32", tag: "8-Rune Pair Tokens" },
    { name: "HTTP/1.1 Range", tag: "4K Chunk Streaming" },
    { name: "Ed25519", tag: "Pinned Key Fingerprints" },
  ];

  return (
    <div className="relative w-full py-8 overflow-hidden border-y border-white/10 bg-ink/50 backdrop-blur-md">
      {/* Edge gradient masks */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />

      {/* Marquee track */}
      <div className="flex w-max animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
        {[...items, ...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 mx-4 px-4 py-2 rounded-xl bg-card/60 border border-white/10 text-xs font-mono select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-mesh" />
            <span className="font-semibold text-white">{item.name}</span>
            <span className="text-white/20">|</span>
            <span className="text-fog text-[11px]">{item.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
