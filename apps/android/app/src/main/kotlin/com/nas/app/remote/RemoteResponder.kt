package com.nas.app.remote

import android.util.Base64
import android.util.Log
import com.nas.app.NasApplication
import java.io.File
import java.io.RandomAccessFile

/**
 * Answers incoming relay fileproto requests using this device's enabled
 * shared folders. Same ACL + path-traversal guard semantics as the LAN
 * EmbeddedServer — only reshaped for the relay envelope.
 */
object RemoteResponder {

    private const val TAG = "RemoteResponder"
    const val CHUNK = 65536L

    fun attach() {
        RemoteMesh.onFileProtoRequest = { _, _, op -> handle(op) }
    }

    fun detach() {
        if (RemoteMesh.onFileProtoRequest != null) {
            RemoteMesh.onFileProtoRequest = null
        }
    }

    private suspend fun handle(op: FileProtoOp): FileProtoResp {
        return when (op.op) {
            "list" -> handleList(op.path)
            "read" -> handleRead(op.path, op.offset, op.len)
            else -> FileProtoResp(ok = false, error = "Unknown op: ${op.op}")
        }
    }

    private suspend fun handleList(path: String): FileProtoResp {
        return try {
            val resolved = resolveSafePath(path) ?: return FileProtoResp(ok = false, error = "DENIED")
            if (!resolved.exists() || !resolved.isDirectory) {
                return FileProtoResp(ok = false, error = "NOT_FOUND")
            }
            val entries = resolved.listFiles()
                ?.map { f ->
                    RelayFileEntry(
                        name = f.name,
                        entry_type = if (f.isDirectory) "dir" else "file",
                        size = if (f.isFile) f.length() else 0,
                        mtime = f.lastModified()
                    )
                }
                ?.sortedWith(compareBy<RelayFileEntry> { it.entry_type == "file" }.thenBy { it.name })
                ?: emptyList()
            FileProtoResp(ok = true, entries = entries)
        } catch (e: Exception) {
            Log.w(TAG, "list failed: ${e.message}")
            FileProtoResp(ok = false, error = "BUSY")
        }
    }

    private suspend fun handleRead(path: String, offset: Long, len: Long): FileProtoResp {
        return try {
            val resolved = resolveSafePath(path) ?: return FileProtoResp(ok = false, error = "DENIED")
            if (!resolved.exists() || !resolved.isFile) {
                return FileProtoResp(ok = false, error = "NOT_FOUND")
            }
            val total = resolved.length()
            if (offset >= total) return FileProtoResp(ok = false, error = "DENIED")
            val actual = minOf(if (len < 0) total - offset else len, total - offset)
            val buf = ByteArray(actual.coerceAtMost(CHUNK).toInt())
            val read = RandomAccessFile(resolved, "r").use { raf ->
                raf.seek(offset)
                raf.read(buf)
            }
            if (read <= 0) return FileProtoResp(ok = false, error = "BUSY")
            FileProtoResp(
                ok = true,
                data_b64 = Base64.encodeToString(buf, 0, read, Base64.NO_WRAP),
                total = total
            )
        } catch (e: Exception) {
            Log.w(TAG, "read failed: ${e.message}")
            FileProtoResp(ok = false, error = "BUSY")
        }
    }

    private suspend fun resolveSafePath(requestedPath: String, requireWrite: Boolean = false): File? {
        val folders = try {
            NasApplication.instance.database.sharedFolderDao().getEnabled()
        } catch (_: Exception) {
            return null
        }
        if (folders.isEmpty()) return null
        val cleaned = requestedPath.trimStart('/').replace('\\', '/')
        for (folder in folders) {
            if (requireWrite && folder.acl != "READWRITE") continue
            val baseDir = File(folder.path)
            if (!baseDir.exists()) continue
            val target = File(baseDir, cleaned).canonicalFile
            if (target.absolutePath.startsWith(baseDir.canonicalPath)) return target
        }
        return null
    }
}
