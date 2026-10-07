package com.nas.app.server

import com.nas.app.NasApplication
import com.nas.app.data.SharedFolderEntity
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.File
import java.io.RandomAccessFile
import java.security.MessageDigest

@Serializable
data class DeviceInfoResponse(
    val device_id: String,
    val device_name: String,
    val version: String = "0.1.0"
)

@Serializable
data class FileEntryResponse(
    val name: String,
    val entry_type: String, // "file" or "dir"
    val size: Long,
    val mtime: Long,
    val hash: String? = null
)

@Serializable
data class ErrorJson(val ok: Boolean = false, val code: String, val message: String? = null)

class EmbeddedServer(private val port: Int = 8743) {

    private var server: ApplicationEngine? = null

    fun start() {
        server = embeddedServer(Netty, port = port, host = "0.0.0.0") {
            install(ContentNegotiation) {
                json(Json { ignoreUnknownKeys = true; encodeDefaults = true })
            }
            install(CORS) {
                anyHost()
                allowHeader(HttpHeaders.ContentType)
                allowMethod(HttpMethod.Get)
                allowMethod(HttpMethod.Post)
            }
            install(StatusPages) {
                exception<Throwable> { call, cause ->
                    call.respond(HttpStatusCode.InternalServerError,
                        ErrorJson(code = "BUSY", message = cause.message))
                }
            }
            configureRouting()
        }.start(wait = false)
    }

    fun stop() {
        server?.stop(1000, 2000)
        server = null
    }

    val isRunning: Boolean get() = server != null

    private fun Application.configureRouting() {
        routing {
            get("/api/info") {
                val prefs = NasApplication.instance.getSharedPreferences("nas_identity", 0)
                val deviceId = prefs.getString("device_id", "unknown") ?: "unknown"
                val deviceName = android.os.Build.MODEL
                call.respond(DeviceInfoResponse(deviceId, deviceName))
            }

            get("/api/list") {
                val path = call.request.queryParameters["path"] ?: "/"
                val resolved = resolveSafePath(path) ?: run {
                    call.respond(HttpStatusCode.Forbidden,
                        ErrorJson(code = "DENIED", message = "Path traversal blocked"))
                    return@get
                }

                if (!resolved.exists() || !resolved.isDirectory) {
                    call.respond(HttpStatusCode.NotFound,
                        ErrorJson(code = "NOT_FOUND", message = "Directory not found"))
                    return@get
                }

                val entries = withContext(Dispatchers.IO) {
                    resolved.listFiles()?.map { file ->
                        FileEntryResponse(
                            name = file.name,
                            entry_type = if (file.isDirectory) "dir" else "file",
                            size = if (file.isFile) file.length() else 0,
                            mtime = file.lastModified()
                        )
                    }?.sortedWith(compareBy<FileEntryResponse> { it.entry_type == "file" }.thenBy { it.name })
                        ?: emptyList()
                }

                call.respond(mapOf("ok" to true, "entries" to entries))
            }

            get("/api/stat") {
                val path = call.request.queryParameters["path"] ?: run {
                    call.respond(HttpStatusCode.BadRequest,
                        ErrorJson(code = "DENIED", message = "Missing path"))
                    return@get
                }
                val resolved = resolveSafePath(path) ?: run {
                    call.respond(HttpStatusCode.Forbidden,
                        ErrorJson(code = "DENIED", message = "Path traversal blocked"))
                    return@get
                }

                if (!resolved.exists()) {
                    call.respond(HttpStatusCode.NotFound,
                        ErrorJson(code = "NOT_FOUND", message = "Not found"))
                    return@get
                }

                call.respond(mapOf(
                    "ok" to true,
                    "meta" to FileEntryResponse(
                        name = resolved.name,
                        entry_type = if (resolved.isDirectory) "dir" else "file",
                        size = if (resolved.isFile) resolved.length() else 0,
                        mtime = resolved.lastModified()
                    )
                ))
            }

            get("/api/read") {
                val path = call.request.queryParameters["path"] ?: run {
                    call.respond(HttpStatusCode.BadRequest, ErrorJson(code = "DENIED", message = "Missing path"))
                    return@get
                }
                val offset = call.request.queryParameters["offset"]?.toLongOrNull() ?: 0L
                val len = call.request.queryParameters["len"]?.toLongOrNull() ?: -1L

                val resolved = resolveSafePath(path) ?: run {
                    call.respond(HttpStatusCode.Forbidden, ErrorJson(code = "DENIED", message = "Path traversal blocked"))
                    return@get
                }

                if (!resolved.exists() || !resolved.isFile) {
                    call.respond(HttpStatusCode.NotFound, ErrorJson(code = "NOT_FOUND", message = "File not found"))
                    return@get
                }

                val fileSize = resolved.length()
                val actualLen = if (len < 0) fileSize - offset else minOf(len, fileSize - offset)

                if (offset >= fileSize || actualLen <= 0) {
                    call.respond(HttpStatusCode.RequestedRangeNotSatisfiable)
                    return@get
                }

                call.response.header(HttpHeaders.ContentLength, actualLen.toString())
                call.response.header(HttpHeaders.AcceptRanges, "bytes")
                call.response.header(HttpHeaders.ContentRange, "bytes $offset-${offset + actualLen - 1}/$fileSize")

                val mimeType = when (resolved.extension.lowercase()) {
                    "jpg", "jpeg" -> ContentType.Image.JPEG
                    "png" -> ContentType.Image.PNG
                    "mp4" -> ContentType.Video.MP4
                    "mp3" -> ContentType.Audio.MPEG
                    "pdf" -> ContentType.Application.Pdf
                    "txt" -> ContentType.Text.Plain
                    "json" -> ContentType.Application.Json
                    else -> ContentType.Application.OctetStream
                }

                call.respondOutputStream(mimeType, if (offset > 0) HttpStatusCode.PartialContent else HttpStatusCode.OK) {
                    withContext(Dispatchers.IO) {
                        RandomAccessFile(resolved, "r").use { raf ->
                            raf.seek(offset)
                            val buffer = ByteArray(65536) // 64KB chunks
                            var remaining = actualLen
                            while (remaining > 0) {
                                val toRead = minOf(buffer.size.toLong(), remaining).toInt()
                                val read = raf.read(buffer, 0, toRead)
                                if (read <= 0) break
                                write(buffer, 0, read)
                                remaining -= read
                            }
                        }
                    }
                }
            }

            post("/api/write") {
                val path = call.request.queryParameters["path"] ?: run {
                    call.respond(HttpStatusCode.BadRequest, ErrorJson(code = "DENIED", message = "Missing path"))
                    return@post
                }
                val offset = call.request.queryParameters["offset"]?.toLongOrNull() ?: 0L

                val resolved = resolveSafePath(path, requireWrite = true) ?: run {
                    call.respond(HttpStatusCode.Forbidden, ErrorJson(code = "DENIED", message = "Write not allowed"))
                    return@post
                }

                resolved.parentFile?.mkdirs()

                val bytes = withContext(Dispatchers.IO) { call.receive<ByteArray>() }

                withContext(Dispatchers.IO) {
                    RandomAccessFile(resolved, "rw").use { raf ->
                        raf.seek(offset)
                        raf.write(bytes)
                    }
                }

                call.respond(mapOf(
                    "type" to "write_ack",
                    "ok" to true,
                    "bytes_written" to bytes.size
                ))
            }

            get("/api/thumb") {
                val path = call.request.queryParameters["path"] ?: run {
                    call.respond(HttpStatusCode.BadRequest, ErrorJson(code = "DENIED", message = "Missing path"))
                    return@get
                }

                val resolved = resolveSafePath(path) ?: run {
                    call.respond(HttpStatusCode.Forbidden, ErrorJson(code = "DENIED", message = "Path traversal blocked"))
                    return@get
                }

                if (!resolved.exists() || !resolved.isFile) {
                    call.respond(HttpStatusCode.NotFound, ErrorJson(code = "NOT_FOUND", message = "Not found"))
                    return@get
                }

                val thumbBytes = withContext(Dispatchers.IO) {
                    try {
                        val bitmap = android.media.ThumbnailUtils.extractThumbnail(
                            android.graphics.BitmapFactory.decodeFile(resolved.absolutePath),
                            200, 200
                        ) ?: return@withContext null

                        val stream = java.io.ByteArrayOutputStream()
                        bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 75, stream)
                        bitmap.recycle()
                        stream.toByteArray()
                    } catch (e: Exception) {
                        null
                    }
                }

                if (thumbBytes == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorJson(code = "NOT_FOUND", message = "Cannot generate thumbnail"))
                    return@get
                }

                call.respondBytes(thumbBytes, ContentType.Image.JPEG)
            }
        }
    }

    // =========================================================================
    // Path Traversal Guard
    // =========================================================================
    private suspend fun resolveSafePath(requestedPath: String, requireWrite: Boolean = false): File? {
        val sharedFolders = NasApplication.instance.database.sharedFolderDao().getEnabled()
        if (sharedFolders.isEmpty()) return null

        // Clean path: remove leading slash, normalize separators
        val cleaned = requestedPath.trimStart('/').replace('\\', '/')

        // Try to match against shared folders
        for (folder in sharedFolders) {
            val baseDir = File(folder.path)
            if (!baseDir.exists()) continue

            // Check write permission
            if (requireWrite && folder.acl != "READWRITE") continue

            val target = File(baseDir, cleaned).canonicalFile

            // Verify the resolved path is under the shared root
            if (target.absolutePath.startsWith(baseDir.canonicalPath)) {
                return target
            }
        }

        return null
    }
}
