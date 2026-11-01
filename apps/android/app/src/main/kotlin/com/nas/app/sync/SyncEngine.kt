package com.nas.app.sync

import android.content.Context
import android.util.Log
import com.nas.app.NasApplication
import com.nas.app.data.SharedFolderEntity
import com.nas.app.protocol.FileProtoClient
import com.nas.protocol.SyncManifestEntry
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.security.MessageDigest

data class SyncResult(
    val downloaded: Int = 0,
    val uploaded: Int = 0,
    val conflicts: Int = 0,
    val totalBytes: Long = 0,
    val error: String? = null
)

class SyncEngine(private val context: Context) {

    private val client = FileProtoClient()

    suspend fun syncWithPeer(
        peerAddress: String,
        peerDeviceName: String,
        onProgress: (status: String, progress: Float) -> Unit = { _, _ -> }
    ): SyncResult = withContext(Dispatchers.IO) {
        var downloaded = 0
        var uploaded = 0
        var conflicts = 0
        var totalBytes = 0L

        try {
            onProgress("Scanning local shared folders...", 0.1f)
            val db = NasApplication.instance.database
            val sharedFolders = db.sharedFolderDao().getEnabled()
            if (sharedFolders.isEmpty()) {
                return@withContext SyncResult(error = "No shared folders configured locally")
            }

            // Build local manifest
            val localManifest = mutableMapOf<String, LocalSyncFile>()
            for (folder in sharedFolders) {
                val baseDir = File(folder.path)
                if (!baseDir.exists() || !baseDir.isDirectory) continue
                scanLocalDirectory(folder.label, baseDir, baseDir, folder.acl == "READWRITE", localManifest)
            }

            onProgress("Fetching remote manifest from $peerDeviceName...", 0.25f)
            val remoteEntries = try {
                client.getSyncManifest(peerAddress, "/")
            } catch (e: Exception) {
                return@withContext SyncResult(error = "Failed to fetch remote manifest: ${e.message}")
            }
            val remoteManifest = remoteEntries.associateBy { it.path }

            val allPaths = (localManifest.keys + remoteManifest.keys).toList()
            val totalSteps = allPaths.size.coerceAtLeast(1)
            var currentStep = 0

            for (path in allPaths) {
                currentStep++
                val progressVal = 0.25f + 0.7f * (currentStep.toFloat() / totalSteps.toFloat())
                val local = localManifest[path]
                val remote = remoteManifest[path]

                if (local == null && remote != null) {
                    // Case 1: Remote only -> Download
                    onProgress("Downloading ${remote.path}...", progressVal)
                    val targetFile = resolveLocalDestination(path, sharedFolders)
                    if (targetFile != null) {
                        try {
                            client.downloadFile(peerAddress, remote.path, targetFile)
                            downloaded++
                            totalBytes += remote.size
                        } catch (e: Exception) {
                            Log.e("SyncEngine", "Download failed for ${remote.path}", e)
                        }
                    }
                } else if (local != null && remote == null) {
                    // Case 2: Local only -> Upload
                    onProgress("Uploading ${local.relPath}...", progressVal)
                    try {
                        client.uploadFile(peerAddress, local.file, local.relPath)
                        uploaded++
                        totalBytes += local.file.length()
                    } catch (e: Exception) {
                        Log.e("SyncEngine", "Upload failed for ${local.relPath}", e)
                    }
                } else if (local != null && remote != null) {
                    // Case 3: Both exist
                    if (local.sha256.equals(remote.sha256, ignoreCase = true)) {
                        // Identical -> Up to date
                        continue
                    }

                    // Divergent content! Keep-Both Policy
                    conflicts++
                    if (remote.mtime > local.file.lastModified()) {
                        // Remote is newer: preserve local with conflict suffix, then download remote
                        val conflictFile = makeConflictFile(local.file, "local")
                        local.file.renameTo(conflictFile)
                        try {
                            client.downloadFile(peerAddress, remote.path, local.file)
                            downloaded++
                            totalBytes += remote.size
                        } catch (e: Exception) {
                            Log.e("SyncEngine", "Conflict download failed for ${remote.path}", e)
                        }
                    } else {
                        // Local is newer: upload local to remote
                        try {
                            client.uploadFile(peerAddress, local.file, local.relPath)
                            uploaded++
                            totalBytes += local.file.length()
                        } catch (e: Exception) {
                            Log.e("SyncEngine", "Conflict upload failed for ${local.relPath}", e)
                        }
                    }
                }
            }

            onProgress("Sync complete!", 1.0f)
            SyncResult(downloaded = downloaded, uploaded = uploaded, conflicts = conflicts, totalBytes = totalBytes)
        } catch (e: Exception) {
            Log.e("SyncEngine", "Sync error", e)
            SyncResult(error = e.message)
        }
    }

    private val ignoredDirs = setOf(
        ".git", "node_modules", "build", "target", ".gradle", ".idea", ".vscode",
        "dist", "__pycache__", ".cache", ".thumbnails", ".Trash", "\$RECYCLE.BIN", ".vercel"
    )
    private val ignoredFiles = setOf(".DS_Store", "Thumbs.db", "desktop.ini")

    private fun isIgnoredDir(name: String): Boolean = ignoredDirs.contains(name.lowercase())
    private fun isIgnoredFile(name: String): Boolean =
        ignoredFiles.contains(name.lowercase()) || name.endsWith(".tmp", true) || name.endsWith(".part", true)

    private fun scanLocalDirectory(
        folderLabel: String,
        baseDir: File,
        dir: File,
        isWritable: Boolean,
        manifest: MutableMap<String, LocalSyncFile>
    ) {
        val files = dir.listFiles() ?: return
        for (file in files) {
            val fileName = file.name
            if (file.isDirectory) {
                if (isIgnoredDir(fileName)) continue
                scanLocalDirectory(folderLabel, baseDir, file, isWritable, manifest)
            } else if (file.isFile) {
                if (isIgnoredFile(fileName)) continue
                val relFromBase = file.relativeTo(baseDir).path.replace('\\', '/')
                val virtualPath = "$folderLabel/$relFromBase"
                val hash = calculateSha256(file)
                manifest[virtualPath] = LocalSyncFile(
                    relPath = virtualPath,
                    file = file,
                    sha256 = hash,
                    isWritable = isWritable
                )
            }
        }
    }

    private fun resolveLocalDestination(virtualPath: String, sharedFolders: List<SharedFolderEntity>): File? {
        val top = virtualPath.substringBefore('/')
        val sub = if (virtualPath.contains('/')) virtualPath.substringAfter('/') else virtualPath
        val matched = sharedFolders.firstOrNull { it.label.equals(top, ignoreCase = true) }
            ?: sharedFolders.firstOrNull { it.acl == "READWRITE" }
            ?: sharedFolders.firstOrNull()
            ?: return null

        val baseDir = File(matched.path)
        val target = File(baseDir, sub)
        target.parentFile?.mkdirs()
        return target
    }

    private fun makeConflictFile(file: File, tag: String): File {
        val parent = file.parentFile
        val nameWithoutExt = file.nameWithoutExtension
        val ext = file.extension
        val ts = System.currentTimeMillis() % 100000
        val newName = if (ext.isNotEmpty()) "$nameWithoutExt ($tag conflict $ts).$ext" else "$nameWithoutExt ($tag conflict $ts)"
        return File(parent, newName)
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
}

data class LocalSyncFile(
    val relPath: String,
    val file: File,
    val sha256: String,
    val isWritable: Boolean
)
