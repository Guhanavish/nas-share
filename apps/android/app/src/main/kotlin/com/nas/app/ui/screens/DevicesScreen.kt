package com.nas.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nas.app.NasApplication
import com.nas.app.data.TrustedDeviceEntity
import com.nas.app.discovery.MdnsManager
import com.nas.app.ui.theme.Secondary
import com.nas.app.ui.theme.Warning
import com.nas.protocol.ConnectionType
import com.nas.protocol.DiscoveredDevice
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DevicesScreen(
    onSelectDevice: (deviceId: String, deviceName: String, address: String) -> Unit,
    onOpenPairing: () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()
    val dao = remember { NasApplication.instance.database.trustedDeviceDao() }

    val trustedDevices by dao.getAllTrusted().collectAsState(initial = emptyList())
    var discoveredDevices by remember { mutableStateOf<List<DiscoveredDevice>>(emptyList()) }

    LaunchedEffect(Unit) {
        val mdnsManager = MdnsManager(context)
        mdnsManager.discoverServices().collectLatest { list ->
            discoveredDevices = list
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("NAS Devices", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = onOpenPairing) {
                        Icon(Icons.Default.QrCode, contentDescription = "Pair Device")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Discovered nearby section
            item {
                Text(
                    text = "Discovered on Local Network",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                )
            }

            if (discoveredDevices.isEmpty()) {
                item {
                    Text(
                        text = "Searching for nearby devices on WiFi...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
            } else {
                items(discoveredDevices) { device ->
                    DiscoveredDeviceItem(
                        device = device,
                        onClick = { onSelectDevice(device.deviceId, device.deviceName, device.address) }
                    )
                }
            }

            // Pinned & Trusted devices section
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Trusted Devices",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
            }

            if (trustedDevices.isEmpty()) {
                item {
                    Text(
                        text = "No paired devices yet. Tap the QR icon above to pair.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
            } else {
                items(trustedDevices) { device ->
                    // Find active IP address if currently discovered on LAN
                    val matchedDiscovered = discoveredDevices.find { it.deviceId == device.deviceId }
                    val currentAddress = matchedDiscovered?.address ?: ""
                    val isOnline = matchedDiscovered != null

                    TrustedDeviceItem(
                        device = device,
                        isOnline = isOnline,
                        address = currentAddress,
                        onClick = {
                            if (currentAddress.isNotEmpty()) {
                                onSelectDevice(device.deviceId, device.deviceName, currentAddress)
                            }
                        },
                        onRevoke = {
                            scope.launch { dao.revoke(device.deviceId) }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun DiscoveredDeviceItem(device: DiscoveredDevice, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Wifi,
                contentDescription = null,
                tint = Secondary,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(device.deviceName, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(device.address, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 13.sp)
            }
            Badge(containerColor = Secondary) {
                Text("LAN Direct", color = Color.White, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
            }
        }
    }
}

@Composable
fun TrustedDeviceItem(
    device: TrustedDeviceEntity,
    isOnline: Boolean,
    address: String,
    onClick: () -> Unit,
    onRevoke: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = isOnline, onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Devices,
                contentDescription = null,
                tint = if (isOnline) Secondary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f),
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(device.deviceName, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(
                    text = if (isOnline) "Online • $address" else "Offline",
                    color = if (isOnline) Secondary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                    fontSize = 13.sp
                )
            }
            IconButton(onClick = onRevoke) {
                Icon(Icons.Default.Delete, contentDescription = "Revoke Trust", tint = MaterialTheme.colorScheme.error)
            }
        }
    }
}
