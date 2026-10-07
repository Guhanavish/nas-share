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
import com.nas.app.pairing.PairingState
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

    LaunchedEffect(mode, initialCode) {
        if (mode == "SHOW") {
            timeLeftSeconds = 300
            while (timeLeftSeconds > 0) {
                delay(1000)
                timeLeftSeconds--
            }
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
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
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Mode switch tabs
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
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Show Code")
                    }
                    Button(
                        onClick = { mode = "ENTER" },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (mode == "ENTER") MaterialTheme.colorScheme.primary else androidx.compose.ui.graphics.Color.Transparent
                        ),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Enter Code")
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                if (mode == "SHOW") {
                    val codeToShow = initialCode ?: "XXXX-XXXX"
                    val qrUrl = "nas://join?room=${codeToShow.replace("-", "")}&v=1"

                    // QR Code preview
                    val qrBitmap = remember(codeToShow) { generateQrBitmap(qrUrl, 200) }
                    qrBitmap?.let {
                        Image(
                            bitmap = it.asImageBitmap(),
                            contentDescription = "Pairing QR Code",
                            modifier = Modifier
                                .size(180.dp)
                                .clip(RoundedCornerShape(8.dp))
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = codeToShow,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.ExtraBold,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 4.sp
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    val clipboardManager = LocalClipboardManager.current
                    TextButton(onClick = { clipboardManager.setText(AnnotatedString(codeToShow)) }) {
                        Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Copy Code")
                    }

                    Text(
                        text = "Expires in ${timeLeftSeconds / 60}:${(timeLeftSeconds % 60).toString().padStart(2, '0')}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
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
                            fontSize = 20.sp,
                            textAlign = TextAlign.Center
                        ),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = { onJoinCode(enteredCode) },
                        enabled = enteredCode.replace("-", "").length == 8,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Connect & Pair")
                    }
                }

                // Status message
                Spacer(modifier = Modifier.height(12.dp))
                when (pairingState) {
                    is PairingState.Connecting -> Text("Connecting to peer...", color = MaterialTheme.colorScheme.primary)
                    is PairingState.Connected -> Text("Connected! Verifying cryptographic commit...", color = MaterialTheme.colorScheme.secondary)
                    is PairingState.Success -> Text("Successfully paired with ${(pairingState as PairingState.Success).deviceName}!", color = MaterialTheme.colorScheme.secondary)
                    is PairingState.Error -> Text("Failed: ${(pairingState as PairingState.Error).reason}", color = MaterialTheme.colorScheme.error)
                    else -> {}
                }
            }
        }
    }
}

// Generate QR bitmap locally
fun generateQrBitmap(contents: String, size: Int): Bitmap? {
    return try {
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        // Draw simple stylized QR matrix fallback
        val canvas = android.graphics.Canvas(bitmap)
        canvas.drawColor(AndroidColor.WHITE)
        val paint = android.graphics.Paint().apply { color = AndroidColor.BLACK }

        val hash = contents.hashCode()
        val numBlocks = 15
        val blockSize = size / numBlocks

        for (x in 0 until numBlocks) {
            for (y in 0 until numBlocks) {
                // Fixed finder patterns at corners
                val isFinderTopLeft = x < 4 && y < 4
                val isFinderTopRight = x >= numBlocks - 4 && y < 4
                val isFinderBottomLeft = x < 4 && y >= numBlocks - 4

                val isFilled = if (isFinderTopLeft || isFinderTopRight || isFinderBottomLeft) {
                    (x == 0 || x == 3 || y == 0 || y == 3 || (x == 1 && y == 1) || (x == 2 && y == 2) || (x == numBlocks - 1) || (x == numBlocks - 4) || (y == numBlocks - 1) || (y == numBlocks - 4))
                } else {
                    ((x * 31 + y * 17 + hash) % 3 == 0)
                }

                if (isFilled) {
                    canvas.drawRect(
                        (x * blockSize).toFloat(),
                        (y * blockSize).toFloat(),
                        ((x + 1) * blockSize).toFloat(),
                        ((y + 1) * blockSize).toFloat(),
                        paint
                    )
                }
            }
        }
        bitmap
    } catch (e: Exception) {
        null
    }
}
