package com.nas.app.pairing

import android.content.Context
import android.os.Build
import android.util.Base64
import java.security.KeyPairGenerator
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.UUID

data class Identity(
    val deviceId: String,
    val deviceName: String,
    val pubkeyHex: String
)

object DeviceIdentity {
    private const val PREF_NAME = "nas_identity"
    private const val KEY_DEVICE_ID = "device_id"
    private const val KEY_DEVICE_NAME = "device_name"
    private const val KEY_PUBKEY = "pubkey"

    fun getOrCreate(context: Context): Identity {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        var deviceId = prefs.getString(KEY_DEVICE_ID, null)
        var deviceName = prefs.getString(KEY_DEVICE_NAME, null)
        var pubkey = prefs.getString(KEY_PUBKEY, null)

        if (deviceId == null || pubkey == null) {
            deviceId = UUID.randomUUID().toString()
            deviceName = Build.MODEL ?: "Android-NAS"

            // Generate keypair or cryptographic identity entropy
            val randomBytes = ByteArray(32)
            SecureRandom().nextBytes(randomBytes)
            pubkey = randomBytes.joinToString("") { "%02x".format(it) }

            prefs.edit()
                .putString(KEY_DEVICE_ID, deviceId)
                .putString(KEY_DEVICE_NAME, deviceName)
                .putString(KEY_PUBKEY, pubkey)
                .apply()
        }

        return Identity(
            deviceId = deviceId,
            deviceName = deviceName ?: Build.MODEL ?: "Android-Device",
            pubkeyHex = pubkey
        )
    }

    fun sha256(input: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(input.toByteArray(Charsets.UTF_8))
        return hash.joinToString("") { "%02x".format(it) }
    }
}
