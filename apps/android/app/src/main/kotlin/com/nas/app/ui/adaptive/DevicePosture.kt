package com.nas.app.ui.adaptive

import android.app.UiModeManager
import android.content.Context
import android.content.res.Configuration
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Single universal-APK posture model.
 * One APK adapts to phone / tablet / foldable / TV + touch / d-pad / mouse.
 */
enum class DeviceClass {
    PHONE,
    TABLET,
    FOLDABLE,
    TV
}

enum class InputKind {
    TOUCH,
    DPAD,
    MIXED
}

data class UniversalPosture(
    val deviceClass: DeviceClass,
    val isTv: Boolean,
    val isLandscape: Boolean,
    val widthDp: Int,
    val columns: Int,
    val horizontalPadding: Dp,
    val verticalPadding: Dp,
    val inputKind: InputKind,
    val useTwoPane: Boolean,
    val useTopTabs: Boolean
)

@Composable
fun rememberUniversalPosture(): UniversalPosture {
    val context = LocalContext.current
    val config = LocalConfiguration.current

    return remember(config.screenWidthDp, config.orientation) {
        val uiModeManager = context.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
        val isTv = uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION ||
            config.uiMode and Configuration.UI_MODE_TYPE_MASK == Configuration.UI_MODE_TYPE_TELEVISION

        val widthDp = config.screenWidthDp
        val isLandscape = config.orientation == Configuration.ORIENTATION_LANDSCAPE

        // Foldable heuristic: medium width + landscape + non-TV with touch
        val isFoldableHalfOpen = !isTv && widthDp in 600..900 && isLandscape

        val deviceClass = when {
            isTv -> DeviceClass.TV
            isFoldableHalfOpen -> DeviceClass.FOLDABLE
            widthDp >= 840 -> DeviceClass.TABLET
            widthDp >= 600 -> DeviceClass.TABLET
            else -> DeviceClass.PHONE
        }

        val columns = when (deviceClass) {
            DeviceClass.TV -> if (widthDp >= 1900) 3 else 2
            DeviceClass.TABLET -> if (isLandscape) 2 else 1
            DeviceClass.FOLDABLE -> 2
            DeviceClass.PHONE -> 1
        }

        UniversalPosture(
            deviceClass = deviceClass,
            isTv = isTv,
            isLandscape = isLandscape,
            widthDp = widthDp,
            columns = columns,
            // 5% overscan-safe on TV, compact on phone
            horizontalPadding = if (isTv) 48.dp else 16.dp,
            verticalPadding = if (isTv) 27.dp else 8.dp,
            inputKind = when {
                isTv -> InputKind.DPAD
                else -> InputKind.MIXED
            },
            useTwoPane = deviceClass == DeviceClass.TABLET && isLandscape ||
                deviceClass == DeviceClass.FOLDABLE,
            useTopTabs = isTv
        )
    }
}

@Composable
fun AdaptiveContent(
    content: @Composable (UniversalPosture) -> Unit
) {
    BoxWithConstraints {
        val posture = rememberUniversalPosture()
        content(posture)
    }
}
