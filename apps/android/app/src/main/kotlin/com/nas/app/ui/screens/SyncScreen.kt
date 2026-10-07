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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SyncScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val db = remember { NasApplication.instance.database }
    val trustedDevices by db.trustedDeviceDao().getAllTrusted().collectAsState(initial = emptyList())
    val sharedFolders by db.sharedFolderDao().getAll().collectAsState(initial = emptyList())

    var autoBackupEnabled by remember { mutableStateOf(true) }
    var isSyncing by remember { mutableStateOf(false) }
    var lastSyncStatus by remember { mutableStateOf("All files up to date (Keep-both policy active)") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Folder Sync & Backup", fontWeight = FontWeight.Bold) }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
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
                                onCheckedChange = { autoBackupEnabled = it }
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = {
                                scope.launch {
                                    isSyncing = true
                                    delay(2000) // Simulate delta scan & sync
                                    isSyncing = false
                                    lastSyncStatus = "Completed sync just now • 0 conflicts"
                                    Toast.makeText(context, "Sync complete!", Toast.LENGTH_SHORT).show()
                                }
                            },
                            enabled = !isSyncing && trustedDevices.isNotEmpty(),
                            modifier = Modifier.fillMaxWidth()
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
