export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Discovery on local network",
      desc: "When devices join the same local network, they locate each other through Multicast DNS (mDNS) broadcasting _nasend._tcp.local on port 8743. No router configuration or static IP allocation is needed.",
    },
    {
      num: "02",
      title: "Five-minute pairing handshake",
      desc: "One device generates an 8-character Crockford Base32 code. Entering this code on the second device establishes a temporary session where both devices exchange and pin Ed25519 public keys. The code expires in five minutes and is burned immediately upon use.",
    },
    {
      num: "03",
      title: "Direct chunked streaming",
      desc: "Files move over direct TCP sockets or WebRTC DataChannels in 16 KB to 64 KB chunks using standard HTTP/1.1 Range headers. Transfers can pause and resume from the exact byte offset.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-b border-[#30363d]">
      <div className="mx-auto max-w-4xl px-6 space-y-12">
        <div className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
            Protocol &amp; Architecture
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc]">
            How it works
          </h2>
          <p className="text-sm text-[#8b949e] leading-relaxed max-w-xl">
            Nasend implements the FileProto specification. All operations occur directly between peer nodes without an intermediary file host.
          </p>
        </div>

        {/* 3 Numbered Steps with 1px hairline dividers (Step 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((st) => (
            <div key={st.num} className="space-y-2 border-t border-[#30363d] pt-4">
              <span className="font-mono text-xs text-[#8b949e]">{st.num}</span>
              <h3 className="text-base font-medium text-[#f0f6fc]">
                {st.title}
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Real App Window Frame Representation (Step 3) */}
        <div className="window-frame">
          <div className="window-header">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-[#30363d] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full border border-[#30363d] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full border border-[#30363d] inline-block" />
              </div>
              <span className="ml-2">Nasend Desktop — Windows Workstation</span>
            </div>
            <span>Status: Listening on :8743</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-mono">
            {/* Left pane: Shared Folders */}
            <div className="md:col-span-6 space-y-3">
              <span className="text-[#8b949e] uppercase text-[10px] tracking-wider block">
                Local Shared Folders
              </span>
              <div className="space-y-2">
                <div className="p-2.5 rounded border border-[#30363d] bg-[#0e1117] flex items-center justify-between">
                  <div>
                    <p className="text-[#f0f6fc] font-medium">C:/Users/Media/4K_Library</p>
                    <p className="text-[#8b949e] text-[10px]">142 files • 482.4 GB</p>
                  </div>
                  <span className="text-[#38bdf8] text-[10px]">Active</span>
                </div>
                <div className="p-2.5 rounded border border-[#30363d] bg-[#0e1117] flex items-center justify-between">
                  <div>
                    <p className="text-[#f0f6fc] font-medium">D:/Backup/RAW_Photos</p>
                    <p className="text-[#8b949e] text-[10px]">1,280 files • 42.1 GB</p>
                  </div>
                  <span className="text-[#38bdf8] text-[10px]">Active</span>
                </div>
              </div>
            </div>

            {/* Right pane: Paired Devices */}
            <div className="md:col-span-6 space-y-3">
              <span className="text-[#8b949e] uppercase text-[10px] tracking-wider block">
                Paired Hardware Mesh
              </span>
              <div className="space-y-2">
                <div className="p-2.5 rounded border border-[#30363d] bg-[#0e1117] flex items-center justify-between">
                  <div>
                    <p className="text-[#f0f6fc] font-medium">Pixel 9 Pro (Android 15)</p>
                    <p className="text-[#8b949e] text-[10px]">10.0.0.4:8743 • mDNS direct</p>
                  </div>
                  <span className="text-[#f0f6fc] text-[10px]">Connected</span>
                </div>
                <div className="p-2.5 rounded border border-[#30363d] bg-[#0e1117] flex items-center justify-between">
                  <div>
                    <p className="text-[#f0f6fc] font-medium">Shield TV 4K (Android TV)</p>
                    <p className="text-[#8b949e] text-[10px]">10.0.0.8:8743 • mDNS direct</p>
                  </div>
                  <span className="text-[#f0f6fc] text-[10px]">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
