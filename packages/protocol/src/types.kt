// =============================================================================
// NAS Share — Kotlin Protocol Types (kotlinx.serialization)
// =============================================================================
package com.nas.protocol

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// ---------------------------------------------------------------------------
// Crockford Base32
// ---------------------------------------------------------------------------
object CrockfordBase32 {
    const val ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789"
}

// ---------------------------------------------------------------------------
// Device Identity
// ---------------------------------------------------------------------------
@Serializable
data class DeviceInfo(
    @SerialName("device_id") val deviceId: String,
    @SerialName("device_name") val deviceName: String,
    val pubkey: String // Ed25519 hex
)

@Serializable
data class TrustedDevice(
    @SerialName("device_id") val deviceId: String,
    @SerialName("device_name") val deviceName: String,
    val pubkey: String,
    @SerialName("pinned_at") val pinnedAt: Long,
    @SerialName("last_seen") val lastSeen: Long? = null,
    @SerialName("is_revoked") val isRevoked: Boolean = false
)

// ---------------------------------------------------------------------------
// Shared Folder
// ---------------------------------------------------------------------------
@Serializable
enum class AclMode {
    @SerialName("READ") READ,
    @SerialName("READWRITE") READWRITE
}

@Serializable
data class SharedFolder(
    val id: String,
    val path: String,
    val label: String,
    val acl: AclMode = AclMode.READ,
    val enabled: Boolean = true
)

// ---------------------------------------------------------------------------
// File Entry & Meta
// ---------------------------------------------------------------------------
@Serializable
enum class EntryType {
    @SerialName("file") FILE,
    @SerialName("dir") DIR
}

@Serializable
data class FileEntry(
    val name: String,
    @SerialName("entry_type") val entryType: EntryType,
    val size: Long,
    val mtime: Long,
    val hash: String? = null
)

@Serializable
data class FileMeta(
    val name: String,
    @SerialName("entry_type") val entryType: EntryType,
    val size: Long,
    val mtime: Long,
    val hash: String? = null,
    @SerialName("mime_type") val mimeType: String? = null
)

// ---------------------------------------------------------------------------
// FileProto Requests
// ---------------------------------------------------------------------------
@Serializable
data class ListRequest(
    val type: String = "list",
    val id: String,
    val path: String
)

@Serializable
data class StatRequest(
    val type: String = "stat",
    val id: String,
    val path: String
)

@Serializable
data class ReadRequest(
    val type: String = "read",
    val id: String,
    val path: String,
    val offset: Long,
    val len: Long
)

@Serializable
data class WriteRequest(
    val type: String = "write",
    val id: String,
    val path: String,
    val offset: Long,
    @SerialName("resume_id") val resumeId: String? = null
)

@Serializable
data class ThumbRequest(
    val type: String = "thumb",
    val id: String,
    val path: String
)

@Serializable
data class SyncManifestRequest(
    val type: String = "sync_manifest",
    val id: String,
    val root: String,
    val recursive: Boolean
)

// ---------------------------------------------------------------------------
// FileProto Responses
// ---------------------------------------------------------------------------
@Serializable
data class ListResponse(
    val type: String = "list_response",
    val id: String,
    val ok: Boolean = true,
    val entries: List<FileEntry>
)

@Serializable
data class StatResponse(
    val type: String = "stat_response",
    val id: String,
    val ok: Boolean = true,
    val meta: FileMeta
)

@Serializable
data class ReadResponse(
    val type: String = "read_response",
    val id: String,
    val ok: Boolean = true,
    val offset: Long,
    val len: Long
)

@Serializable
data class WriteAckResponse(
    val type: String = "write_ack",
    val id: String,
    val ok: Boolean = true,
    @SerialName("bytes_written") val bytesWritten: Long
)

@Serializable
data class SyncManifestEntry(
    val path: String,
    val size: Long,
    val mtime: Long,
    val sha256: String
)

@Serializable
data class SyncManifestResponse(
    val type: String = "sync_manifest_response",
    val id: String,
    val ok: Boolean = true,
    val entries: List<SyncManifestEntry>
)

@Serializable
data class ErrorResponse(
    val type: String = "error",
    val id: String,
    val ok: Boolean = false,
    val code: ErrorCode,
    val message: String? = null
)

@Serializable
enum class ErrorCode {
    NOT_FOUND, DENIED, CONFLICT, BUSY
}

// ---------------------------------------------------------------------------
// Signaling
// ---------------------------------------------------------------------------
@Serializable
enum class SignalingType {
    @SerialName("offer") OFFER,
    @SerialName("answer") ANSWER,
    @SerialName("ice") ICE,
    @SerialName("join") JOIN,
    @SerialName("leave") LEAVE,
    @SerialName("ping") PING,
    @SerialName("error") ERROR
}

@Serializable
data class SignalingMessage(
    val type: SignalingType,
    val payload: kotlinx.serialization.json.JsonElement? = null
)

@Serializable
data class SdpPayload(val sdp: String)

@Serializable
data class IcePayload(
    val candidate: String,
    @SerialName("sdpMid") val sdpMid: String? = null,
    @SerialName("sdpMLineIndex") val sdpMLineIndex: Int? = null
)

@Serializable
data class JoinPayload(val role: PeerRole)

@Serializable
enum class PeerRole {
    @SerialName("initiator") INITIATOR,
    @SerialName("joiner") JOINER
}

@Serializable
data class ErrorPayload(val code: String, val message: String)

// ---------------------------------------------------------------------------
// Pairing
// ---------------------------------------------------------------------------
@Serializable
data class PairingCommit(val commit: String)

@Serializable
data class PairingIdentity(
    @SerialName("device_id") val deviceId: String,
    @SerialName("device_name") val deviceName: String,
    val pubkey: String
)

// ---------------------------------------------------------------------------
// ICE / TURN
// ---------------------------------------------------------------------------
@Serializable
data class IceServer(
    val urls: List<String>,
    val username: String? = null,
    val credential: String? = null
)

@Serializable
data class TurnResponse(
    @SerialName("ice_servers") val iceServers: List<IceServer>
)

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------
@Serializable
enum class ConnectionType {
    @SerialName("lan") LAN,
    @SerialName("p2p") P2P,
    @SerialName("relay") RELAY,
    @SerialName("offline") OFFLINE
}

@Serializable
data class DiscoveredDevice(
    @SerialName("device_id") val deviceId: String,
    @SerialName("device_name") val deviceName: String,
    val pubkey: String,
    val address: String,
    @SerialName("connection_type") val connectionType: ConnectionType,
    @SerialName("signal_strength") val signalStrength: Int? = null
)
