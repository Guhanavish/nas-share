// =============================================================================
// NAS Share — FileProto & Signaling Types (TypeScript canonical)
// =============================================================================

// ---------------------------------------------------------------------------
// Crockford Base32 Alphabet (no I, L, O, U, 0, 1)
// ---------------------------------------------------------------------------
export const CROCKFORD_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

// ---------------------------------------------------------------------------
// Device Identity
// ---------------------------------------------------------------------------
export interface DeviceInfo {
  device_id: string;      // UUID v4
  device_name: string;    // hostname or user-chosen
  pubkey: string;         // Ed25519 public key, hex-encoded
}

export interface TrustedDevice extends DeviceInfo {
  pinned_at: number;      // Unix timestamp ms
  last_seen?: number;     // Unix timestamp ms
  is_revoked: boolean;
}

// ---------------------------------------------------------------------------
// Shared Folder
// ---------------------------------------------------------------------------
export type AclMode = "READ" | "READWRITE";

export interface SharedFolder {
  id: string;
  path: string;
  label: string;
  acl: AclMode;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// FileProto — File Entry & Metadata
// ---------------------------------------------------------------------------
export type EntryType = "file" | "dir";

export interface FileEntry {
  name: string;
  entry_type: EntryType;
  size: number;           // bytes, 0 for dirs
  mtime: number;          // Unix timestamp ms
  hash?: string;          // SHA-256 hex, optional
}

export interface FileMeta {
  name: string;
  entry_type: EntryType;
  size: number;
  mtime: number;
  hash?: string;
  mime_type?: string;
}

// ---------------------------------------------------------------------------
// FileProto — Requests
// ---------------------------------------------------------------------------
export type FileProtoRequest =
  | ListRequest
  | StatRequest
  | ReadRequest
  | WriteRequest
  | ThumbRequest
  | SyncManifestRequest;

export interface ListRequest {
  type: "list";
  id: string;
  path: string;
}

export interface StatRequest {
  type: "stat";
  id: string;
  path: string;
}

export interface ReadRequest {
  type: "read";
  id: string;
  path: string;
  offset: number;
  len: number;
}

export interface WriteRequest {
  type: "write";
  id: string;
  path: string;
  offset: number;
  resume_id?: string;
}

export interface ThumbRequest {
  type: "thumb";
  id: string;
  path: string;
}

export interface SyncManifestRequest {
  type: "sync_manifest";
  id: string;
  root: string;
  recursive: boolean;
}

// ---------------------------------------------------------------------------
// FileProto — Responses
// ---------------------------------------------------------------------------
export type FileProtoResponse =
  | ListResponse
  | StatResponse
  | ReadResponse
  | WriteAckResponse
  | ThumbResponse
  | SyncManifestResponse
  | ErrorResponse;

export interface ListResponse {
  type: "list_response";
  id: string;
  ok: true;
  entries: FileEntry[];
}

export interface StatResponse {
  type: "stat_response";
  id: string;
  ok: true;
  meta: FileMeta;
}

export interface ReadResponse {
  type: "read_response";
  id: string;
  ok: true;
  offset: number;
  len: number;
  // binary data follows in separate binary frame / chunk
}

export interface WriteAckResponse {
  type: "write_ack";
  id: string;
  ok: true;
  bytes_written: number;
}

export interface ThumbResponse {
  type: "thumb_response";
  id: string;
  ok: true;
  // JPEG binary follows
}

export interface SyncManifestResponse {
  type: "sync_manifest_response";
  id: string;
  ok: true;
  entries: SyncManifestEntry[];
}

export interface SyncManifestEntry {
  path: string;
  size: number;
  mtime: number;
  sha256: string;
}

// ---------------------------------------------------------------------------
// Error Codes
// ---------------------------------------------------------------------------
export type ErrorCode = "NOT_FOUND" | "DENIED" | "CONFLICT" | "BUSY";

export interface ErrorResponse {
  type: "error";
  id: string;
  ok: false;
  code: ErrorCode;
  message?: string;
}

// ---------------------------------------------------------------------------
// Signaling Messages (Worker relay)
// ---------------------------------------------------------------------------
export type SignalingType = "offer" | "answer" | "ice" | "join" | "leave" | "ping" | "error";

export interface SignalingMessage {
  type: SignalingType;
  payload?: unknown;
}

export interface SignalingOffer {
  type: "offer";
  payload: { sdp: string };
}

export interface SignalingAnswer {
  type: "answer";
  payload: { sdp: string };
}

export interface SignalingIce {
  type: "ice";
  payload: { candidate: string; sdpMid?: string; sdpMLineIndex?: number };
}

export interface SignalingJoin {
  type: "join";
  payload: { role: "initiator" | "joiner" };
}

export interface SignalingLeave {
  type: "leave";
  payload?: undefined;
}

export interface SignalingPing {
  type: "ping";
  payload?: undefined;
}

export interface SignalingError {
  type: "error";
  payload: { code: string; message: string };
}

// ---------------------------------------------------------------------------
// Pairing
// ---------------------------------------------------------------------------
export interface PairingCommit {
  commit: string;         // SHA-256 hex of pairing code
}

export interface PairingIdentity {
  device_id: string;
  device_name: string;
  pubkey: string;         // Ed25519 public key hex
}

// ---------------------------------------------------------------------------
// ICE Configuration
// ---------------------------------------------------------------------------
export interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

export interface TurnResponse {
  ice_servers: IceServer[];
}

// ---------------------------------------------------------------------------
// Device Discovery (mDNS)
// ---------------------------------------------------------------------------
export type ConnectionType = "lan" | "p2p" | "relay" | "offline";

export interface DiscoveredDevice extends DeviceInfo {
  address: string;        // IP:port
  connection_type: ConnectionType;
  signal_strength?: number;
}
