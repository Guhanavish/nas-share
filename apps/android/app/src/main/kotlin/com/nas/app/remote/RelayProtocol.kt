package com.nas.app.remote

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

// Outgoing relay envelope: forwarded by the Presence DO to the target socket.
@Serializable
data class RelaySend(
    val type: String = "send",
    val to: String,
    val msg_id: String,
    val kind: String = "fileproto",
    val payload: JsonElement? = null
)

// Incoming relay envelope from the Presence DO.
@Serializable
data class RelayRecv(
    val type: String = "recv",
    val from: String = "",
    val msg_id: String? = null,
    val kind: String = "generic",
    val payload: JsonElement? = null
)

// FileProto operation tunneled through the relay.
@Serializable
data class FileProtoOp(
    val op: String, // "list" | "read"
    val path: String = "/",
    val offset: Long = 0,
    val len: Long = 65536
)

// FileProto response tunneled back. Data is base64, max 64KB per round-trip.
@Serializable
data class FileProtoResp(
    val ok: Boolean = true,
    val entries: List<RelayFileEntry>? = null,
    val data_b64: String? = null,
    val total: Long = -1,
    val error: String? = null
)

@Serializable
data class RelayFileEntry(
    val name: String,
    val entry_type: String, // "file" | "dir"
    val size: Long,
    val mtime: Long
)
