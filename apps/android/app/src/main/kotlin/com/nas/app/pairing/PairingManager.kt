package com.nas.app.pairing

import android.content.Context
import android.util.Log
import com.nas.app.NasApplication
import com.nas.app.data.TrustedDeviceEntity
import com.nas.protocol.CrockfordBase32
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.security.SecureRandom
import java.util.concurrent.TimeUnit

sealed class PairingState {
    object Idle : PairingState()
    data class Generated(val code: String, val expiresAt: Long) : PairingState()
    object Connecting : PairingState()
    object Connected : PairingState()
    data class Success(val deviceName: String) : PairingState()
    data class Error(val reason: String) : PairingState()
}

class PairingManager(
    private val context: Context,
    private val workerUrl: String = "wss://nas-signaling.ssgginfotech.workers.dev"
) {
    companion object {
        private const val TAG = "PairingManager"
        private const val CODE_TTL_MS = 5 * 60 * 1000L
    }

    private val json = Json { ignoreUnknownKeys = true }
    private val client = OkHttpClient.Builder()
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private var activeWebSocket: WebSocket? = null
    private var activeCode: String? = null
    private var activeRole: String? = null

    /**
     * Generates a CSPRNG 8-character Crockford Base32 code in format XXXX-XXXX
     */
    fun generateCode(): String {
        val alphabet = CrockfordBase32.ALPHABET
        val random = SecureRandom()
        val chars = CharArray(8)
        for (i in 0 until 8) {
            chars[i] = alphabet[random.nextInt(alphabet.length)]
        }
        val formatted = "${String(chars, 0, 4)}-${String(chars, 4, 4)}"
        activeCode = formatted
        return formatted
    }

    /**
     * Initiates pairing session as the Initiator (who generated the code)
     */
    suspend fun startInitiatorSession(
        code: String,
        onStateChange: (PairingState) -> Unit
    ) = withContext(Dispatchers.IO) {
        val normalizedCode = code.replace("-", "").uppercase()
        val identity = DeviceIdentity.getOrCreate(context)
        val wsUrl = "$workerUrl/ws?room=$normalizedCode"

        onStateChange(PairingState.Connecting)

        val request = Request.Builder().url(wsUrl).build()
        activeWebSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "Signaling WebSocket opened (initiator)")
                onStateChange(PairingState.Connected)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d(TAG, "WS Message received: $text")
                try {
                    val root = json.parseToJsonElement(text).jsonObject
                    val type = root["type"]?.jsonPrimitive?.content ?: return

                    when (type) {
                        "join" -> {
                            // Joiner entered the room, send identity payload directly
                            val commit = DeviceIdentity.sha256(code)
                            val identityPayload = buildJsonObject {
                                put("type", "identity_exchange")
                                put("commit", commit)
                                put("device_id", identity.deviceId)
                                put("device_name", identity.deviceName)
                                put("pubkey", identity.pubkeyHex)
                            }
                            webSocket.send(identityPayload.toString())
                        }
                        "identity_exchange" -> {
                            // Received peer's identity
                            val remoteCommit = root["commit"]?.jsonPrimitive?.content
                            val expectedCommit = DeviceIdentity.sha256(code)
                            if (remoteCommit == expectedCommit) {
                                val remoteId = root["device_id"]?.jsonPrimitive?.content ?: ""
                                val remoteName = root["device_name"]?.jsonPrimitive?.content ?: "Remote Device"
                                val remotePubkey = root["pubkey"]?.jsonPrimitive?.content ?: ""

                                // Save to trusted devices
                                saveTrustedDevice(remoteId, remoteName, remotePubkey)
                                onStateChange(PairingState.Success(remoteName))
                                webSocket.close(1000, "Paired")
                            } else {
                                onStateChange(PairingState.Error("Commit mismatch! Verification failed."))
                            }
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error processing WS message", e)
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket failure", t)
                onStateChange(PairingState.Error(t.message ?: "Signaling failed"))
            }
        })
    }

    /**
     * Joins pairing session as the Joiner (who entered the code)
     */
    suspend fun startJoinerSession(
        code: String,
        onStateChange: (PairingState) -> Unit
    ) = withContext(Dispatchers.IO) {
        val normalizedCode = code.replace("-", "").uppercase()
        val identity = DeviceIdentity.getOrCreate(context)
        val wsUrl = "$workerUrl/ws?room=$normalizedCode"

        onStateChange(PairingState.Connecting)

        val request = Request.Builder().url(wsUrl).build()
        activeWebSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "Signaling WebSocket opened (joiner)")
                onStateChange(PairingState.Connected)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d(TAG, "Joiner WS Message: $text")
                try {
                    val root = json.parseToJsonElement(text).jsonObject
                    val type = root["type"]?.jsonPrimitive?.content ?: return

                    when (type) {
                        "identity_exchange" -> {
                            val remoteCommit = root["commit"]?.jsonPrimitive?.content
                            val expectedCommit = DeviceIdentity.sha256(code)
                            if (remoteCommit == expectedCommit) {
                                val remoteId = root["device_id"]?.jsonPrimitive?.content ?: ""
                                val remoteName = root["device_name"]?.jsonPrimitive?.content ?: "Remote Device"
                                val remotePubkey = root["pubkey"]?.jsonPrimitive?.content ?: ""

                                // Reply with our identity
                                val myCommit = DeviceIdentity.sha256(code)
                                val identityReply = buildJsonObject {
                                    put("type", "identity_exchange")
                                    put("commit", myCommit)
                                    put("device_id", identity.deviceId)
                                    put("device_name", identity.deviceName)
                                    put("pubkey", identity.pubkeyHex)
                                }
                                webSocket.send(identityReply.toString())

                                // Save trusted device
                                saveTrustedDevice(remoteId, remoteName, remotePubkey)
                                onStateChange(PairingState.Success(remoteName))
                                webSocket.close(1000, "Paired")
                            } else {
                                onStateChange(PairingState.Error("Commit mismatch! Verification failed."))
                            }
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error processing WS message", e)
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "Joiner WebSocket failure", t)
                onStateChange(PairingState.Error(t.message ?: "Connection error"))
            }
        })
    }

    private fun saveTrustedDevice(id: String, name: String, pubkey: String) {
        val db = NasApplication.instance.database
        launchSilently {
            db.trustedDeviceDao().insert(
                TrustedDeviceEntity(
                    deviceId = id,
                    deviceName = name,
                    pubkey = pubkey,
                    pinnedAt = System.currentTimeMillis(),
                    lastSeen = System.currentTimeMillis(),
                    isRevoked = false
                )
            )
        }
    }

    fun cancelSession() {
        activeWebSocket?.close(1000, "User cancelled")
        activeWebSocket = null
        activeCode = null
    }

    private fun launchSilently(block: suspend () -> Unit) {
        kotlinx.coroutines.CoroutineScope(Dispatchers.IO).launch {
            try {
                block()
            } catch (e: Exception) {
                Log.e("PairingManager", "Failed async task", e)
            }
        }
    }
}

