import React, { useEffect, useState } from "react";
import { Wifi, Laptop, Smartphone, Trash2, QrCode, RefreshCw } from "lucide-react";
import { DiscoveredDevice, TrustedDevice } from "../lib/types";
import { getDiscoveredDevices, getTrustedDevices, revokeDevice } from "../lib/tauri";

interface DevicesPageProps {
  onSelectDevice: (device: { address: string; name: string }) => void;
  onOpenPairing: () => void;
}

export const DevicesPage: React.FC<DevicesPageProps> = ({
  onSelectDevice,
  onOpenPairing,
}) => {
  const [discovered, setDiscovered] = useState<DiscoveredDevice[]>([]);
  const [trusted, setTrusted] = useState<TrustedDevice[]>([]);

  const loadDevices = async () => {
    try {
      const [disc, trust] = await Promise.all([
        getDiscoveredDevices().catch(() => []),
        getTrustedDevices().catch(() => []),
      ]);
      setDiscovered(disc);
      setTrusted(trust);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRevoke = async (e: React.MouseEvent, deviceId: string) => {
    e.stopPropagation();
    if (confirm("Revoke trust for this device? It will no longer be able to connect.")) {
      await revokeDevice(deviceId);
      loadDevices();
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Devices</h1>
          <p className="text-sm text-gray-400">
            Browse nearby network shares or paired remote devices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDevices}
            className="p-2.5 bg-[#1B1E24] hover:bg-[#262A33] border border-[#262A33] rounded-xl text-gray-300 transition"
            title="Refresh devices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenPairing}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl transition shadow-lg shadow-blue-500/10"
          >
            <QrCode className="w-4 h-4" />
            Pair Device
          </button>
        </div>
      </div>

      {/* Discovered on LAN */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          Discovered on Local Network
        </h2>

        {discovered.length === 0 ? (
          <div className="bg-[#1B1E24] border border-[#262A33] rounded-2xl p-6 text-center text-gray-400 text-sm">
            Scanning local network via mDNS... Ensure other devices have NAS Share open.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discovered.map((d) => (
              <div
                key={d.device_id || d.address}
                onClick={() => onSelectDevice({ address: d.address, name: d.device_name })}
                className="bg-[#1B1E24] hover:bg-[#22262E] border border-[#262A33] rounded-2xl p-5 cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-primary flex items-center justify-center font-bold">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-primary transition">
                      {d.device_name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{d.address}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-secondary/15 text-secondary border border-secondary/20">
                  LAN Direct
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trusted devices */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Paired & Trusted Devices
        </h2>

        {trusted.length === 0 ? (
          <div className="bg-[#1B1E24] border border-[#262A33] rounded-2xl p-6 text-center text-gray-400 text-sm">
            No devices paired yet. Click "Pair Device" above to exchange 8-character codes.
          </div>
        ) : (
          <div className="divide-y divide-[#262A33] bg-[#1B1E24] border border-[#262A33] rounded-2xl overflow-hidden">
            {trusted.map((t) => {
              const matched = discovered.find((d) => d.device_id === t.device_id);
              const isOnline = Boolean(matched);
              const address = matched?.address || "";

              return (
                <div
                  key={t.device_id}
                  onClick={() => isOnline && onSelectDevice({ address, name: t.device_name })}
                  className={`p-4 flex items-center justify-between transition ${
                    isOnline
                      ? "hover:bg-[#22262E] cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isOnline
                          ? "bg-secondary/10 text-secondary"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{t.device_name}</h3>
                      <p className="text-xs text-gray-400">
                        {isOnline ? `Online (${address})` : "Offline away from network"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleRevoke(e, t.device_id)}
                      className="p-2 text-gray-400 hover:text-danger rounded-lg transition"
                      title="Revoke trust"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
