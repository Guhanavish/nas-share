import React, { useEffect, useState } from "react";
import {
  Folder,
  File,
  FileVideo,
  FileAudio,
  FileImage,
  Download,
  RefreshCw,
  Loader2,
  Search,
  CloudOff,
  Layers,
} from "lucide-react";
import { save } from "@tauri-apps/plugin-dialog";
import { FileEntry, TrustedDevice, DiscoveredDevice, PoolTransport } from "../lib/types";
import {
  getDiscoveredDevices,
  getRemoteOnline,
  getTrustedDevices,
  listFiles,
  listFilesRemote,
  downloadFile,
  downloadFileRemote,
} from "../lib/tauri";

interface PooledEntry extends FileEntry {
  deviceId: string;
  deviceName: string;
  address: string;
  remotePath: string;
  transport: PoolTransport;
}

interface PoolSection {
  deviceId: string;
  deviceName: string;
  online: boolean;
  address: string;
  entries: PooledEntry[];
  error?: string;
  transport: PoolTransport;
}

function iconFor(name: string, isDir: boolean) {
  if (isDir) return <Folder className="w-5 h-5 text-primary" />;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "mkv", "mov"].includes(ext))
    return <FileVideo className="w-5 h-5 text-gray-400" />;
  if (["mp3", "flac", "wav"].includes(ext))
    return <FileAudio className="w-5 h-5 text-gray-400" />;
  if (["jpg", "jpeg", "png"].includes(ext))
    return <FileImage className="w-5 h-5 text-gray-400" />;
  return <File className="w-5 h-5 text-gray-400" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

export const PoolPage: React.FC = () => {
  const [sections, setSections] = useState<PoolSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [transferring, setTransferring] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");

  const loadPool = async () => {
    setLoading(true);
    try {
      const [trusted, discovered, remoteOnline]: [
        TrustedDevice[],
        DiscoveredDevice[],
        { device_id: string }[]
      ] = await Promise.all([
        getTrustedDevices(),
        getDiscoveredDevices(),
        getRemoteOnline().catch(() => []),
      ]);
      const byId = new Map(discovered.map((d) => [d.device_id, d]));
      const remoteIds = new Set(remoteOnline.map((d) => d.device_id));

      const results = await Promise.all(
        trusted.map(async (device): Promise<PoolSection> => {
          const found = byId.get(device.device_id);
          if (found) {
            try {
              const files = await listFiles(found.address, "/");
              return {
                deviceId: device.device_id,
                deviceName: device.device_name,
                online: true,
                address: found.address,
                transport: "lan",
                entries: files.map((e) => ({
                  ...e,
                  deviceId: device.device_id,
                  deviceName: device.device_name,
                  address: found.address,
                  remotePath: `/${e.name}`,
                  transport: "lan" as PoolTransport,
                })),
              };
            } catch (e) {
              return {
                deviceId: device.device_id,
                deviceName: device.device_name,
                online: false,
                address: found.address,
                transport: "lan",
                entries: [],
                error: String(e),
              };
            }
          }
          if (remoteIds.has(device.device_id)) {
            try {
              const files = await listFilesRemote(device.device_id);
              return {
                deviceId: device.device_id,
                deviceName: device.device_name,
                online: true,
                address: "relay",
                transport: "relay",
                entries: files.map((e) => ({
                  ...e,
                  deviceId: device.device_id,
                  deviceName: device.device_name,
                  address: "relay",
                  remotePath: `/${e.name}`,
                  transport: "relay" as PoolTransport,
                })),
              };
            } catch (e) {
              return {
                deviceId: device.device_id,
                deviceName: device.device_name,
                online: false,
                address: "",
                transport: "relay",
                entries: [],
                error: String(e),
              };
            }
          }
          return {
            deviceId: device.device_id,
            deviceName: device.device_name,
            online: false,
            address: "",
            transport: "lan",
            entries: [],
          };
        })
      );
      setSections(results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPool();
  }, []);

  const handleDownload = async (entry: PooledEntry) => {
    if (entry.entry_type === "dir") return;
    try {
      const targetPath = await save({ defaultPath: entry.name });
      if (!targetPath) return;
      const via = entry.transport === "relay" ? "via relay" : "via LAN";
      setTransferring(`Downloading ${entry.name} from ${entry.deviceName} (${via})...`);
      if (entry.transport === "relay") {
        await downloadFileRemote(entry.deviceId, entry.remotePath, targetPath);
      } else {
        await downloadFile(entry.address, entry.remotePath, targetPath);
      }
      alert(`Downloaded ${entry.name} successfully!`);
    } catch (e) {
      alert(`Download failed: ${e}`);
    } finally {
      setTransferring(null);
    }
  };

  const visible = sections.map((s) => ({
    ...s,
    entries: query.trim()
      ? s.entries.filter((e) =>
          e.name.toLowerCase().includes(query.trim().toLowerCase())
        )
      : s.entries,
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Pool — All Devices</h2>
        </div>
        <button
          onClick={loadPool}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-[#262A33] hover:bg-[#2f3540] text-gray-300"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all devices"
          className="w-full bg-[#1B1E24] border border-[#262A33] rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {transferring && (
        <div className="mb-4 bg-[#262A33] rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {transferring}
        </div>
      )}

      {loading && sections.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : sections.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          Pair a device first — Pool shows here.
        </p>
      ) : (
        visible.map((section) => (
          <div key={section.deviceId} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`font-semibold ${
                  section.online ? "text-primary" : "text-gray-600"
                }`}
              >
                {section.deviceName}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  section.online
                    ? "bg-primary text-white"
                    : "bg-[#262A33] text-gray-500"
                }`}
              >
                {section.online
                  ? `${section.entries.length} files • ${section.transport === "relay" ? "Relay" : "LAN"}`
                  : "Offline"}
              </span>
            </div>

            {!section.online ? (
              <div className="flex items-center gap-2 text-gray-600 text-sm py-1 opacity-60">
                <CloudOff className="w-4 h-4" />
                Device offline — files unavailable
              </div>
            ) : section.entries.length === 0 ? (
              <p className="text-gray-600 text-sm">No files shared</p>
            ) : (
              <div className="bg-[#1B1E24] border border-[#262A33] rounded-xl divide-y divide-[#262A33]">
                {section.entries.map((entry) => (
                  <button
                    key={`${entry.deviceId}:${entry.remotePath}`}
                    onClick={() => handleDownload(entry)}
                    disabled={entry.entry_type === "dir"}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#262A33] text-left disabled:opacity-70"
                  >
                    {iconFor(entry.name, entry.entry_type === "dir")}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.entry_type === "file"
                          ? `${formatBytes(entry.size)} • `
                          : ""}
                        {entry.deviceName}
                      </p>
                    </div>
                    {entry.entry_type === "file" && (
                      <Download className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
