package com.nas.app.ui.screens

import android.net.Uri
import android.os.Environment
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.QrCode
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
import com.nas.app.service.NasService
import kotlinx.coroutines.launch
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShareScreen(
    onOpenPairingWithCode: (String) -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val dao = remember { NasApplication.instance.database.sharedFolderDao() }
    val sharedFolders by dao.getAll().collectAsState(initial = emptyList())

    // Folder picker launcher using OpenDocumentTree
    val folderPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocumentTree()
    ) { uri: Uri? ->
        if (uri != null) {
            val rawPath = uri.path ?: uri.toString()
            // Extract local filesystem path or default to external files
            val label = rawPath.substringAfterLast(":").ifEmpty { "Shared Folder" }
            val absolutePath = "/storage/emulated/0/$label".ifEmpty {
                context.getExternalFilesDir(null)?.absolutePath ?: "/sdcard"
            }

            scope.launch {
                dao.insert(
                    SharedFolderEntity(
                        id = UUID.randomUUID().toString(),
                        path = absolutePath,
                        label = label,
                        acl = "READWRITE",
                        enabled = true
                    )
                )
                // Ensure service is running
                NasService.start(context)
                Toast.makeText(context, "Added $label to shares", Toast.LENGTH_SHORT).show()
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Shared Folders", fontWeight = FontWeight.Bold) },
                actions = {
                    Button(
                        onClick = {
                            val code = com.nas.app.pairing.PairingManager(context).generateCode()
                            onOpenPairingWithCode(code)
                        },
                        modifier = Modifier.padding(end = 8.dp)
                    ) {
                        Icon(Icons.Default.QrCode, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Pair Device")
                    }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { folderPicker.launch(null) },
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("Share Folder") }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            // Quick default share shortcut if empty
            if (sharedFolders.isEmpty()) {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("No folders shared yet", fontWeight = FontWeight.Bold)
                        Text(
                            "Share a folder so other devices on your WiFi or remote devices can browse and download files.",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            modifier = Modifier.padding(vertical = 6.dp)
                        )
                        Button(
                            onClick = {
                                scope.launch {
                                    val downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).absolutePath
                                    dao.insert(
                                        SharedFolderEntity(
                                            id = UUID.randomUUID().toString(),
                                            path = downloads,
                                            label = "Downloads",
                                            acl = "READWRITE",
                                            enabled = true
                                        )
                                    )
                                    NasService.start(context)
                                }
                            }
                        ) {
                            Text("Share Downloads Folder")
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(sharedFolders) { folder ->
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
                                Icon(
                                    Icons.Default.Folder,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(32.dp)
                                )
                                Spacer(modifier = Modifier.width(16.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(folder.label, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Text(folder.path, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                                    Text("ACL: ${folder.acl}", fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                                }
                                Switch(
                                    checked = folder.enabled,
                                    onCheckedChange = { checked ->
                                        scope.launch { dao.setEnabled(folder.id, checked) }
                                    }
                                )
                                IconButton(
                                    onClick = { scope.launch { dao.delete(folder) } }
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
