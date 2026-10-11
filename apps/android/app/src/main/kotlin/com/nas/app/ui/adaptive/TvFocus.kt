package com.nas.app.ui.adaptive

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.focusable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.unit.dp
import com.nas.app.ui.theme.Secondary

/**
 * Universal focus halo: visible on TV/D-pad, harmless on touch/mouse.
 * Scale + border, never color-only.
 */
@Composable
fun Modifier.universalFocusable(
    enabled: Boolean = true,
    onDpadCenter: (() -> Unit)? = null
): Modifier {
    val interaction = remember { MutableInteractionSource() }
    val focused by interaction.collectIsFocusedAsState()
    var mod = this
        .focusable(enabled = enabled, interactionSource = interaction)
        .onFocusChanged { }
    if (focused && enabled) {
        mod = mod
            .scale(1.03f)
            .border(BorderStroke(2.dp, Secondary), RoundedCornerShape(12.dp))
    }
    if (onDpadCenter != null && enabled) {
        mod = mod.onPreviewKeyEvent { event ->
            if (event.type == KeyEventType.KeyDown &&
                (event.key == Key.DirectionCenter || event.key == Key.Enter || event.key == Key.NumPadEnter)
            ) {
                onDpadCenter()
                true
            } else {
                false
            }
        }
    }
    return mod
}

@Composable
fun rememberTvFocusRequester(isTv: Boolean): FocusRequester {
    val requester = remember { FocusRequester() }
    return requester
}

fun Modifier.tvInitialFocus(
    requester: FocusRequester,
    enabled: Boolean
): Modifier = if (enabled) this.focusRequester(requester) else this

// TV type-scale helpers (10-foot): callers pick sizes based on posture.isTv
object TvTypeScale {
    const val BODY_PHONE_SP = 14
    const val BODY_TV_SP = 18
    const val TITLE_PHONE_SP = 16
    const val TITLE_TV_SP = 22
    const val HEADER_TV_SP = 28
}

fun bodySp(isTv: Boolean): Int = if (isTv) TvTypeScale.BODY_TV_SP else TvTypeScale.BODY_PHONE_SP
fun titleSp(isTv: Boolean): Int = if (isTv) TvTypeScale.TITLE_TV_SP else TvTypeScale.TITLE_PHONE_SP
