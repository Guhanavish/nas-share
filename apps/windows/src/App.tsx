import { useState, useEffect } from "react";
import { Laptop, Folder, Share2, RefreshCw, HardDrive } from "lucide-react";
import { DevicesPage } from "./pages/DevicesPage";
import { FilesPage } from "./pages/FilesPage";
import { SharePage } from "./pages/SharePage";
import { SyncPage } from "./pages/SyncPage";
import { PairingDialog } from "./pages/PairingDialog";
import { getDeviceInfo } from "./lib/tauri";

type Tab = "devices" | "files" | "share" | "sync";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("devices");
  const [selectedDevice, setSelectedDevice] = useState<{
    address: string;
    name: string;
  } | null>(null);
  const [pairingOpen, setPairingOpen] = useState<boolean>(false);
  const [localDeviceName, setLocalDeviceName] = useState<string>("Windows PC");

  useEffect(() => {
    getDeviceInfo()
      .then((info) => setLocalDeviceName(info.device_name))
      .catch(() => {});
  }, []);

  const handleSelectDevice = (device: { address: string; name: string }) => {
    setSelectedDevice(device);
    setActiveTab("files");
  };

  return (
    <div className="flex h-screen bg-[#121418] text-[#F3F4F6]">
      {/* Sidebar navigation */}
      <aside className="w-64 bg-[#1B1E24] border-r border-[#262A33] flex flex-col justify-between p-4 flex-shrink-0 select-none">
        <div className="space-y-6">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">NAS Share</h1>
              <p className="text-xs text-gray-400 font-mono">v0.1.0 • P2P NAS</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("devices")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                activeTab === "devices"
                  ? "bg-primary text-white shadow-md shadow-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-[#262A33]"
              }`}
            >
              <Laptop className="w-4 h-4" />
              Devices
            </button>

            {selectedDevice && (
              <button
                onClick={() => setActiveTab("files")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  activeTab === "files"
                    ? "bg-primary text-white shadow-md shadow-blue-500/20"
                    : "text-gray-400 hover:text-white hover:bg-[#262A33]"
                }`}
              >
                <Folder className="w-4 h-4" />
                Files ({selectedDevice.name})
              </button>
            )}

            <button
              onClick={() => setActiveTab("share")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                activeTab === "share"
                  ? "bg-primary text-white shadow-md shadow-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-[#262A33]"
              }`}
            >
              <Share2 className="w-4 h-4" />
              Shared Folders
            </button>

            <button
              onClick={() => setActiveTab("sync")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                activeTab === "sync"
                  ? "bg-primary text-white shadow-md shadow-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-[#262A33]"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Sync & Backup
            </button>
          </nav>
        </div>

        {/* Local device status footer */}
        <div className="bg-[#121418] border border-[#262A33] rounded-xl p-3 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs text-gray-400">This Device</p>
            <p className="text-sm font-semibold text-white truncate">{localDeviceName}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" title="Server Active on port 8743" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "devices" && (
          <DevicesPage
            onSelectDevice={handleSelectDevice}
            onOpenPairing={() => setPairingOpen(true)}
          />
        )}

        {activeTab === "files" && selectedDevice && (
          <FilesPage
            device={selectedDevice}
            onBack={() => setActiveTab("devices")}
          />
        )}

        {activeTab === "share" && (
          <SharePage onOpenPairing={() => setPairingOpen(true)} />
        )}

        {activeTab === "sync" && <SyncPage />}
      </main>

      {/* Pairing Dialog Modal */}
      {pairingOpen && (
        <PairingDialog
          onClose={() => setPairingOpen(false)}
          onSuccess={(name) => {
            alert(`Pairing successful with ${name}!`);
          }}
        />
      )}
    </div>
  );
}
