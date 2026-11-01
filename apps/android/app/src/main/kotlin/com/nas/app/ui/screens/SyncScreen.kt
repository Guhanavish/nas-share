package com.nas.app.ui.screens

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nas.app.NasApplication
import com.nas.app.data.SharedFolderEntity
import com.nas.app.data.TrustedDeviceEntity
import com.nas.app.discovery.MdnsManager
import com.nas.app.sync.SyncEngine
import com.nas.app.ui.adaptive.bodySp
import com.nas.app.ui.adaptive.rememberUniversalPosture
import com.nas.app.ui.adaptive.titleSp
import com.nas.app.ui.adaptive.universalFocusable
import com.nas.protocol.DiscoveredDevice
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SyncScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val db = remember { NasApplication.instance.database }
    val trustedDevices by db.trustedDeviceDao().getAllTrusted().collectAsState(initial = emptyList())
    val sharedFolders by db.sharedFolderDao().getAll().collectAsState(initial = emptyList())

    val mdnsManager = remember { MdnsManager(context) }
    var discoveredDevices by remember { mutableStateOf<List<DiscoveredDevice>>(emptyList()) }
    val syncEngine = remember { SyncEngine(context) }

    var autoBackupEnabled by remember { mutableStateOf(true) }
    var isSyncing by remember { mutableStateOf(false) }
    var syncProgressMessage by remember { mutableStateOf<String?>(null) }
    var syncProgressFraction by remember { mutableStateOf<Float?>(null) }
    var lastSyncStatus by remember { mutableStateOf("All files up to date (Keep-both policy active)") }
    val posture = rememberUniversalPosture()

    LaunchedEffect(Unit) {
        mdnsManager.discoverServices().collectLatest { list ->
            discoveredDevices = list
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Folder Sync & Backup", fontWeight = FontWeight.Bold, fontSize = titleSp(posture.isTv).sp) }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = posture.horizontalPadding, vertical = posture.verticalPadding),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Automatic Background Backup", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text(
                                    "Periodically syncs new photos & documents to paired trusted devices",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                )
                            }
                            Switch(
                                checked = autoBackupEnabled,
                                onCheckedChange = { autoBackupEnabled = it },
                                modifier = Modifier.universalFocusable()
                            )
                        }

                        if (syncProgressMessage != null) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(syncProgressMessage ?: "", fontWeight = FontWeight.Medium, fontSize = 13.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            if (syncProgressFraction != null) {
                                LinearProgressIndicator(
                                    progress = { syncProgressFraction ?: 0f },
                                    modifier = Modifier.fillMaxWidth()
                                )
                            } else {
                                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = {
                                scope.launch {
                                    val peer = discoveredDevices.firstOrNull { disc ->
                                        trustedDevices.any { it.deviceId == disc.deviceId || it.pubkey == disc.pubkey }
                                    } ?: discoveredDevices.firstOrNull()

                                    if (peer == null) {
                                        Toast.makeText(context, "No peer device discovered on local network", Toast.LENGTH_LONG).show()
                                        return@launch
                                    }

                                    isSyncing = true
                                    syncProgressMessage = "Starting sync with ${peer.deviceName}..."
                                    val result = syncEngine.syncWithPeer(peer.address, peer.deviceName) { status, prog ->
                                        syncProgressMessage = status
                                        syncProgressFraction = prog
                                    }
                                    isSyncing = false
                                    syncProgressFraction = null
                                    syncProgressMessage = null

                                    if (result.error != null) {
                                        lastSyncStatus = "Sync failed: ${result.error}"
                                        Toast.makeText(context, "Sync error: ${result.error}", Toast.LENGTH_LONG).show()
                                    } else {
                                        lastSyncStatus = "Synced ${result.downloaded} down, ${result.uploaded} up • ${result.conflicts} conflicts"
                                        Toast.makeText(context, "Sync complete!", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            },
                            enabled = !isSyncing,
                            modifier = Modifier
                                .fillMaxWidth()
                                .universalFocusable()
                        ) {
                            if (isSyncing) {
                                CircularProgressIndicator(modifier = Modifier.size(18.dp), color = MaterialTheme.colorScheme.onPrimary)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Scanning & Syncing...")
                            } else {
                                Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Sync Now")
                            }
                        }
                    }
                }
            }

            item {
                Text(
                    text = "Active Sync Targets",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            if (trustedDevices.isEmpty()) {
                item {
                    Text(
                        text = "Pair with a PC or another phone to establish sync pairs.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
            } else {
                items(trustedDevices.size) { index ->
                    val device = trustedDevices[index]
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CloudSync, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(32.dp))
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(device.deviceName, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Text("Conflict Policy: Keep Both", fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                                Text("Status: $lastSyncStatus", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                            }
                        }
                    }
                }
            }
        }
    }
}
