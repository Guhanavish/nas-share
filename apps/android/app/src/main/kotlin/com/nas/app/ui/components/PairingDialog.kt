package com.nas.app.ui.components

import android.graphics.Bitmap
import android.graphics.Color as AndroidColor
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import com.nas.app.pairing.PairingState
import com.nas.app.ui.adaptive.bodySp
import com.nas.app.ui.adaptive.rememberUniversalPosture
import com.nas.app.ui.adaptive.titleSp
import com.nas.app.ui.adaptive.universalFocusable
import kotlinx.coroutines.delay

@Composable
fun PairingDialog(
    initialCode: String? = null,
    onJoinCode: (String) -> Unit,
    onDismiss: () -> Unit,
    pairingState: PairingState = PairingState.Idle
) {
    var mode by remember { mutableStateOf(if (initialCode != null) "SHOW" else "ENTER") }
    var enteredCode by remember { mutableStateOf("") }
    var timeLeftSeconds by remember { mutableStateOf(300) } // 5 minutes
    val posture = rememberUniversalPosture()
    val isTv = posture.isTv

    LaunchedEffect(mode, initialCode) {
        if (mode == "SHOW") {
            timeLeftSeconds = 300
            while (timeLeftSeconds > 0) {
                delay(1000)
                timeLeftSeconds--
            }
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            // TV/Google TV: fullscreen sheet so D-pad + 10-foot text works
            usePlatformDefaultWidth = !isTv,
            decorFitsSystemWindows = !isTv
        )
    ) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = if (isTv) {
                Modifier
                    .fillMaxWidth(0.92f)
                    .padding(vertical = 27.dp)
            } else {
                Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(if (isTv) 32.dp else 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (mode == "SHOW") "Share Device" else "Pair Device",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        fontSize = titleSp(isTv).sp
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.universalFocusable()) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Mode switch tabs (D-pad focusable)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Button(
                        onClick = { mode = "SHOW" },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (mode == "SHOW") MaterialTheme.colorScheme.primary else androidx.compose.ui.graphics.Color.Transparent
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .universalFocusable(),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Show Code")
                    }
                    Button(
                        onClick = { mode = "ENTER" },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (mode == "ENTER") MaterialTheme.colorScheme.primary else androidx.compose.ui.graphics.Color.Transparent
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .universalFocusable(),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Enter Code")
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                if (mode == "SHOW") {
                    val codeToShow = initialCode ?: "XXXX-XXXX"
                    val qrUrl = "nas://join?room=${codeToShow.replace("-", "")}&v=1"

                    // Real scannable QR (ZXing), large on TV for phone scan at 3m
                    val qrSize = if (isTv) 320 else 200
                    val qrBitmap = remember(codeToShow) { generateQrBitmap(qrUrl, 512) }
                    qrBitmap?.let {
                        Image(
                            bitmap = it.asImageBitmap(),
                            contentDescription = "Pairing QR Code",
                            modifier = Modifier
                                .size(qrSize.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(androidx.compose.ui.graphics.Color.White)
                                .padding(8.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = codeToShow,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.ExtraBold,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 4.sp,
                        fontSize = if (isTv) 40.sp else 28.sp,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    val clipboardManager = LocalClipboardManager.current
                    TextButton(
                        onClick = { clipboardManager.setText(AnnotatedString(codeToShow)) },
                        modifier = Modifier.universalFocusable()
                    ) {
                        Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Copy Code", fontSize = bodySp(isTv).sp)
                    }

                    Text(
                        text = "Expires in ${timeLeftSeconds / 60}:${(timeLeftSeconds % 60).toString().padStart(2, '0')}",
                        style = MaterialTheme.typography.bodySmall,
                        fontSize = bodySp(isTv).sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                    if (isTv) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Scan with phone camera, or type the code on the other device.",
                            fontSize = bodySp(true).sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            textAlign = TextAlign.Center
                        )
                    }
                } else {
                    OutlinedTextField(
                        value = enteredCode,
                        onValueChange = { input ->
                            // Clean Crockford Base32 characters, uppercase, auto-dash
                            val cleaned = input.uppercase().filter { it in "ABCDEFGHJKMNPQRSTVWXYZ23456789-" }
                            val raw = cleaned.replace("-", "")
                            enteredCode = if (raw.length > 4) {
                                "${raw.substring(0, 4)}-${raw.substring(4, minOf(8, raw.length))}"
                            } else {
                                raw
                            }
                        },
                        label = { Text("8-Character Code") },
                        placeholder = { Text("K7M2-Q9XD") },
                        textStyle = LocalTextStyle.current.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = if (isTv) 28.sp else 20.sp,
                            textAlign = TextAlign.Center
                        ),
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .universalFocusable()
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = { onJoinCode(enteredCode) },
                        enabled = enteredCode.replace("-", "").length == 8,
                        modifier = Modifier
                            .fillMaxWidth()
                            .universalFocusable(enabled = enteredCode.replace("-", "").length == 8)
                    ) {
                        Text("Connect & Pair", fontSize = bodySp(isTv).sp)
                    }
                    if (isTv) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Use remote arrows to move, OK to confirm. Letters only, no 0/O/1/I.",
                            fontSize = bodySp(true).sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            textAlign = TextAlign.Center
                        )
                    }
                }

                // Status message
                Spacer(modifier = Modifier.height(12.dp))
                when (pairingState) {
                    is PairingState.Connecting -> Text("Connecting to peer...", color = MaterialTheme.colorScheme.primary, fontSize = bodySp(isTv).sp)
                    is PairingState.Connected -> Text("Connected! Verifying cryptographic commit...", color = MaterialTheme.colorScheme.secondary, fontSize = bodySp(isTv).sp)
                    is PairingState.Success -> Text("Successfully paired with ${(pairingState as PairingState.Success).deviceName}!", color = MaterialTheme.colorScheme.secondary, fontSize = bodySp(isTv).sp)
                    is PairingState.Error -> Text("Failed: ${(pairingState as PairingState.Error).reason}", color = MaterialTheme.colorScheme.error, fontSize = bodySp(isTv).sp)
                    else -> {}
                }
            }
        }
    }
}

// Real QR bitmap via ZXing (scannable nas://join link)
fun generateQrBitmap(contents: String, size: Int): Bitmap? {
    return try {
        val writer = QRCodeWriter()
        val matrix = writer.encode(contents, BarcodeFormat.QR_CODE, size, size)
        val w = matrix.width
        val h = matrix.height
        val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        for (x in 0 until w) {
            for (y in 0 until h) {
                bitmap.setPixel(x, y, if (matrix.get(x, y)) AndroidColor.BLACK else AndroidColor.WHITE)
            }
        }
        bitmap
    } catch (e: Exception) {
        null
    }
}
