package com.nas.app.ui.components

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.util.Log
import android.view.ViewGroup
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.zxing.*
import com.google.zxing.common.HybridBinarizer
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

@Composable
fun QrCameraScanner(
    onCodeScanned: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasCameraPermission = granted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(280.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        if (hasCameraPermission) {
            CameraPreviewWithScanner(
                onQrCodeScanned = { rawText ->
                    val parsed = parsePairingCode(rawText)
                    if (parsed != null) {
                        onCodeScanned(parsed)
                    }
                }
            )
            ScanningReticle()
        } else {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier.padding(16.dp)
            ) {
                Icon(
                    Icons.Default.CameraAlt,
                    contentDescription = null,
                    tint = Color.White.copy(alpha = 0.7f),
                    modifier = Modifier.size(48.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    "Camera permission required to scan QR code",
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("Grant Permission")
                }
            }
        }
    }
}

@Composable
private fun CameraPreviewWithScanner(
    onQrCodeScanned: (String) -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val isScanned = remember { AtomicBoolean(false) }

    AndroidView(
        factory = { ctx ->
            val previewView = PreviewView(ctx).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                scaleType = PreviewView.ScaleType.FILL_CENTER
            }

            val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
            val cameraExecutor = Executors.newSingleThreadExecutor()

            cameraProviderFuture.addListener({
                try {
                    val cameraProvider = cameraProviderFuture.get()
                    val preview = Preview.Builder().build().also {
                        it.setSurfaceProvider(previewView.surfaceProvider)
                    }

                    val imageAnalysis = ImageAnalysis.Builder()
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                        .build()

                    val reader = MultiFormatReader().apply {
                        setHints(mapOf(DecodeHintType.POSSIBLE_FORMATS to listOf(BarcodeFormat.QR_CODE)))
                    }

                    imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                        if (isScanned.get()) {
                            imageProxy.close()
                            return@setAnalyzer
                        }

                        try {
                            val plane = imageProxy.planes[0]
                            val buffer = plane.buffer
                            val bytes = ByteArray(buffer.remaining())
                            buffer.get(bytes)

                            val source = PlanarYUVLuminanceSource(
                                bytes,
                                imageProxy.width,
                                imageProxy.height,
                                0,
                                0,
                                imageProxy.width,
                                imageProxy.height,
                                false
                            )

                            var binaryBitmap = BinaryBitmap(HybridBinarizer(source))
                            var resultText: String? = null

                            try {
                                val result = reader.decodeWithState(binaryBitmap)
                                resultText = result.text
                            } catch (_: Exception) {
                                // Try rotated
                                try {
                                    val rotatedSource = source.rotateCounterClockwise()
                                    binaryBitmap = BinaryBitmap(HybridBinarizer(rotatedSource))
                                    val result = reader.decodeWithState(binaryBitmap)
                                    resultText = result.text
                                } catch (_: Exception) {
                                    // Not found
                                }
                            }

                            if (resultText != null && isScanned.compareAndSet(false, true)) {
                                Log.d("QrCameraScanner", "Scanned QR: $resultText")
                                previewView.post {
                                    onQrCodeScanned(resultText)
                                }
                            }
                        } catch (e: Exception) {
                            Log.e("QrCameraScanner", "Analysis error", e)
                        } finally {
                            reader.reset()
                            imageProxy.close()
                        }
                    }

                    val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                    cameraProvider.unbindAll()
                    cameraProvider.bindToLifecycle(
                        lifecycleOwner,
                        cameraSelector,
                        preview,
                        imageAnalysis
                    )
                } catch (e: Exception) {
                    Log.e("QrCameraScanner", "Use case binding failed", e)
                }
            }, ContextCompat.getMainExecutor(ctx))

            previewView
        },
        modifier = Modifier.fillMaxSize()
    )
}

@Composable
private fun ScanningReticle() {
    val infiniteTransition = rememberInfiniteTransition(label = "scan_line")
    val lineOffset by infiniteTransition.animateFloat(
        initialValue = 0.15f,
        targetValue = 0.85f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scan_offset"
    )

    Canvas(modifier = Modifier.fillMaxSize()) {
        val reticleSize = size.minDimension * 0.7f
        val left = (size.width - reticleSize) / 2f
        val top = (size.height - reticleSize) / 2f
        val cornerLength = 28.dp.toPx()
        val cornerStroke = 3.5f.dp.toPx()
        val reticleColor = Color(0xFF3B82F6) // Primary blue

        // Dark dim overlay around reticle
        drawRoundRect(
            color = reticleColor.copy(alpha = 0.15f),
            topLeft = Offset(left, top),
            size = Size(reticleSize, reticleSize),
            cornerRadius = CornerRadius(12.dp.toPx())
        )

        // 4 Corner Brackets
        // Top-Left
        drawLine(reticleColor, Offset(left, top), Offset(left + cornerLength, top), cornerStroke)
        drawLine(reticleColor, Offset(left, top), Offset(left, top + cornerLength), cornerStroke)

        // Top-Right
        drawLine(reticleColor, Offset(left + reticleSize, top), Offset(left + reticleSize - cornerLength, top), cornerStroke)
        drawLine(reticleColor, Offset(left + reticleSize, top), Offset(left + reticleSize, top + cornerLength), cornerStroke)

        // Bottom-Left
        drawLine(reticleColor, Offset(left, top + reticleSize), Offset(left + cornerLength, top + reticleSize), cornerStroke)
        drawLine(reticleColor, Offset(left, top + reticleSize), Offset(left, top + reticleSize - cornerLength), cornerStroke)

        // Bottom-Right
        drawLine(reticleColor, Offset(left + reticleSize, top + reticleSize), Offset(left + reticleSize - cornerLength, top + reticleSize), cornerStroke)
        drawLine(reticleColor, Offset(left + reticleSize, top + reticleSize), Offset(left + reticleSize, top + reticleSize - cornerLength), cornerStroke)

        // Animated laser scan line
        val scanY = top + reticleSize * lineOffset
        drawLine(
            color = Color(0xFF10B981).copy(alpha = 0.85f),
            start = Offset(left + 8.dp.toPx(), scanY),
            end = Offset(left + reticleSize - 8.dp.toPx(), scanY),
            strokeWidth = 2.5f.dp.toPx()
        )
    }
}

/**
 * Extracts and formats pairing code from QR code content.
 * Accepts:
 *   - nas://join?room=XXXX-XXXX
 *   - nas://join?room=XXXXXXXX
 *   - Direct 8-character codes XXXX-XXXX or XXXXXXXX
 */
fun parsePairingCode(raw: String): String? {
    val trimmed = raw.trim()
    if (trimmed.startsWith("nas://join", ignoreCase = true)) {
        try {
            val uri = Uri.parse(trimmed)
            val room = uri.getQueryParameter("room")
            if (!room.isNullOrBlank()) {
                val clean = room.replace("-", "").uppercase()
                if (clean.length == 8) {
                    return "${clean.substring(0, 4)}-${clean.substring(4, 8)}"
                }
            }
        } catch (_: Exception) {}
    }

    // Direct code format
    val clean = trimmed.replace("-", "").uppercase()
    if (clean.length == 8 && clean.all { it in "ABCDEFGHJKMNPQRSTVWXYZ23456789" }) {
        return "${clean.substring(0, 4)}-${clean.substring(4, 8)}"
    }

    return null
}
