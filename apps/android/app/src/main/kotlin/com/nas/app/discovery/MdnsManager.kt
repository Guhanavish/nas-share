package com.nas.app.discovery

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.util.Log
import com.nas.app.NasApplication
import com.nas.protocol.ConnectionType
import com.nas.protocol.DiscoveredDevice
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import java.net.InetAddress

class MdnsManager(private val context: Context) {

    private val nsdManager = context.getSystemService(Context.NSD_SERVICE) as NsdManager
    private val serviceType = "_nas-share._tcp."
    private var registrationListener: NsdManager.RegistrationListener? = null

    companion object {
        private const val TAG = "MdnsManager"
    }

    fun registerService(port: Int, deviceId: String, deviceName: String) {
        val serviceInfo = NsdServiceInfo().apply {
            this.serviceName = "NAS-$deviceName"
            this.serviceType = this@MdnsManager.serviceType
            this.port = port
            setAttribute("device_id", deviceId)
            setAttribute("device_name", deviceName)
            setAttribute("version", "0.1.0")
        }

        registrationListener = object : NsdManager.RegistrationListener {
            override fun onServiceRegistered(info: NsdServiceInfo) {
                Log.i(TAG, "mDNS Service registered: ${info.serviceName} on port ${info.port}")
            }

            override fun onRegistrationFailed(info: NsdServiceInfo, errorCode: Int) {
                Log.e(TAG, "mDNS Registration failed: $errorCode")
            }

            override fun onServiceUnregistered(info: NsdServiceInfo) {
                Log.i(TAG, "mDNS Service unregistered")
            }

            override fun onUnregistrationFailed(info: NsdServiceInfo, errorCode: Int) {
                Log.e(TAG, "mDNS Unregistration failed: $errorCode")
            }
        }

        try {
            nsdManager.registerService(serviceInfo, NsdManager.PROTOCOL_DNS_SD, registrationListener)
        } catch (e: Exception) {
            Log.e(TAG, "Error registering mDNS service", e)
        }
    }

    fun unregisterService() {
        registrationListener?.let {
            try {
                nsdManager.unregisterService(it)
            } catch (e: Exception) {
                Log.w(TAG, "Error unregistering service", e)
            }
            registrationListener = null
        }
    }

    fun discoverServices(): Flow<List<DiscoveredDevice>> = callbackFlow {
        val discoveredList = mutableMapOf<String, DiscoveredDevice>()

        val discoveryListener = object : NsdManager.DiscoveryListener {
            override fun onDiscoveryStarted(regType: String) {
                Log.d(TAG, "mDNS Service discovery started")
            }

            override fun onServiceFound(service: NsdServiceInfo) {
                Log.d(TAG, "mDNS Service found: ${service.serviceName}")
                try {
                    nsdManager.resolveService(service, object : NsdManager.ResolveListener {
                        override fun onResolveFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {
                            Log.w(TAG, "mDNS Resolve failed for ${serviceInfo.serviceName}: $errorCode")
                        }

                        override fun onServiceResolved(serviceInfo: NsdServiceInfo) {
                            val host: InetAddress = serviceInfo.host ?: return
                            val port = serviceInfo.port
                            val hostAddress = host.hostAddress ?: return

                            val deviceIdAttr = serviceInfo.attributes["device_id"]?.let { String(it) }
                                ?: serviceInfo.serviceName
                            val deviceNameAttr = serviceInfo.attributes["device_name"]?.let { String(it) }
                                ?: serviceInfo.serviceName

                            val device = DiscoveredDevice(
                                deviceId = deviceIdAttr,
                                deviceName = deviceNameAttr,
                                pubkey = "",
                                address = "$hostAddress:$port",
                                connectionType = ConnectionType.LAN,
                                signalStrength = 100
                            )

                            synchronized(discoveredList) {
                                discoveredList[deviceIdAttr] = device
                                trySend(discoveredList.values.toList())
                            }
                        }
                    })
                } catch (e: Exception) {
                    Log.e(TAG, "Error resolving service", e)
                }
            }

            override fun onServiceLost(service: NsdServiceInfo) {
                Log.d(TAG, "mDNS Service lost: ${service.serviceName}")
                synchronized(discoveredList) {
                    discoveredList.values.removeAll { it.deviceName == service.serviceName }
                    trySend(discoveredList.values.toList())
                }
            }

            override fun onDiscoveryStopped(serviceType: String) {
                Log.d(TAG, "mDNS Discovery stopped")
            }

            override fun onStartDiscoveryFailed(serviceType: String, errorCode: Int) {
                Log.e(TAG, "mDNS Start discovery failed: $errorCode")
            }

            override fun onStopDiscoveryFailed(serviceType: String, errorCode: Int) {
                Log.e(TAG, "mDNS Stop discovery failed: $errorCode")
            }
        }

        try {
            nsdManager.discoverServices(serviceType, NsdManager.PROTOCOL_DNS_SD, discoveryListener)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start mDNS discovery", e)
        }

        awaitClose {
            try {
                nsdManager.stopServiceDiscovery(discoveryListener)
            } catch (e: Exception) {
                Log.w(TAG, "Error stopping discovery", e)
            }
        }
    }
}
