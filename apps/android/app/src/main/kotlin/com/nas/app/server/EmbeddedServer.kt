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
data class SyncManifestItem(
    val path: String,
    val size: Long,
    val mtime: Long,
    val sha256: String
)

@Serializable
data class ListResponse(val ok: Boolean = true, val entries: List<FileEntryResponse>)

@Serializable
data class StatResponse(val ok: Boolean = true, val meta: FileEntryResponse)

@Serializable
data class WriteAckResponse(val type: String = "write_ack", val ok: Boolean = true, val bytes_written: Int)

@Serializable
data class SyncManifestResponse(val ok: Boolean = true, val entries: List<SyncManifestItem>)

@Serializable
data class ErrorJson(val ok: Boolean = false, val code: String, val message: String? = null)

@Serializable
data class DirectPairRequest(
    val code: String,
    val device_id: String,
    val device_name: String,
    val pubkey: String
)

@Serializable
data class DirectPairResponse(
    val ok: Boolean = true,
    val device_id: String,
    val device_name: String,
    val pubkey: String
)

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

    private val ignoredDirs = setOf(
        ".git", "node_modules", "build", "target", ".gradle", ".idea", ".vscode",
        "dist", "__pycache__", ".cache", ".thumbnails", ".Trash", "\$RECYCLE.BIN", ".vercel"
    )
    private val ignoredFiles = setOf(".DS_Store", "Thumbs.db", "desktop.ini")

    private fun isIgnoredDir(name: String): Boolean = ignoredDirs.contains(name.lowercase())
    private fun isIgnoredFile(name: String): Boolean =
        ignoredFiles.contains(name.lowercase()) || name.endsWith(".tmp", true) || name.endsWith(".part", true)

    private fun Application.configureRouting() {
        routing {
            post("/api/pair") {
                val req = call.receive<DirectPairRequest>()
                val dao = NasApplication.instance.database.trustedDeviceDao()
                val now = System.currentTimeMillis()
                dao.insert(
                    com.nas.app.data.TrustedDeviceEntity(
                        deviceId = req.device_id,
                        deviceName = req.device_name,
                        pubkey = req.pubkey,
                        pinnedAt = now,
                        lastSeen = now,
                        isRevoked = false
                    )
                )
                val prefs = NasApplication.instance.getSharedPreferences("nas_identity", 0)
                val myId = prefs.getString("device_id", "unknown") ?: "unknown"
                val myPubkey = prefs.getString("pubkey", "") ?: ""
                val myName = android.os.Build.MODEL
                call.respond(
                    DirectPairResponse(
                        ok = true,
                        device_id = myId,
                        device_name = myName,
                        pubkey = myPubkey
                    )
                )
            }

            get("/api/info") {
                val prefs = NasApplication.instance.getSharedPreferences("nas_identity", 0)
                val deviceId = prefs.getString("device_id", "unknown") ?: "unknown"
                val deviceName = android.os.Build.MODEL
                call.respond(DeviceInfoResponse(deviceId, deviceName))
            }

            get("/api/list") {
                val path = call.request.queryParameters["path"] ?: "/"
                val sharedFolders = NasApplication.instance.database.sharedFolderDao().getEnabled()

                val cleaned = path.trimStart('/').replace('\\', '/')
                if (cleaned.isEmpty() || path == "/") {
                    // Return virtual root entries (the shared folders)
                    val entries = sharedFolders.map { folder ->
                        val folderFile = File(folder.path)
                        FileEntryResponse(
                            name = folder.label,
                            entry_type = "dir",
                            size = 0,
                            mtime = if (folderFile.exists()) folderFile.lastModified() else System.currentTimeMillis()
                        )
                    }
                    call.respond(ListResponse(ok = true, entries = entries))
                    return@get
                }

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

                call.respond(ListResponse(ok = true, entries = entries))
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

                call.respond(StatResponse(
                    ok = true,
                    meta = FileEntryResponse(
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

                call.respond(WriteAckResponse(
                    bytes_written = bytes.size
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

            get("/api/sync_manifest") {
                val path = call.request.queryParameters["path"] ?: "/"
                val sharedFolders = NasApplication.instance.database.sharedFolderDao().getEnabled()

                val entries = withContext(Dispatchers.IO) {
                    val result = mutableListOf<SyncManifestItem>()
                    val cleaned = path.trimStart('/').replace('\\', '/')

                    val targetDirs = mutableListOf<Pair<String, File>>() // (virtualPrefix, physicalDir)

                    if (cleaned.isEmpty() || path == "/") {
                        for (f in sharedFolders) {
                            val dir = File(f.path)
                            if (dir.exists() && dir.isDirectory) {
                                targetDirs.add(f.label to dir)
                            }
                        }
                    } else {
                        val resolved = resolveSafePath(path)
                        if (resolved != null && resolved.exists() && resolved.isDirectory) {
                            targetDirs.add(cleaned to resolved)
                        }
                    }

                    fun scanDir(prefix: String, dir: File) {
                        val files = dir.listFiles() ?: return
                        for (file in files) {
                            val fileName = file.name
                            if (file.isDirectory) {
                                if (isIgnoredDir(fileName)) continue
                                val relPath = if (prefix.isEmpty()) fileName else "$prefix/$fileName"
                                scanDir(relPath, file)
                            } else if (file.isFile) {
                                if (isIgnoredFile(fileName)) continue
                                val relPath = if (prefix.isEmpty()) fileName else "$prefix/$fileName"
                                try {
                                    val hash = calculateSha256(file)
                                    result.add(
                                        SyncManifestItem(
                                            path = relPath,
                                            size = file.length(),
                                            mtime = file.lastModified(),
                                            sha256 = hash
                                        )
                                    )
                                } catch (e: Exception) {
                                    // Skip unreadable files
                                }
                            }
                        }
                    }

                    for ((pfx, dir) in targetDirs) {
                        scanDir(pfx, dir)
                    }

                    result
                }

                call.respond(SyncManifestResponse(ok = true, entries = entries))
            }
        }
    }

    private fun calculateSha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().use { input ->
            val buffer = ByteArray(65536)
            var bytesRead: Int
            while (input.read(buffer).also { bytesRead = it } != -1) {
                digest.update(buffer, 0, bytesRead)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    // =========================================================================
    // Path Traversal Guard
    // =========================================================================
    private suspend fun resolveSafePath(requestedPath: String, requireWrite: Boolean = false): File? {
        val sharedFolders = NasApplication.instance.database.sharedFolderDao().getEnabled()
        if (sharedFolders.isEmpty()) return null

        val cleaned = requestedPath.trimStart('/').replace('\\', '/')
        if (cleaned.isEmpty()) {
            return null
        }

        val topSegment = cleaned.substringBefore('/')
        val subPath = if (cleaned.contains('/')) cleaned.substringAfter('/') else ""

        // 1. Try matching topSegment with folder.label
        for (folder in sharedFolders) {
            if (folder.label.equals(topSegment, ignoreCase = true)) {
                if (requireWrite && folder.acl != "READWRITE") return null
                val baseDir = File(folder.path).canonicalFile
                val target = if (subPath.isEmpty()) baseDir else File(baseDir, subPath).canonicalFile
                if (target.absolutePath.startsWith(baseDir.absolutePath)) {
                    return target
                }
            }
        }

        // 2. Fallback: try matching directly relative to each shared folder
        for (folder in sharedFolders) {
            if (requireWrite && folder.acl != "READWRITE") continue
            val baseDir = File(folder.path).canonicalFile
            val target = File(baseDir, cleaned).canonicalFile
            if (target.absolutePath.startsWith(baseDir.absolutePath)) {
                return target
            }
        }

        // 3. Fallback for write: if single filename with no subfolder, write into first READWRITE folder
        if (requireWrite && !cleaned.contains('/')) {
            val defaultFolder = sharedFolders.firstOrNull { it.acl == "READWRITE" }
            if (defaultFolder != null) {
                val baseDir = File(defaultFolder.path).canonicalFile
                val target = File(baseDir, cleaned).canonicalFile
                if (target.absolutePath.startsWith(baseDir.absolutePath)) {
                    return target
                }
            }
        }

        return null
    }
}
