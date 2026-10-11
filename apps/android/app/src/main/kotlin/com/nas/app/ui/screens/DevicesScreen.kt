package com.nas.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nas.app.NasApplication
import com.nas.app.data.TrustedDeviceEntity
import com.nas.app.discovery.MdnsManager
import com.nas.app.ui.adaptive.bodySp
import com.nas.app.ui.adaptive.rememberUniversalPosture
import com.nas.app.ui.adaptive.titleSp
import com.nas.app.ui.adaptive.universalFocusable
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
    val posture = rememberUniversalPosture()
    val firstItemFocus = remember { FocusRequester() }
    var focusRequested by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        val mdnsManager = MdnsManager(context)
        mdnsManager.discoverServices().collectLatest { list ->
            discoveredDevices = list
        }
    }

    // TV: give D-pad a starting point once content exists
    LaunchedEffect(posture.isTv, discoveredDevices.size, trustedDevices.size) {
        if (posture.isTv && !focusRequested && (discoveredDevices.isNotEmpty() || trustedDevices.isNotEmpty())) {
            try { firstItemFocus.requestFocus(); focusRequested = true } catch (_: Exception) { }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("NAS Devices", fontWeight = FontWeight.Bold, fontSize = titleSp(posture.isTv).sp) },
                actions = {
                    IconButton(onClick = onOpenPairing, modifier = Modifier.universalFocusable()) {
                        Icon(Icons.Default.QrCode, contentDescription = "Pair Device")
                    }
                }
            )
        }
    ) { padding ->
        if (posture.columns > 1) {
            LazyVerticalGrid(
                columns = GridCells.Fixed(posture.columns),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = posture.horizontalPadding, vertical = posture.verticalPadding),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(posture.columns) }) {
                    Text(
                        text = "Discovered on Local Network",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = titleSp(posture.isTv).sp
                    )
                }
                if (discoveredDevices.isEmpty()) {
                    item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(posture.columns) }) {
                        Text(
                            text = "Searching for nearby devices on WiFi...",
                            fontSize = bodySp(posture.isTv).sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                    }
                } else {
                    items(discoveredDevices, key = { it.deviceId }) { device ->
                        DiscoveredDeviceItem(
                            device = device,
                            isTv = posture.isTv,
                            modifier = if (discoveredDevices.firstOrNull()?.deviceId == device.deviceId) {
                                Modifier.focusRequester(firstItemFocus)
                            } else Modifier,
                            onClick = { onSelectDevice(device.deviceId, device.deviceName, device.address) }
                        )
                    }
                }
                item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(posture.columns) }) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Trusted Devices",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = titleSp(posture.isTv).sp
                    )
                }
                if (trustedDevices.isEmpty()) {
                    item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(posture.columns) }) {
                        Text(
                            text = "No paired devices yet. Tap the QR icon above to pair.",
                            fontSize = bodySp(posture.isTv).sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                    }
                } else {
                    items(trustedDevices, key = { it.deviceId }) { device ->
                        val matchedDiscovered = discoveredDevices.find { it.deviceId == device.deviceId }
                        val currentAddress = matchedDiscovered?.address ?: ""
                        val isOnline = matchedDiscovered != null
                        TrustedDeviceItem(
                            device = device,
                            isOnline = isOnline,
                            address = currentAddress,
                            isTv = posture.isTv,
                            onClick = {
                                if (currentAddress.isNotEmpty()) {
                                    onSelectDevice(device.deviceId, device.deviceName, currentAddress)
                                }
                            },
                            onRevoke = { scope.launch { dao.revoke(device.deviceId) } }
                        )
                    }
                }
            }
            return@Scaffold
        }
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
fun DiscoveredDeviceItem(
    device: DiscoveredDevice,
    onClick: () -> Unit,
    isTv: Boolean = false,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = modifier
            .fillMaxWidth()
            .universalFocusable(onDpadCenter = onClick)
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
                modifier = Modifier.size(if (isTv) 36.dp else 28.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(device.deviceName, fontWeight = FontWeight.Bold, fontSize = titleSp(isTv).sp)
                Text(device.address, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = bodySp(isTv).sp)
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
    onRevoke: () -> Unit,
    isTv: Boolean = false,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = modifier
            .fillMaxWidth()
            .universalFocusable(enabled = isOnline, onDpadCenter = onClick)
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
                modifier = Modifier.size(if (isTv) 36.dp else 28.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(device.deviceName, fontWeight = FontWeight.Bold, fontSize = titleSp(isTv).sp)
                Text(
                    text = if (isOnline) "Online • $address" else "Offline",
                    color = if (isOnline) Secondary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                    fontSize = bodySp(isTv).sp
                )
            }
            IconButton(onClick = onRevoke, modifier = Modifier.universalFocusable()) {
                Icon(Icons.Default.Delete, contentDescription = "Revoke Trust", tint = MaterialTheme.colorScheme.error)
            }
        }
    }
}
