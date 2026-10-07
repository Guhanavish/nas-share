export type ConnectionType = "lan" | "p2p" | "relay" | "offline";

export interface DeviceInfo {
  device_id: string;
  device_name: string;
  pubkey: string;
}

export interface DiscoveredDevice extends DeviceInfo {
  address: string;
  connection_type: ConnectionType;
  signal_strength?: number;
}

export interface TrustedDevice extends DeviceInfo {
  pinned_at: number;
  last_seen?: number;
  is_revoked: boolean;
}

export interface SharedFolder {
  id: string;
  path: string;
  label: string;
  acl: "READ" | "READWRITE";
  enabled: boolean;
}

export interface FileEntry {
  name: string;
  entry_type: "file" | "dir";
  size: number;
  mtime: number;
  hash?: string;
}

export interface FileMeta {
  name: string;
  entry_type: "file" | "dir";
  size: number;
  mtime: number;
  hash?: string;
  mime_type?: string;
}

export interface Settings {
  port: number;
  autostart: boolean;
  bandwidth_limit: number;
  worker_url: string;
}

export interface TransferProgress {
  file_name: string;
  bytes_transferred: number;
  total_bytes: number;
  percent: number;
}
