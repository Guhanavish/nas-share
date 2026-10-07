package com.nas.app.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.nas.app.MainActivity
import com.nas.app.NasApplication
import com.nas.app.discovery.MdnsManager
import com.nas.app.pairing.DeviceIdentity
import com.nas.app.server.EmbeddedServer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

class NasService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private var embeddedServer: EmbeddedServer? = null
    private var mdnsManager: MdnsManager? = null
    private var wakeLock: PowerManager.WakeLock? = null

    companion object {
        private const val TAG = "NasService"
        private const val CHANNEL_ID = "nas_sharing_channel"
        private const val NOTIFICATION_ID = 8743

        const val ACTION_START = "com.nas.app.action.START"
        const val ACTION_STOP = "com.nas.app.action.STOP"

        fun start(context: Context) {
            val intent = Intent(context, NasService::class.java).apply {
                action = ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, NasService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "NasApp:ServiceWakeLock").apply {
            setReferenceCounted(false)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopSharing()
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_START, null -> {
                startSharing()
            }
        }
        return START_STICKY
    }

    private fun startSharing() {
        wakeLock?.acquire(24 * 60 * 60 * 1000L) // 24h max wake lock

        val notification = createNotification("NAS Service Starting...")
        startForeground(NOTIFICATION_ID, notification)

        serviceScope.launch(Dispatchers.IO) {
            val port = 8743
            if (embeddedServer == null) {
                embeddedServer = EmbeddedServer(port).also { it.start() }
                Log.i(TAG, "Embedded HTTP Server started on port $port")
            }

            val identity = DeviceIdentity.getOrCreate(applicationContext)
            if (mdnsManager == null) {
                mdnsManager = MdnsManager(applicationContext).apply {
                    registerService(port, identity.deviceId, identity.deviceName)
                }
            }

            val sharedFolders = NasApplication.instance.database.sharedFolderDao().getAll().firstOrNull() ?: emptyList()
            val folderCount = sharedFolders.filter { it.enabled }.size
            val notificationText = if (folderCount == 1) "Sharing 1 folder — tap to stop" else "Sharing $folderCount folders — tap to stop"
            val updatedNotification = createNotification(notificationText)

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(NOTIFICATION_ID, updatedNotification)
        }
    }

    private fun stopSharing() {
        embeddedServer?.stop()
        embeddedServer = null

        mdnsManager?.unregisterService()
        mdnsManager = null

        if (wakeLock?.isHeld == true) {
            wakeLock?.release()
        }
    }

    private fun createNotification(content: String): Notification {
        val tapIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, tapIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val stopIntent = Intent(this, NasService::class.java).apply { action = ACTION_STOP }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("NAS Storage Active")
            .setContentText(content)
            .setSmallIcon(android.R.drawable.stat_sys_upload)
            .setContentIntent(pendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop", stopPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "NAS Background Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the local NAS server accessible while app is in background"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        stopSharing()
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
