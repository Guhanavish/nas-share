// =============================================================================
// NAS Share — Rust Protocol Types (serde)
// =============================================================================

use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Crockford Base32
// ---------------------------------------------------------------------------
pub const CROCKFORD_ALPHABET: &[u8] = b"ABCDEFGHJKMNPQRSTVWXYZ23456789";

// ---------------------------------------------------------------------------
// Device Identity
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub device_id: String,
    pub device_name: String,
    pub pubkey: String, // Ed25519 hex
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrustedDevice {
    pub device_id: String,
    pub device_name: String,
    pub pubkey: String,
    pub pinned_at: i64,
    pub last_seen: Option<i64>,
    pub is_revoked: bool,
}

// ---------------------------------------------------------------------------
// Shared Folder
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AclMode {
    #[serde(rename = "READ")]
    Read,
    #[serde(rename = "READWRITE")]
    ReadWrite,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharedFolder {
    pub id: String,
    pub path: String,
    pub label: String,
    pub acl: AclMode,
    pub enabled: bool,
}

// ---------------------------------------------------------------------------
// File Entry & Meta
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EntryType {
    #[serde(rename = "file")]
    File,
    #[serde(rename = "dir")]
    Dir,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub entry_type: EntryType,
    pub size: u64,
    pub mtime: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hash: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMeta {
    pub name: String,
    pub entry_type: EntryType,
    pub size: u64,
    pub mtime: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hash: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mime_type: Option<String>,
}

// ---------------------------------------------------------------------------
// FileProto Requests
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum FileProtoRequest {
    #[serde(rename = "list")]
    List { id: String, path: String },
    #[serde(rename = "stat")]
    Stat { id: String, path: String },
    #[serde(rename = "read")]
    Read {
        id: String,
        path: String,
        offset: u64,
        len: u64,
    },
    #[serde(rename = "write")]
    Write {
        id: String,
        path: String,
        offset: u64,
        #[serde(skip_serializing_if = "Option::is_none")]
        resume_id: Option<String>,
    },
    #[serde(rename = "thumb")]
    Thumb { id: String, path: String },
    #[serde(rename = "sync_manifest")]
    SyncManifest {
        id: String,
        root: String,
        recursive: bool,
    },
}

// ---------------------------------------------------------------------------
// FileProto Responses
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum FileProtoResponse {
    #[serde(rename = "list_response")]
    ListResponse {
        id: String,
        ok: bool,
        entries: Vec<FileEntry>,
    },
    #[serde(rename = "stat_response")]
    StatResponse {
        id: String,
        ok: bool,
        meta: FileMeta,
    },
    #[serde(rename = "read_response")]
    ReadResponse {
        id: String,
        ok: bool,
        offset: u64,
        len: u64,
    },
    #[serde(rename = "write_ack")]
    WriteAck {
        id: String,
        ok: bool,
        bytes_written: u64,
    },
    #[serde(rename = "thumb_response")]
    ThumbResponse { id: String, ok: bool },
    #[serde(rename = "sync_manifest_response")]
    SyncManifestResponse {
        id: String,
        ok: bool,
        entries: Vec<SyncManifestEntry>,
    },
    #[serde(rename = "error")]
    Error {
        id: String,
        ok: bool,
        code: ErrorCode,
        #[serde(skip_serializing_if = "Option::is_none")]
        message: Option<String>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncManifestEntry {
    pub path: String,
    pub size: u64,
    pub mtime: i64,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ErrorCode {
    NOT_FOUND,
    DENIED,
    CONFLICT,
    BUSY,
}

// ---------------------------------------------------------------------------
// Signaling
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum SignalingMessage {
    #[serde(rename = "offer")]
    Offer { payload: SdpPayload },
    #[serde(rename = "answer")]
    Answer { payload: SdpPayload },
    #[serde(rename = "ice")]
    Ice { payload: IcePayload },
    #[serde(rename = "join")]
    Join { payload: JoinPayload },
    #[serde(rename = "leave")]
    Leave,
    #[serde(rename = "ping")]
    Ping,
    #[serde(rename = "error")]
    Error { payload: ErrorPayload },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SdpPayload {
    pub sdp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IcePayload {
    pub candidate: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sdp_mid: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sdp_m_line_index: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JoinPayload {
    pub role: PeerRole,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PeerRole {
    #[serde(rename = "initiator")]
    Initiator,
    #[serde(rename = "joiner")]
    Joiner,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorPayload {
    pub code: String,
    pub message: String,
}

// ---------------------------------------------------------------------------
// Pairing
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PairingCommit {
    pub commit: String, // SHA-256 hex of code
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PairingIdentity {
    pub device_id: String,
    pub device_name: String,
    pub pubkey: String,
}

// ---------------------------------------------------------------------------
// ICE / TURN
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IceServer {
    pub urls: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub credential: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TurnResponse {
    pub ice_servers: Vec<IceServer>,
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConnectionType {
    #[serde(rename = "lan")]
    Lan,
    #[serde(rename = "p2p")]
    P2p,
    #[serde(rename = "relay")]
    Relay,
    #[serde(rename = "offline")]
    Offline,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredDevice {
    pub device_id: String,
    pub device_name: String,
    pub pubkey: String,
    pub address: String,
    pub connection_type: ConnectionType,
    pub signal_strength: Option<i32>,
}
