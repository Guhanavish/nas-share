import { TransferApp } from "../components/transfer/TransferApp";
import { useMeta } from "../lib/meta";

export function TransferPage() {
  useMeta({
    title: "NASend Transfer — Interactive Transfer Demo",
    description: "Simulate sending and receiving files directly between devices in your browser.",
    path: "/transfer",
  });

  return (
    <div className="py-24 px-6 bg-[#0C0D0C] min-h-[calc(100vh-14rem)] flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[11px] font-mono text-[#929690] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3B899]" />
          <span>Interactive Demo</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F3F0]">
          Try the transfer flow
        </h1>
        <p className="text-xs sm:text-sm text-[#929690] font-sans">
          This workspace simulates a transfer in your browser. No files leave your device. Use the Android or Windows app to transfer real files.
        </p>
      </div>

      <TransferApp className="max-w-2xl" />
    </div>
  );
}
