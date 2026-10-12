package com.nas.app.pool

/**
 * One file from any device, presented in the Pool.
 * `deviceId` + `path` is the internal address of where the file lives.
 * Files are never copied into the Pool — rows are pointers to the source.
 */
data class PooledEntry(
    val deviceId: String,
    val deviceName: String,
    val address: String,
    val path: String,
    val name: String,
    val size: Long,
    val mtime: Long,
    val isDirectory: Boolean,
    /** "lan" or "relay" — tells the UI which transport serves this row. */
    val transport: String = "lan"
)

/**
 * One device's slice of the Pool. Offline devices come back with
 * `online = false` and empty entries so the UI can render them greyed.
 */
data class PoolSection(
    val deviceId: String,
    val deviceName: String,
    val online: Boolean,
    val address: String,
    val entries: List<PooledEntry>,
    val error: String? = null,
    /** "lan" or "relay" — badge shown on the section header. */
    val transport: String = "lan"
)
