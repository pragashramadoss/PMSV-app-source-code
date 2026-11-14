package com.pmsvgroup.nativeapp

import android.content.Intent
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test

class NotificationNavigationTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    @Test fun notificationIntentOpensNativeUpdatesOnRepeatedTaps() {
        repeat(2) {
            compose.onNodeWithText("Settings", useUnmergedTree = true).performClick()
            compose.activityRule.scenario.onActivity { activity ->
                activity.startActivity(Intent(activity, MainActivity::class.java).putExtra("screen", "updates")
                    .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP))
            }
            compose.onNodeWithText("Updates & insights").assertIsDisplayed()
        }
    }
}
