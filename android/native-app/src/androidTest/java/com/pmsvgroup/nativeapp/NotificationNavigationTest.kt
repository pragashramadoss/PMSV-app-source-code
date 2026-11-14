package com.pmsvgroup.nativeapp

import android.Manifest
import android.content.Intent
import android.app.NotificationManager
import android.os.Build
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.performClick
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class NotificationNavigationTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    @Test fun postedNotificationOpensNativeUpdatesOnRepeatedTaps() {
        val context = compose.activity
        val launchIntent = Intent(context.intent)
        if (Build.VERSION.SDK_INT >= 33) InstrumentationRegistry.getInstrumentation().uiAutomation
            .grantRuntimePermission(context.packageName, Manifest.permission.POST_NOTIFICATIONS)
        val manager = context.getSystemService(NotificationManager::class.java)
        try {
            repeat(2) {
                compose.onNodeWithContentDescription("More options").performClick()
                compose.onNodeWithText("Settings").performClick()
                assertTrue(Alerts.post(context, "Native notification test", "Open Updates", 101))
                compose.waitUntil(5000) { manager.activeNotifications.any { it.id == 101 } }
                manager.activeNotifications.first { it.id == 101 }.notification.contentIntent.send()
                compose.onNodeWithText("Regulatory, food safety, quality, process excellence, certification and blog updates in one place.").assertIsDisplayed()
            }
        } finally {
            manager.cancel(101)
            // ActivityScenario tracks lifecycle by the original launch intent.
            // Restore it only after asserting both real notification destinations.
            compose.runOnUiThread { context.intent = launchIntent }
        }
    }
    @Test fun currentScreenSurvivesActivityRecreation() {
        compose.onNodeWithContentDescription("More options").performClick()
        compose.onNodeWithText("Settings").performClick()
        compose.onNodeWithText("Daily update alerts").assertIsDisplayed()
        compose.activityRule.scenario.recreate()
        compose.onNodeWithText("Daily update alerts").assertIsDisplayed()
    }
}
