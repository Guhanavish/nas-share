import React, { useEffect, useState } from "react";
import {
  Folder,
  File,
  FileVideo,
  FileAudio,
  FileImage,
  ArrowLeft,
  Upload,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { FileEntry } from "../lib/types";
import { listFiles, downloadFile, uploadFile } from "../lib/tauri";

interface FilesPageProps {
  device: { address: string; name: string };
  onBack: () => void;
}

export const FilesPage: React.FC<FilesPageProps> = ({ device, onBack }) => {
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [transferring, setTransferring] = useState<string | null>(null);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    try {
      const list = await listFiles(device.address, path);
      setEntries(list);
      setCurrentPath(path);
    } catch (e) {
      alert(`Failed to load directory: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory("/");
  }, [device.address]);

  const handleDownload = async (entry: FileEntry) => {
    try {
      const targetPath = await save({
        defaultPath: entry.name,
      });
      if (!targetPath) return;

      const remoteFilePath =
        currentPath === "/" ? entry.name : `${currentPath}/${entry.name}`;
      setTransferring(`Downloading ${entry.name}...`);
      await downloadFile(device.address, remoteFilePath, targetPath);
      alert(`Downloaded ${entry.name} successfully!`);
    } catch (e) {
      alert(`Download failed: ${e}`);
    } finally {
      setTransferring(null);
    }
  };

  const handleUpload = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
      });
      if (!selected || typeof selected !== "string") return;

      const fileName = selected.split(/[\\/]/).pop() || "upload.bin";
      const remoteTargetPath =
        currentPath === "/" ? fileName : `${currentPath}/${fileName}`;

      setTransferring(`Uploading ${fileName}...`);
      await uploadFile(device.address, selected, remoteTargetPath);
      alert(`Uploaded ${fileName} successfully!`);
      loadDirectory(currentPath);
    } catch (e) {
      alert(`Upload failed: ${e}`);
    } finally {
      setTransferring(null);
    }
  };

  const getFileIcon = (entry: FileEntry) => {
    if (entry.entry_type === "dir") {
      return <Folder className="w-5 h-5 text-primary" />;
    }
    const ext = entry.name.split(".").pop()?.toLowerCase();
    if (["mp4", "mkv", "mov", "avi"].includes(ext || "")) {
      return <FileVideo className="w-5 h-5 text-purple-400" />;
    }
    if (["mp3", "flac", "wav"].includes(ext || "")) {
      return <FileAudio className="w-5 h-5 text-emerald-400" />;
    }
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
      return <FileImage className="w-5 h-5 text-amber-400" />;
    }
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "—";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-[#1B1E24] hover:bg-[#262A33] border border-[#262A33] rounded-xl text-gray-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{device.name}</h1>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{currentPath}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDirectory(currentPath)}
            className="p-2.5 bg-[#1B1E24] hover:bg-[#262A33] border border-[#262A33] rounded-xl text-gray-300 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleUpload}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-blue-500/10"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>

      {transferring && (
        <div className="bg-primary/10 border border-primary/20 text-primary rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          {transferring}
        </div>
      )}

      {/* Directory items table */}
      <div className="bg-[#1B1E24] border border-[#262A33] rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-[#262A33] text-xs font-semibold uppercase tracking-wider text-gray-400">
          <span className="col-span-8">Name</span>
          <span className="col-span-2 text-right">Size</span>
          <span className="col-span-2 text-right">Action</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading files...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            This directory is empty.
          </div>
        ) : (
          <div className="divide-y divide-[#262A33]/50">
            {/* Go Up directory row */}
            {currentPath !== "/" && (
              <div
                onClick={() => {
                  const parent = currentPath.substring(0, currentPath.lastIndexOf("/")) || "/";
                  loadDirectory(parent);
                }}
                className="grid grid-cols-12 px-5 py-3.5 hover:bg-[#22262E] cursor-pointer transition items-center text-sm font-medium text-gray-300"
              >
                <div className="col-span-12 flex items-center gap-3">
                  <Folder className="w-5 h-5 text-gray-500" />
                  .. (Parent Directory)
                </div>
              </div>
            )}

            {entries.map((entry) => (
              <div
                key={entry.name}
                onClick={() => {
                  if (entry.entry_type === "dir") {
                    const next =
                      currentPath === "/" ? `/${entry.name}` : `${currentPath}/${entry.name}`;
                    loadDirectory(next);
                  }
                }}
                className={`grid grid-cols-12 px-5 py-3.5 hover:bg-[#22262E] transition items-center text-sm ${
                  entry.entry_type === "dir" ? "cursor-pointer" : ""
                }`}
              >
                <div className="col-span-8 flex items-center gap-3 truncate">
                  {getFileIcon(entry)}
                  <span className="font-medium text-white truncate">{entry.name}</span>
                </div>

                <div className="col-span-2 text-right font-mono text-xs text-gray-400">
                  {formatSize(entry.size)}
                </div>

                <div className="col-span-2 text-right">
                  {entry.entry_type === "file" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(entry);
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
