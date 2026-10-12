package com.nas.app.ui.screens

import android.os.Environment
import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AudioFile
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.InsertDriveFile
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.VideoFile
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nas.app.NasApplication
import com.nas.app.discovery.MdnsManager
import com.nas.app.pool.PoolRepository
import com.nas.app.pool.PoolSection
import com.nas.app.pool.PooledEntry
import com.nas.app.protocol.FileProtoClient
import com.nas.app.remote.RemoteFileClient
import com.nas.app.remote.RemoteMesh
import com.nas.app.ui.adaptive.bodySp
import com.nas.app.ui.adaptive.rememberUniversalPosture
import com.nas.app.ui.adaptive.titleSp
import com.nas.app.ui.adaptive.universalFocusable
import com.nas.protocol.DiscoveredDevice
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.io.File

/**
 * Pool: one section listing files from every trusted device.
 * Rows are pointers — tap downloads source device -> this device.
 * Offline devices render greyed and are not tappable.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PoolScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val posture = rememberUniversalPosture()
    val dao = remember { NasApplication.instance.database.trustedDeviceDao() }
    val trusted by dao.getAllTrusted().collectAsState(initial = emptyList())
    var discovered by remember { mutableStateOf<List<DiscoveredDevice>>(emptyList()) }
    var sections by remember { mutableStateOf<List<PoolSection>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var query by remember { mutableStateOf("") }
    var progressMessage by remember { mutableStateOf<String?>(null) }
    var progressFraction by remember { mutableStateOf<Float?>(null) }

    val repository = remember { PoolRepository() }
    val client = remember { FileProtoClient() }
    val remoteClient = remember { RemoteFileClient() }

    LaunchedEffect(Unit) {
        MdnsManager(context).discoverServices().collectLatest { discovered = it }
    }

    fun refresh(latest: List<DiscoveredDevice>) {
        if (trusted.isEmpty()) {
            sections = emptyList()
            return
        }
        scope.launch {
            isLoading = true
            try {
                // Remote presence: trusted devices missing from LAN but
                // reporting to the Worker are served via relay.
                val remoteOnline = RemoteMesh.fetchOnline()
                sections = repository.loadPool(trusted, latest, remoteOnline)
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(trusted, discovered) { refresh(discovered) }

    fun download(entry: PooledEntry) {
        if (entry.isDirectory) {
            Toast.makeText(context, "Open the device to browse folders", Toast.LENGTH_SHORT).show()
            return
        }
        scope.launch {
            try {
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                val localFile = File(downloadsDir, entry.name)
                val via = if (entry.transport == "relay") "via relay" else "via LAN"
                progressMessage = "Downloading ${entry.name} from ${entry.deviceName} ($via)..."
                val onProgress = { downloaded: Long, total: Long ->
                    if (total > 0) {
                        progressFraction = downloaded.toFloat() / total.toFloat()
                        progressMessage = "Downloading: ${downloaded / 1024} KB / ${total / 1024} KB"
                    }
                }
                if (entry.transport == "relay") {
                    remoteClient.downloadFile(
                        deviceId = entry.deviceId,
                        remotePath = entry.path,
                        destinationFile = localFile,
                        onProgress = onProgress
                    )
                } else {
                    client.downloadFile(
                        peerAddress = entry.address,
                        remotePath = entry.path,
                        destinationFile = localFile,
                        onProgress = onProgress
                    )
                }
                Toast.makeText(context, "Saved ${localFile.name}", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(context, "Download failed: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressMessage = null
                progressFraction = null
            }
        }
    }

    val filtered = remember(sections, query) {
        if (query.isBlank()) sections
        else sections.map { s ->
            s.copy(entries = s.entries.filter { it.name.contains(query, ignoreCase = true) })
        }.filter { it.online && it.entries.isNotEmpty() || !it.online }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pool — All Devices", fontWeight = FontWeight.Bold, fontSize = titleSp(posture.isTv).sp) },
                actions = {
                    IconButton(
                        onClick = { refresh(discovered) },
                        modifier = Modifier.universalFocusable()
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh Pool")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                label = { Text("Search all devices") },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = posture.horizontalPadding, vertical = 8.dp)
                    .universalFocusable()
            )

            if (progressMessage != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = posture.horizontalPadding, vertical = 4.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(progressMessage ?: "", fontWeight = FontWeight.SemiBold, fontSize = bodySp(posture.isTv).sp)
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

            if (isLoading && sections.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (trusted.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        "Pair a device first — Pool shows here.",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                        fontSize = bodySp(posture.isTv).sp
                    )
                }
            } else if (posture.columns > 1) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(posture.columns),
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = posture.horizontalPadding),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    filtered.forEach { section ->
                        item(span = { GridItemSpan(posture.columns) }) {
                            PoolHeader(section = section, isTv = posture.isTv)
                        }
                        if (!section.online) {
                            item(span = { GridItemSpan(posture.columns) }) {
                                OfflineNote(isTv = posture.isTv)
                            }
                        } else if (section.entries.isEmpty()) {
                            item(span = { GridItemSpan(posture.columns) }) {
                                Text(
                                    "No files shared",
                                    fontSize = bodySp(posture.isTv).sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                )
                            }
                        } else {
                            items(section.entries, key = { "${section.deviceId}:${it.path}" }) { entry ->
                                PoolRow(entry = entry, isTv = posture.isTv, onClick = { download(entry) })
                            }
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    filtered.forEach { section ->
                        item {
                            PoolHeader(section = section, isTv = posture.isTv)
                        }
                        if (!section.online) {
                            item { OfflineNote(isTv = posture.isTv) }
                        } else if (section.entries.isEmpty()) {
                            item {
                                Text(
                                    "No files shared",
                                    fontSize = bodySp(posture.isTv).sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                )
                            }
                        } else {
                            items(section.entries, key = { "${section.deviceId}:${it.path}" }) { entry ->
                                PoolRow(entry = entry, isTv = posture.isTv, onClick = { download(entry) })
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PoolHeader(section: PoolSection, isTv: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 12.dp, bottom = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = section.deviceName,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            fontSize = titleSp(isTv).sp,
            color = if (section.online) MaterialTheme.colorScheme.primary
            else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
            modifier = Modifier
                .weight(1f)
                .alpha(if (section.online) 1f else 0.6f)
        )
        Badge(
            containerColor = if (section.online) MaterialTheme.colorScheme.primary
            else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f)
        ) {
            Text(
                if (!section.online) "Offline"
                else if (section.transport == "relay") "${section.entries.size} files • Relay"
                else "${section.entries.size} files • LAN",
                color = androidx.compose.ui.graphics.Color.White,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
            )
        }
    }
}

@Composable
private fun OfflineNote(isTv: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            Icons.Default.CloudOff,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            "Device offline — files unavailable",
            fontSize = bodySp(isTv).sp,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
        )
    }
}

@Composable
private fun PoolRow(entry: PooledEntry, isTv: Boolean, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier
            .fillMaxWidth()
            .universalFocusable(onDpadCenter = onClick)
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val icon = if (entry.isDirectory) {
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
                tint = if (entry.isDirectory) MaterialTheme.colorScheme.primary
                else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                modifier = Modifier.size(if (isTv) 40.dp else 32.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(entry.name, fontWeight = FontWeight.Medium, fontSize = titleSp(isTv).sp)
                Text(
                    "${formatBytes(entry.size)} • ${entry.deviceName}",
                    fontSize = bodySp(isTv).sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
            }
        }
    }
}
