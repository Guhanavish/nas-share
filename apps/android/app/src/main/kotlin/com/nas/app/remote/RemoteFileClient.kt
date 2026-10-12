package com.nas.app.remote

import android.util.Base64
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.io.RandomAccessFile

/**
 * FileProto over the relay: list + chunked download from a remote trusted
 * device (no LAN needed). Mirrors FileProtoClient's surface so Pool can
 * swap transports per device.
 */
class RemoteFileClient {

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun listFiles(deviceId: String, path: String): List<RelayFileEntry> {
        val op = FileProtoOp(op = "list", path = path)
        val recv = RemoteMesh.send(
            to = deviceId,
            kind = "fileproto",
            payload = json.parseToJsonElement(json.encodeToString(op))
        )
        val resp = recv.payload?.let { json.decodeFromJsonElement(FileProtoResp.serializer(), it) }
            ?: throw Exception("Empty relay response")
        if (!resp.ok) throw Exception(resp.error ?: "Remote list failed")
        return resp.entries ?: emptyList()
    }

    suspend fun downloadFile(
        deviceId: String,
        remotePath: String,
        destinationFile: File,
        offset: Long = 0,
        onProgress: (bytesDownloaded: Long, totalBytes: Long) -> Unit = { _, _ -> }
    ) = withContext(Dispatchers.IO) {
        destinationFile.parentFile?.mkdirs()
        var cursor = offset
        var total = -1L
        RandomAccessFile(destinationFile, "rw").use { raf ->
            raf.seek(cursor)
            while (true) {
                val op = FileProtoOp(op = "read", path = remotePath, offset = cursor, len = RemoteResponder.CHUNK)
                val recv = RemoteMesh.send(
                    to = deviceId,
                    kind = "fileproto",
                    payload = json.parseToJsonElement(json.encodeToString(op)),
                    timeoutMs = 45_000L
                )
                val resp = recv.payload?.let { json.decodeFromJsonElement(FileProtoResp.serializer(), it) }
                    ?: throw Exception("Empty relay response")
                if (!resp.ok) throw Exception(resp.error ?: "Remote read failed")
                total = resp.total
                val bytes = resp.data_b64?.let { Base64.decode(it, Base64.DEFAULT) }
                    ?: throw Exception("Missing chunk data")
                raf.write(bytes)
                cursor += bytes.size
                onProgress(cursor, total)
                if (total < 0 || cursor >= total) break
            }
        }
    }
}
