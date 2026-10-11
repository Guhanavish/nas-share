package com.nas.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = Primary,
    secondary = Secondary,
    background = DarkBackground,
    surface = DarkSurface,
    surfaceVariant = DarkSurfaceVariant,
    onPrimary = TextPrimary,
    onSecondary = TextPrimary,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    error = ErrorColor
)

@Composable
fun NasAppTheme(isTv: Boolean = false, content: @Composable () -> Unit) {
    // Same dark palette everywhere; per-screen type uses bodySp(isTv)/titleSp(isTv)
    // for 10-foot legibility + 5% overscan padding handled in posture.
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
