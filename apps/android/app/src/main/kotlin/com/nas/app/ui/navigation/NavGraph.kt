package com.nas.app.ui.navigation

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.nas.app.pairing.PairingManager
import com.nas.app.pairing.PairingState
import com.nas.app.ui.adaptive.rememberUniversalPosture
import com.nas.app.ui.adaptive.universalFocusable
import com.nas.app.ui.components.PairingDialog
import com.nas.app.ui.screens.DevicesScreen
import com.nas.app.ui.screens.FilesScreen
import com.nas.app.ui.screens.PoolScreen
import com.nas.app.ui.screens.ShareScreen
import com.nas.app.ui.screens.SyncScreen
import kotlinx.coroutines.launch

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Devices : Screen("devices", "Devices", Icons.Default.Devices)
    object Pool : Screen("pool", "Pool", Icons.Default.Layers)
    object Share : Screen("share", "Share", Icons.Default.Share)
    object Sync : Screen("sync", "Sync", Icons.Default.Sync)
    object Files : Screen("files/{address}/{deviceName}", "Files", Icons.Default.Folder) {
        fun createRoute(address: String, deviceName: String) = "files/${java.net.URLEncoder.encode(address, "UTF-8")}/${java.net.URLEncoder.encode(deviceName, "UTF-8")}"
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppNavigation() {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val pairingManager = remember { PairingManager(context) }
    val posture = rememberUniversalPosture()

    var isPairingDialogOpen by remember { mutableStateOf(false) }
    var activePairingCode by remember { mutableStateOf<String?>(null) }
    var pairingState by remember { mutableStateOf<PairingState>(PairingState.Idle) }

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val isPrimaryTab = currentRoute in listOf(Screen.Devices.route, Screen.Pool.route, Screen.Share.route, Screen.Sync.route)
    val tabs = listOf(Screen.Devices, Screen.Pool, Screen.Share, Screen.Sync)
    val firstTabFocus = remember { FocusRequester() }

    fun navigateTab(route: String) {
        navController.navigate(route) {
            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
            launchSingleTop = true
            restoreState = true
        }
    }

    // Side effect: give TV initial focus to first tab
    LaunchedEffect(posture.isTv, currentRoute) {
        if (posture.isTv && isPrimaryTab) {
            try { firstTabFocus.requestFocus() } catch (_: Exception) { }
        }
    }

    if (posture.useTopTabs) {
        // TV / 10-foot: top TabRow, large targets, D-pad traversable
        Scaffold(
            topBar = {
                TabRow(
                    selectedTabIndex = tabs.indexOfFirst { it.route == currentRoute }.coerceAtLeast(0),
                    modifier = Modifier.padding(horizontal = posture.horizontalPadding)
                ) {
                    tabs.forEachIndexed { index, screen ->
                        Tab(
                            selected = currentRoute == screen.route,
                            onClick = { navigateTab(screen.route) },
                            text = { Text(screen.title) },
                            icon = { Icon(screen.icon, contentDescription = screen.title) },
                            modifier = if (index == 0) {
                                Modifier
                                    .focusRequester(firstTabFocus)
                                    .universalFocusable()
                            } else {
                                Modifier.universalFocusable()
                            }
                        )
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
                                pairingManager.startInitiatorSession(code) { state -> pairingState = state }
                            }
                        }
                    )
                }
                composable(Screen.Sync.route) { SyncScreen() }
                composable(Screen.Pool.route) { PoolScreen() }
                composable(Screen.Files.route) { backStackEntry ->
                    val address = backStackEntry.arguments?.getString("address")?.let { java.net.URLDecoder.decode(it, "UTF-8") } ?: ""
                    val deviceName = backStackEntry.arguments?.getString("deviceName")?.let { java.net.URLDecoder.decode(it, "UTF-8") } ?: "Device"
                    FilesScreen(peerAddress = address, peerDeviceName = deviceName, onBack = { navController.popBackStack() })
                }
            }
            if (isPairingDialogOpen) {
                PairingDialog(
                    initialCode = activePairingCode,
                    pairingState = pairingState,
                    onJoinCode = { enteredCode ->
                        scope.launch {
                            pairingManager.startJoinerSession(enteredCode) { state -> pairingState = state }
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
    } else if (posture.useTwoPane) {
        // Tablet landscape / foldable: rail + content
        Row(modifier = Modifier.fillMaxSize()) {
            NavigationRail {
                tabs.forEach { screen ->
                    NavigationRailItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = currentRoute == screen.route,
                        onClick = { navigateTab(screen.route) },
                        modifier = Modifier.universalFocusable()
                    )
                }
            }
            NavHost(
                navController = navController,
                startDestination = Screen.Devices.route,
                modifier = Modifier.weight(1f)
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
                                pairingManager.startInitiatorSession(code) { state -> pairingState = state }
                            }
                        }
                    )
                }
                composable(Screen.Sync.route) { SyncScreen() }
                composable(Screen.Pool.route) { PoolScreen() }
                composable(Screen.Files.route) { backStackEntry ->
                    val address = backStackEntry.arguments?.getString("address")?.let { java.net.URLDecoder.decode(it, "UTF-8") } ?: ""
                    val deviceName = backStackEntry.arguments?.getString("deviceName")?.let { java.net.URLDecoder.decode(it, "UTF-8") } ?: "Device"
                    FilesScreen(peerAddress = address, peerDeviceName = deviceName, onBack = { navController.popBackStack() })
                }
            }
            if (isPairingDialogOpen) {
                PairingDialog(
                    initialCode = activePairingCode,
                    pairingState = pairingState,
                    onJoinCode = { enteredCode ->
                        scope.launch {
                            pairingManager.startJoinerSession(enteredCode) { state -> pairingState = state }
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
    } else {
        // Phone: bottom bar (existing behavior preserved)
        Scaffold(
            bottomBar = {
                if (isPrimaryTab) {
                    NavigationBar {
                        tabs.forEach { screen ->
                            NavigationBarItem(
                                icon = { Icon(screen.icon, contentDescription = screen.title) },
                                label = { Text(screen.title) },
                                selected = currentRoute == screen.route,
                                onClick = { navigateTab(screen.route) }
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
                                pairingManager.startInitiatorSession(code) { state -> pairingState = state }
                            }
                        }
                    )
                }
                composable(Screen.Sync.route) { SyncScreen() }
                composable(Screen.Pool.route) { PoolScreen() }
                composable(Screen.Files.route) { backStackEntry ->
                    val address = backStackEntry.arguments?.getString("address")?.let { java.net.URLDecoder.decode(it, "UTF-8") } ?: ""
                    val deviceName = backStackEntry.arguments?.getString("deviceName")?.let { java.net.URLDecoder.decode(it, "UTF-8") } ?: "Device"
                    FilesScreen(peerAddress = address, peerDeviceName = deviceName, onBack = { navController.popBackStack() })
                }
            }
            if (isPairingDialogOpen) {
                PairingDialog(
                    initialCode = activePairingCode,
                    pairingState = pairingState,
                    onJoinCode = { enteredCode ->
                        scope.launch {
                            pairingManager.startJoinerSession(enteredCode) { state -> pairingState = state }
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
}
