package com.nas.app.pool

import com.nas.app.data.TrustedDeviceEntity
import com.nas.app.protocol.FileProtoClient
import com.nas.app.remote.RemoteFileClient
import com.nas.protocol.DiscoveredDevice
import com.nas.protocol.EntryType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.supervisorScope
import kotlinx.coroutines.withContext

/**
 * Builds the unified Pool: one live `list("/")` per online trusted device,
 * merged into per-device sections. Offline devices (trusted but not on LAN)
 * return `online = false` with no entries so the UI renders them greyed.
 *
 * Download is deliberately NOT here — PoolScreen calls
 * `FileProtoClient.downloadFile(address, remotePath, destFile)` directly,
 * so bytes always flow source device -> current device over the existing
 * LAN / WebRTC transport. The Worker never sees file bytes.
 */
class PoolRepository(
    private val client: FileProtoClient = FileProtoClient(),
    private val remote: RemoteFileClient = RemoteFileClient()
) {
    /**
     * @param remoteOnline device ids reporting presence to the Worker.
     * Trusted devices missing from LAN but present here are served via relay.
     */
    suspend fun loadPool(
        trusted: List<TrustedDeviceEntity>,
        discovered: List<DiscoveredDevice>,
        remoteOnline: Set<String> = emptySet()
    ): List<PoolSection> = withContext(Dispatchers.IO) {
        supervisorScope {
            val byId = discovered.associateBy { it.deviceId }
            trusted.map { device ->
                async {
                    val found = byId[device.deviceId]
                    if (found != null) {
                        loadLan(device, found.address)
                    } else if (remoteOnline.contains(device.deviceId)) {
                        loadRelay(device)
                    } else {
                        PoolSection(
                            deviceId = device.deviceId,
                            deviceName = device.deviceName,
                            online = false,
                            address = "",
                            entries = emptyList()
                        )
                    }
                }
            }.awaitAll()
        }
    }

    private suspend fun loadLan(
        device: TrustedDeviceEntity,
        address: String
    ): PoolSection {
        return try {
            val files = client.listFiles(address, "/")
            PoolSection(
                deviceId = device.deviceId,
                deviceName = device.deviceName,
                online = true,
                address = address,
                transport = "lan",
                entries = files.map { entry ->
                    PooledEntry(
                        deviceId = device.deviceId,
                        deviceName = device.deviceName,
                        address = address,
                        path = "/${entry.name}",
                        name = entry.name,
                        size = entry.size,
                        mtime = entry.mtime,
                        isDirectory = entry.entryType == EntryType.DIR,
                        transport = "lan"
                    )
                }
            )
        } catch (e: Exception) {
            PoolSection(
                deviceId = device.deviceId,
                deviceName = device.deviceName,
                online = false,
                address = address,
                entries = emptyList(),
                error = e.message
            )
        }
    }

    private suspend fun loadRelay(device: TrustedDeviceEntity): PoolSection {
        return try {
            val files = remote.listFiles(device.deviceId, "/")
            PoolSection(
                deviceId = device.deviceId,
                deviceName = device.deviceName,
                online = true,
                address = "relay",
                transport = "relay",
                entries = files.map { entry ->
                    PooledEntry(
                        deviceId = device.deviceId,
                        deviceName = device.deviceName,
                        address = "relay",
                        path = "/${entry.name}",
                        name = entry.name,
                        size = entry.size,
                        mtime = entry.mtime,
                        isDirectory = entry.entry_type == "dir",
                        transport = "relay"
                    )
                }
            )
        } catch (e: Exception) {
            PoolSection(
                deviceId = device.deviceId,
                deviceName = device.deviceName,
                online = false,
                address = "",
                entries = emptyList(),
                error = e.message
            )
        }
    }
}
