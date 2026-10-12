package com.nas.app.remote

import android.util.Log
import com.nas.app.BuildConfig
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit

/**
 * Singleton relay mesh: one persistent WebSocket to the Presence DO.
 *
 * - hello + 30s ping keeps this device listed in GET /api/presence
 * - send(to, kind, payload) suspends until the matching recv arrives (30s)
 * - incoming kind=fileproto requests are delegated to [onFileProtoRequest]
 *   (set by RemoteResponder, running in NasService)
 *
 * Same-device loopback is rejected: never send to self.
 */
object RemoteMesh {

    private const val TAG = "RemoteMesh"
    private const val PING_INTERVAL_MS = 30_000L
    private const val REQUEST_TIMEOUT_MS = 30_000L

    private val json = Json { ignoreUnknownKeys = true }
    private val http = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()
    private val plainHttp = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    @Volatile var deviceId: String = ""
    @Volatile var deviceName: String = ""
    @Volatile private var socket: WebSocket? = null
    @Volatile private var running = false

    private val pending = ConcurrentHashMap<String, CompletableDeferred<RelayRecv>>()

    var onFileProtoRequest: (suspend (from: String, msgId: String, op: FileProtoOp) -> FileProtoResp)? = null

    val isConnected: Boolean get() = socket != null

    private fun presenceWsUrl(): String {
        val base = BuildConfig.WORKER_URL.trimEnd('/')
        val wsBase = when {
            base.startsWith("https://") -> "wss://" + base.removePrefix("https://")
            base.startsWith("http://") -> "ws://" + base.removePrefix("http://")
            else -> base
        }
        return "$wsBase/presence/ws?device=$deviceId"
    }

    fun workerBaseUrl(): String = BuildConfig.WORKER_URL.trimEnd('/')

    fun connect(id: String, name: String) {
        if (running && deviceId == id && socket != null) return
        deviceId = id
        deviceName = name
        running = true
        scope.launch { connectLoop() }
    }

    fun disconnect() {
        running = false
        try { socket?.close(1000, "Mesh stopped") } catch (_: Exception) { }
        socket = null
    }

    private suspend fun connectLoop() {
        var backoff = 5_000L
        while (running) {
            try {
                openSocket()
                backoff = 5_000L
                // Held open until failure; onFailure/onClosed resumes the loop.
                delay(60_000L)
                if (socket == null && running) {
                    delay(backoff)
                    backoff = minOf(backoff * 2, 60_000L)
                }
            } catch (e: Exception) {
                Log.w(TAG, "Mesh loop: ${e.message}")
                delay(backoff)
                backoff = minOf(backoff * 2, 60_000L)
            }
        }
    }

    private fun openSocket() {
        val request = Request.Builder().url(presenceWsUrl()).build()
        socket = http.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.i(TAG, "Presence socket open")
                webSocket.send(
                    """{"type":"hello","device_id":"$deviceId","device_name":"${deviceName.replace("\"", "")}"}"""
                )
                scope.launch { pingLoop(webSocket) }
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                scope.launch { handleMessage(webSocket, text) }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.w(TAG, "Presence socket failed: ${t.message}")
                if (socket === webSocket) socket = null
                failAllPending("Socket failed: ${t.message}")
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                if (socket === webSocket) socket = null
            }
        })
    }

    private suspend fun pingLoop(ws: WebSocket) {
        while (running && socket === ws) {
            delay(PING_INTERVAL_MS)
            try { ws.send("""{"type":"ping"}""") } catch (_: Exception) { break }
        }
    }

    private suspend fun handleMessage(ws: WebSocket, text: String) {
        val root = try { json.parseToJsonElement(text).jsonObject } catch (_: Exception) { return }
        when (root["type"]?.jsonPrimitive?.content) {
            "recv" -> {
                val msgId = root["msg_id"]?.jsonPrimitive?.content
                if (msgId != null) {
                    val deferred = pending.remove(msgId)
                    if (deferred != null) {
                        try {
                            deferred.complete(json.decodeFromString(RelayRecv.serializer(), text))
                        } catch (_: Exception) { }
                        return
                    }
                }
                // Unsolicited recv — must be an incoming fileproto request.
                if (root["kind"]?.jsonPrimitive?.content == "fileproto") {
                    val from = root["from"]?.jsonPrimitive?.content ?: return
                    if (from == deviceId) return // never answer self
                    val op = try {
                        json.decodeFromJsonElement(FileProtoOp.serializer(), root["payload"]!!)
                    } catch (_: Exception) { return }
                    val handler = onFileProtoRequest ?: return
                    val resp = try {
                        handler(from, msgId ?: UUID.randomUUID().toString(), op)
                    } catch (e: Exception) {
                        FileProtoResp(ok = false, error = e.message)
                    }
                    val reply = RelaySend(
                        to = from,
                        msg_id = msgId ?: UUID.randomUUID().toString(),
                        kind = "fileproto-resp",
                        payload = json.parseToJsonElement(json.encodeToString(resp))
                    )
                    try { ws.send(json.encodeToString(reply)) } catch (_: Exception) { }
                }
            }
            "pong", "hello_ack" -> { /* keepalive */ }
            "error" -> {
                val msgId = root["payload"]?.jsonObject?.get("msg_id")?.jsonPrimitive?.content
                if (msgId != null) {
                    pending.remove(msgId)?.completeExceptionally(
                        Exception(root["payload"]?.jsonObject?.get("code")?.jsonPrimitive?.content ?: "Relay error")
                    )
                }
            }
        }
    }

    private fun failAllPending(reason: String) {
        val err = Exception(reason)
        for ((_, d) in pending) {
            if (!d.isCompleted) d.completeExceptionally(err)
        }
        pending.clear()
    }

    /**
     * Send a fileproto payload to a remote trusted device and await its reply.
     * Throws on timeout / offline / relay error.
     */
    suspend fun send(
        to: String,
        kind: String,
        payload: kotlinx.serialization.json.JsonElement,
        timeoutMs: Long = REQUEST_TIMEOUT_MS
    ): RelayRecv {
        require(to.isNotBlank() && to != deviceId) { "Invalid relay target" }
        val ws = socket ?: throw Exception("Relay offline — presence socket not connected")
        val msgId = UUID.randomUUID().toString()
        val deferred = CompletableDeferred<RelayRecv>()
        pending[msgId] = deferred
        val env = RelaySend(to = to, msg_id = msgId, kind = kind, payload = payload)
        val sent = try {
            ws.send(json.encodeToString(env))
        } catch (e: Exception) {
            false
        }
        if (!sent) {
            pending.remove(msgId)
            throw Exception("Relay send failed — socket closed")
        }
        val result = withTimeoutOrNull(timeoutMs) {
            try {
                deferred.await()
            } catch (e: Exception) {
                throw e
            }
        }
        if (result == null) {
            pending.remove(msgId)
            throw Exception("Relay timeout — peer may be offline")
        }
        return result
    }

    /** Online device ids from the Worker (for Pool-without-LAN). */
    suspend fun fetchOnline(): Set<String> {
        return try {
            val req = Request.Builder().url("${workerBaseUrl()}/api/presence").build()
            val body = withTimeoutOrNull(15_000L) {
                kotlinx.coroutines.withContext(Dispatchers.IO) {
                    plainHttp.newCall(req).execute().use { resp ->
                        if (!resp.isSuccessful) null else resp.body?.string()
                    }
                }
            } ?: return emptySet()
            val root = json.parseToJsonElement(body).jsonObject
            val arr = root["devices"]?.toString() ?: return emptySet()
            // devices: [{device_id, device_name}]
            val list = json.parseToJsonElement(arr).toString()
            Regex("\"device_id\"\\s*:\\s*\"([^\"]+)\"").findAll(list).map { it.groupValues[1] }.toSet()
        } catch (_: Exception) {
            emptySet()
        }
    }
}
