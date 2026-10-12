import { invoke } from "@tauri-apps/api/core";
import { DeviceInfo, DiscoveredDevice, TrustedDevice, SharedFolder, FileEntry, Settings, RemoteDevice } from "./types";

export async function getDeviceInfo(): Promise<DeviceInfo> {
  return await invoke("get_device_info");
}

export async function getDiscoveredDevices(): Promise<DiscoveredDevice[]> {
  return await invoke("get_discovered_devices");
}

export async function getTrustedDevices(): Promise<TrustedDevice[]> {
  return await invoke("get_trusted_devices");
}

export async function listFiles(address: string, path: string): Promise<FileEntry[]> {
  return await invoke("list_files", { address, path });
}

export async function downloadFile(address: string, remotePath: string, localPath: string): Promise<void> {
  return await invoke("download_file", { address, remotePath, localPath });
}

export async function uploadFile(address: string, localPath: string, remotePath: string): Promise<void> {
  return await invoke("upload_file", { address, localPath, remotePath });
}

export async function getSharedFolders(): Promise<SharedFolder[]> {
  return await invoke("get_shared_folders");
}

export async function addSharedFolder(path: string, label: string, acl: string): Promise<SharedFolder> {
  return await invoke("add_shared_folder", { path, label, acl });
}

export async function removeSharedFolder(id: string): Promise<void> {
  return await invoke("remove_shared_folder", { id });
}

export async function toggleSharedFolder(id: string, enabled: boolean): Promise<void> {
  return await invoke("toggle_shared_folder", { id, enabled });
}

export async function generatePairingCode(): Promise<string> {
  return await invoke("generate_pairing_code");
}

export async function joinPairing(code: string): Promise<string> {
  return await invoke("join_pairing", { code });
}

export async function revokeDevice(deviceId: string): Promise<void> {
  return await invoke("revoke_device", { deviceId });
}

export async function getSettings(): Promise<Settings> {
  return await invoke("get_settings");
}

export async function updateSettings(settings: Settings): Promise<void> {
  return await invoke("update_settings", { settings });
}

export async function getRemoteOnline(): Promise<RemoteDevice[]> {
  return await invoke("get_remote_online");
}

export async function listFilesRemote(deviceId: string): Promise<FileEntry[]> {
  return await invoke("list_files_remote", { deviceId });
}

export async function downloadFileRemote(
  deviceId: string,
  remotePath: string,
  localPath: string
): Promise<void> {
  return await invoke("download_file_remote", {
    deviceId,
    remotePath,
    localPath,
  });
}
