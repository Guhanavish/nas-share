import React, { useEffect, useState } from "react";
import { Folder, Plus, Trash2, QrCode } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { SharedFolder } from "../lib/types";
import {
  getSharedFolders,
  addSharedFolder,
  removeSharedFolder,
  toggleSharedFolder,
} from "../lib/tauri";

interface SharePageProps {
  onOpenPairing: () => void;
}

export const SharePage: React.FC<SharePageProps> = ({ onOpenPairing }) => {
  const [folders, setFolders] = useState<SharedFolder[]>([]);

  const loadFolders = async () => {
    try {
      const list = await getSharedFolders();
      setFolders(list);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleAddFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (!selected || typeof selected !== "string") return;

    const label = selected.split(/[\\/]/).pop() || "Share";
    await addSharedFolder(selected, label, "READWRITE");
    loadFolders();
  };

  const handleRemove = async (id: string) => {
    await removeSharedFolder(id);
    loadFolders();
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleSharedFolder(id, !current);
    loadFolders();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shared Folders</h1>
          <p className="text-sm text-gray-400">
            Select local directories to expose to your trusted devices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPairing}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B1E24] hover:bg-[#262A33] border border-[#262A33] text-gray-200 font-medium rounded-xl transition"
          >
            <QrCode className="w-4 h-4" />
            Show Pairing Code
          </button>
          <button
            onClick={handleAddFolder}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl transition shadow-lg shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            Add Folder
          </button>
        </div>
      </div>

      {folders.length === 0 ? (
        <div className="bg-[#1B1E24] border border-[#262A33] rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-primary flex items-center justify-center mx-auto">
            <Folder className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">No Folders Shared Yet</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mt-1">
              Add a folder from your PC to allow other phones or PCs on your network to
              browse, download, and stream media.
            </p>
          </div>
          <button
            onClick={handleAddFolder}
            className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl transition"
          >
            Choose Folder to Share
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="bg-[#1B1E24] border border-[#262A33] rounded-2xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 truncate">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Folder className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{folder.label}</h3>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#121418] text-primary border border-[#262A33]">
                      {folder.acl}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1 truncate">
                    {folder.path}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={folder.enabled}
                    onChange={() => handleToggle(folder.id, folder.enabled)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                </label>

                <button
                  onClick={() => handleRemove(folder.id)}
                  className="p-2 text-gray-400 hover:text-danger rounded-lg transition"
                  title="Stop sharing folder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
