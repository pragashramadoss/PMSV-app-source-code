package com.pmsvgroup.nativeapp

import android.Manifest
import android.app.NotificationManager
import android.os.Build
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class NotificationNavigationTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    @Test fun postedNotificationOpensNativeUpdatesOnRepeatedTaps() {
        val context = compose.activity
        if (Build.VERSION.SDK_INT >= 33) InstrumentationRegistry.getInstrumentation().uiAutomation
            .grantRuntimePermission(context.packageName, Manifest.permission.POST_NOTIFICATIONS)
        val manager = context.getSystemService(NotificationManager::class.java)
        repeat(2) {
            compose.onNodeWithText("Settings", useUnmergedTree = true).performClick()
            assertTrue(Alerts.post(context, "Native notification test", "Open Updates", 101))
            compose.waitUntil(5000) { manager.activeNotifications.any { it.id == 101 } }
            manager.activeNotifications.first { it.id == 101 }.notification.contentIntent.send()
            compose.onNodeWithText("Updates & insights").assertIsDisplayed()
        }
        manager.cancel(101)
    }
    @Test fun currentScreenSurvivesActivityRecreation() {
        compose.onNodeWithText("Settings", useUnmergedTree = true).performClick()
        compose.onNodeWithText("Make PMSV yours").assertIsDisplayed()
        compose.activityRule.scenario.recreate()
        compose.onNodeWithText("Make PMSV yours").assertIsDisplayed()
    }
}
