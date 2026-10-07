package com.nas.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.nas.app.pairing.PairingManager
import com.nas.app.pairing.PairingState
import com.nas.app.ui.components.PairingDialog
import com.nas.app.ui.screens.DevicesScreen
import com.nas.app.ui.screens.FilesScreen
import com.nas.app.ui.screens.ShareScreen
import com.nas.app.ui.screens.SyncScreen
import kotlinx.coroutines.launch

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Devices : Screen("devices", "Devices", Icons.Default.Devices)
    object Share : Screen("share", "Share", Icons.Default.Share)
    object Sync : Screen("sync", "Sync", Icons.Default.Sync)
    object Files : Screen("files/{address}/{deviceName}", "Files", Icons.Default.Folder) {
        fun createRoute(address: String, deviceName: String) = "files/${java.net.URLEncoder.encode(address, "UTF-8")}/${java.net.URLEncoder.encode(deviceName, "UTF-8")}"
    }
}

@Composable
fun MainAppNavigation() {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()
    val context = androidx.compose.ui.platform.LocalContext.current
    val pairingManager = remember { PairingManager(context) }

    var isPairingDialogOpen by remember { mutableStateOf(false) }
    var activePairingCode by remember { mutableStateOf<String?>(null) }
    var pairingState by remember { mutableStateOf<PairingState>(PairingState.Idle) }

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            // Show bottom bar on primary tabs
            if (currentRoute in listOf(Screen.Devices.route, Screen.Share.route, Screen.Sync.route)) {
                NavigationBar {
                    val items = listOf(Screen.Devices, Screen.Share, Screen.Sync)
                    items.forEach { screen ->
                        NavigationBarItem(
                            icon = { Icon(screen.icon, contentDescription = screen.title) },
                            label = { Text(screen.title) },
                            selected = currentRoute == screen.route,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Devices.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Devices.route) {
                DevicesScreen(
                    onSelectDevice = { _, name, address ->
                        navController.navigate(Screen.Files.createRoute(address, name))
                    },
                    onOpenPairing = {
                        activePairingCode = pairingManager.generateCode()
                        pairingState = PairingState.Idle
                        isPairingDialogOpen = true
                    }
                )
            }

            composable(Screen.Share.route) {
                ShareScreen(
                    onOpenPairingWithCode = { code ->
                        activePairingCode = code
                        pairingState = PairingState.Idle
                        isPairingDialogOpen = true
                        scope.launch {
                            pairingManager.startInitiatorSession(code) { state ->
                                pairingState = state
                            }
                        }
                    }
                )
            }

            composable(Screen.Sync.route) {
                SyncScreen()
            }

            composable(Screen.Files.route) { backStackEntry ->
                val address = backStackEntry.arguments?.getString("address")?.let { java.net.URLDecoder.decode(it, "UTF-8") } ?: ""
                val deviceName = backStackEntry.arguments?.getString("deviceName")?.let { java.net.URLDecoder.decode(it, "UTF-8") } ?: "Device"

                FilesScreen(
                    peerAddress = address,
                    peerDeviceName = deviceName,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        if (isPairingDialogOpen) {
            PairingDialog(
                initialCode = activePairingCode,
                pairingState = pairingState,
                onJoinCode = { enteredCode ->
                    scope.launch {
                        pairingManager.startJoinerSession(enteredCode) { state ->
                            pairingState = state
                        }
                    }
                },
                onDismiss = {
                    isPairingDialogOpen = false
                    pairingManager.cancelSession()
                    activePairingCode = null
                    pairingState = PairingState.Idle
                }
            )
        }
    }
}
