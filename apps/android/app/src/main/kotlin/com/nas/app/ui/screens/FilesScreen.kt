package com.nas.app.ui.screens

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nas.app.protocol.FileProtoClient
import com.nas.protocol.EntryType
import com.nas.protocol.FileEntry
import kotlinx.coroutines.launch
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilesScreen(
    peerAddress: String,
    peerDeviceName: String,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val client = remember { FileProtoClient() }

    var currentPath by remember { mutableStateOf("/") }
    var entries by remember { mutableStateOf<List<FileEntry>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var isGridView by remember { mutableStateOf(false) }

    // Download/upload progress state
    var progressMessage by remember { mutableStateOf<String?>(null) }
    var progressFraction by remember { mutableStateOf<Float?>(null) }

    fun loadPath(path: String) {
        if (peerAddress.isBlank()) return
        scope.launch {
            isLoading = true
            try {
                entries = client.listFiles(peerAddress, path)
                currentPath = path
            } catch (e: Exception) {
                Toast.makeText(context, "Failed to load: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(peerAddress) {
        loadPath("/")
    }

    // Upload launcher using OpenDocument
    val uploadLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        if (uri != null) {
            scope.launch {
                try {
                    progressMessage = "Uploading file..."
                    // Copy to temp file to obtain length & seek
                    val contentResolver = context.contentResolver
                    val fileName = uri.lastPathSegment?.substringAfterLast("/") ?: "upload.bin"
                    val tempFile = File(context.cacheDir, fileName)
                    contentResolver.openInputStream(uri)?.use { input ->
                        tempFile.outputStream().use { output -> input.copyTo(output) }
                    }

                    val remoteTargetPath = if (currentPath == "/") fileName else "$currentPath/$fileName"
                    client.uploadFile(
                        peerAddress = peerAddress,
                        localFile = tempFile,
                        remotePath = remoteTargetPath,
                        onProgress = { uploaded, total ->
                            if (total > 0) {
                                progressFraction = uploaded.toFloat() / total.toFloat()
                                progressMessage = "Uploading: ${uploaded / 1024} KB / ${total / 1024} KB"
                            }
                        }
                    )
                    Toast.makeText(context, "Upload complete!", Toast.LENGTH_SHORT).show()
                    loadPath(currentPath)
                } catch (e: Exception) {
                    Toast.makeText(context, "Upload error: ${e.message}", Toast.LENGTH_SHORT).show()
                } finally {
                    progressMessage = null
                    progressFraction = null
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(peerDeviceName, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(currentPath, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    }
                },
                navigationIcon = {
                    IconButton(onClick = {
                        if (currentPath == "/" || currentPath.isEmpty()) {
                            onBack()
                        } else {
                            val parent = currentPath.substringBeforeLast("/", "").ifEmpty { "/" }
                            loadPath(parent)
                        }
                    }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { loadPath(currentPath) }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { uploadLauncher.launch(arrayOf("*/*")) },
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.Upload, contentDescription = "Upload File")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Transfer progress banner
            if (progressMessage != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(progressMessage ?: "", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        if (progressFraction != null) {
                            LinearProgressIndicator(
                                progress = { progressFraction ?: 0f },
                                modifier = Modifier.fillMaxWidth()
                            )
                        } else {
                            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                        }
                    }
                }
            }

            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (entries.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No files in this folder", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(entries) { entry ->
                        FileRowItem(
                            entry = entry,
                            onClick = {
                                if (entry.entryType == EntryType.DIR) {
                                    val nextPath = if (currentPath == "/") "/${entry.name}" else "$currentPath/${entry.name}"
                                    loadPath(nextPath)
                                } else {
                                    // Download file with resume
                                    scope.launch {
                                        try {
                                            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                                            val localFile = File(downloadsDir, entry.name)
                                            progressMessage = "Downloading ${entry.name}..."

                                            val remoteFilePath = if (currentPath == "/") entry.name else "$currentPath/${entry.name}"
                                            client.downloadFile(
                                                peerAddress = peerAddress,
                                                remotePath = remoteFilePath,
                                                destinationFile = localFile,
                                                onProgress = { downloaded, total ->
                                                    if (total > 0) {
                                                        progressFraction = downloaded.toFloat() / total.toFloat()
                                                        progressMessage = "Downloading: ${downloaded / 1024} KB / ${total / 1024} KB"
                                                    }
                                                }
                                            )
                                            Toast.makeText(context, "Downloaded to ${localFile.name}", Toast.LENGTH_SHORT).show()
                                        } catch (e: Exception) {
                                            Toast.makeText(context, "Download failed: ${e.message}", Toast.LENGTH_SHORT).show()
                                        } finally {
                                            progressMessage = null
                                            progressFraction = null
                                        }
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun FileRowItem(entry: FileEntry, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val icon = if (entry.entryType == EntryType.DIR) {
                Icons.Default.Folder
            } else when (entry.name.substringAfterLast(".", "").lowercase()) {
                "mp4", "mkv", "mov" -> Icons.Default.VideoFile
                "mp3", "flac", "wav" -> Icons.Default.AudioFile
                "jpg", "jpeg", "png" -> Icons.Default.Image
                else -> Icons.Default.InsertDriveFile
            }

            Icon(
                icon,
                contentDescription = null,
                tint = if (entry.entryType == EntryType.DIR) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                modifier = Modifier.size(32.dp)
            )

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(entry.name, fontWeight = FontWeight.Medium, fontSize = 15.sp)
                if (entry.entryType == EntryType.FILE) {
                    val sizeFormatted = formatBytes(entry.size)
                    Text(sizeFormatted, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                }
            }
        }
    }
}

fun formatBytes(bytes: Long): String {
    if (bytes < 1024) return "$bytes B"
    val kb = bytes / 1024.0
    if (kb < 1024) return "%.1f KB".format(kb)
    val mb = kb / 1024.0
    if (mb < 1024) return "%.1f MB".format(mb)
    val gb = mb / 1024.0
    return "%.1f GB".format(gb)
}
