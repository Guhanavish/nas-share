import React, { useState } from "react";
import { RefreshCw, ShieldCheck, ArrowRightLeft } from "lucide-react";

export const SyncPage: React.FC = () => {
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string>("Up to date");

  const handleSyncNow = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(`Synced just now (${new Date().toLocaleTimeString()})`);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Folder Sync & Backup</h1>
        <p className="text-sm text-gray-400">
          Continuous delta synchronization with conflict preservation
        </p>
      </div>

      {/* Sync Policy Info Card */}
      <div className="bg-[#1B1E24] border border-[#262A33] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Keep-Both Conflict Policy</h3>
              <p className="text-xs text-gray-400">
                If two devices edit the same file, both versions are preserved with device timestamps.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary/15 text-secondary border border-secondary/20">
            Active
          </span>
        </div>
      </div>

      {/* Auto Backup Toggle */}
      <div className="bg-[#1B1E24] border border-[#262A33] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Automatic Background Sync</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Synchronizes file changes in real-time when trusted devices are on the network
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={autoSync}
            onChange={() => setAutoSync(!autoSync)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
        </label>
      </div>

      {/* Manual Sync Trigger */}
      <div className="bg-[#1B1E24] border border-[#262A33] rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-primary flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Manual Manifest Sync</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{lastSync}</p>
          </div>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={syncing}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl transition shadow-lg shadow-blue-500/10"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Scanning Manifests..." : "Sync Now"}
        </button>
      </div>
    </div>
  );
};
