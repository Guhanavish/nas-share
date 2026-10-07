package com.nas.app.protocol

import com.nas.protocol.FileEntry
import com.nas.protocol.FileMeta
import com.nas.protocol.ListResponse
import com.nas.protocol.StatResponse
import com.nas.protocol.SyncManifestEntry
import com.nas.protocol.SyncManifestResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import java.util.concurrent.TimeUnit

class FileProtoClient {

    private val json = Json { ignoreUnknownKeys = true }
    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    suspend fun listFiles(peerAddress: String, path: String): List<FileEntry> = withContext(Dispatchers.IO) {
        val url = "http://$peerAddress/api/list?path=${java.net.URLEncoder.encode(path, "UTF-8")}"
        val request = Request.Builder().url(url).build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) throw Exception("Failed to list files: ${response.code}")
            val bodyString = response.body?.string() ?: throw Exception("Empty response")
            val listResp = json.decodeFromString<ListResponse>(bodyString)
            listResp.entries
        }
    }

    suspend fun statFile(peerAddress: String, path: String): FileMeta = withContext(Dispatchers.IO) {
        val url = "http://$peerAddress/api/stat?path=${java.net.URLEncoder.encode(path, "UTF-8")}"
        val request = Request.Builder().url(url).build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) throw Exception("Failed to stat file: ${response.code}")
            val bodyString = response.body?.string() ?: throw Exception("Empty response")
            val statResp = json.decodeFromString<StatResponse>(bodyString)
            statResp.meta
        }
    }

    suspend fun downloadFile(
        peerAddress: String,
        remotePath: String,
        destinationFile: File,
        offset: Long = 0,
        onProgress: (bytesDownloaded: Long, totalBytes: Long) -> Unit = { _, _ -> }
    ) = withContext(Dispatchers.IO) {
        val url = "http://$peerAddress/api/read?path=${java.net.URLEncoder.encode(remotePath, "UTF-8")}&offset=$offset"
        val request = Request.Builder()
            .url(url)
            .addHeader("Range", "bytes=$offset-")
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful && response.code != 206) {
                throw Exception("Failed to download: HTTP ${response.code}")
            }

            val responseBody = response.body ?: throw Exception("Missing body")
            val contentLength = responseBody.contentLength()
            val totalBytes = if (contentLength > 0) offset + contentLength else -1L

            destinationFile.parentFile?.mkdirs()
            RandomAccessFile(destinationFile, "rw").use { raf ->
                raf.seek(offset)
                val buffer = ByteArray(64 * 1024) // 64KB chunk
                val inputStream = responseBody.byteStream()
                var bytesRead: Int
                var downloaded = offset

                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                    raf.write(buffer, 0, bytesRead)
                    downloaded += bytesRead
                    onProgress(downloaded, totalBytes)
                }
            }
        }
    }

    suspend fun uploadFile(
        peerAddress: String,
        localFile: File,
        remotePath: String,
        offset: Long = 0,
        onProgress: (bytesUploaded: Long, totalBytes: Long) -> Unit = { _, _ -> }
    ) = withContext(Dispatchers.IO) {
        val totalBytes = localFile.length()
        val chunkSize = 64 * 1024 // 64KB chunks for smooth progress and resume
        var currentOffset = offset

        RandomAccessFile(localFile, "r").use { raf ->
            val buffer = ByteArray(chunkSize)
            raf.seek(currentOffset)

            while (currentOffset < totalBytes) {
                val toRead = minOf(chunkSize.toLong(), totalBytes - currentOffset).toInt()
                val read = raf.read(buffer, 0, toRead)
                if (read <= 0) break

                val chunk = buffer.copyOf(read)
                val url = "http://$peerAddress/api/write?path=${java.net.URLEncoder.encode(remotePath, "UTF-8")}&offset=$currentOffset"
                val body = chunk.toRequestBody("application/octet-stream".toMediaType())
                val request = Request.Builder().url(url).post(body).build()

                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        throw Exception("Failed to upload chunk at offset $currentOffset: ${response.code}")
                    }
                }

                currentOffset += read
                onProgress(currentOffset, totalBytes)
            }
        }
    }

    fun getStreamUrl(peerAddress: String, path: String): String {
        return "http://$peerAddress/api/read?path=${java.net.URLEncoder.encode(path, "UTF-8")}"
    }

    fun getThumbnailUrl(peerAddress: String, path: String): String {
        return "http://$peerAddress/api/thumb?path=${java.net.URLEncoder.encode(path, "UTF-8")}"
    }
}
