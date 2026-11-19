package com.pmsvgroup.nativeapp

import android.Manifest
import android.content.Intent
import android.app.NotificationManager
import android.app.Notification
import android.graphics.Bitmap
import android.os.Looper
import android.os.ParcelFileDescriptor
import android.os.Build
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.performClick
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertTrue
import org.junit.Assert.assertFalse
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Rule
import org.junit.Test
import kotlinx.coroutines.runBlocking
import java.io.File
import java.time.LocalDate
import java.time.ZoneId

class NotificationNavigationTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private val newsDate = LocalDate.now(ZoneId.of("Asia/Kolkata")).minusDays(1).toString()
    private val news = NewsItem("notification-news", "Cockroaches, rat droppings, recycled cooking oil: 9 KFC, Domino’s outlets shut after food safety raids in Hyderabad",
        "", newsDate, "Economic Times Retail", "Food safety news", "general", "india", "https://example.com/news")
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
                val result = runBlocking { Alerts.previewLatest(context) {
                    assertFalse(Looper.myLooper() == Looper.getMainLooper())
                    NewsSnapshot(listOf(news,
                        news.copy(id = "news2", title = "Maharashtra FDA suspends licenses of 2 iconic eateries in Pune over food safety violations"),
                        news.copy(id = "news3", title = "State FDA decides to withdraw plea challenging FSSAI jurisdiction")))
                } }
                assertTrue(result.message, result.posted)
                compose.waitUntil(5000) { manager.activeNotifications.any { it.id == 101 } }
                val notification = manager.activeNotifications.first { it.id == 101 }.notification
                assertEquals("News · ${displayDate(newsDate)}", notification.extras.getCharSequence(Notification.EXTRA_TITLE).toString())
                assertTrue(notification.extras.getCharSequence(Notification.EXTRA_BIG_TEXT).toString().contains(news.title))
                assertEquals(R.drawable.ic_notification, notification.smallIcon.resId)
                assertNotNull(notification.getLargeIcon())
                if (it == 0) captureNotification()
                notification.contentIntent.send()
                compose.onNodeWithText("Regulatory, food safety, quality, process excellence, certification and blog updates in one place.").assertIsDisplayed()
            }
        } finally {
            manager.cancel(101)
            // ActivityScenario tracks lifecycle by the original launch intent.
            // Restore it only after asserting both real notification destinations.
            compose.runOnUiThread { context.intent = launchIntent }
        }
    }
    @Test fun cachedPreviewReportsItsDateAndDoesNotConsumeTheDailyDigest() {
        val context = compose.activity
        if (Build.VERSION.SDK_INT >= 33) InstrumentationRegistry.getInstrumentation().uiAutomation
            .grantRuntimePermission(context.packageName, Manifest.permission.POST_NOTIFICATIONS)
        val previous = Alerts.last(context)
        val enabled = Alerts.enabled(context)
        try {
            val result = runBlocking { Alerts.previewLatest(context) { NewsSnapshot(listOf(news), fromCache = true) } }
            assertTrue(result.posted)
            assertTrue(result.message.startsWith("Saved headlines from ${displayDate(newsDate)}"))
            assertEquals(previous, Alerts.last(context))
            assertEquals(enabled, Alerts.enabled(context))
        } finally { context.getSystemService(NotificationManager::class.java).cancel(101) }
    }
    @Test fun missingNewsDoesNotPostAPretendTestMessage() {
        val context = compose.activity
        if (Build.VERSION.SDK_INT >= 33) InstrumentationRegistry.getInstrumentation().uiAutomation
            .grantRuntimePermission(context.packageName, Manifest.permission.POST_NOTIFICATIONS)
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.cancel(101)
        val result = runBlocking { Alerts.previewLatest(context) { NewsSnapshot(emptyList(), fromCache = true) } }
        assertFalse(result.posted)
        assertTrue(result.message.contains("Connect to the internet"))
        assertFalse(manager.activeNotifications.any { it.id == 101 })
    }
    @Test fun dailyNewsPostsOnlyOnceAndWaitsWhenTodayHasNoHeadlines() {
        val context = compose.activity
        if (Build.VERSION.SDK_INT >= 33) InstrumentationRegistry.getInstrumentation().uiAutomation
            .grantRuntimePermission(context.packageName, Manifest.permission.POST_NOTIFICATIONS)
        val prefs = context.getSharedPreferences("pmsv-native-alerts", android.content.Context.MODE_PRIVATE)
        val enabled = Alerts.enabled(context)
        val previous = Alerts.last(context)
        val digest = Digest("fixture-day", "Daily news", "1. ${news.title}")
        try {
            prefs.edit().putBoolean("enabled", true).remove("lastDigest").commit()
            assertFalse(Alerts.deliverDaily(context, null))
            assertEquals("", Alerts.last(context))
            assertTrue(Alerts.deliverDaily(context, digest))
            assertFalse(Alerts.deliverDaily(context, digest))
            assertEquals(digest.id, Alerts.last(context))
            prefs.edit().putBoolean("enabled", false).commit()
            assertFalse(Alerts.deliverDaily(context, digest.copy(id = "next-day")))
        } finally {
            prefs.edit().putBoolean("enabled", enabled).putString("lastDigest", previous).commit()
            context.getSystemService(NotificationManager::class.java).cancel(100)
        }
    }

    @Test fun reopeningRepairsMissingPeriodicWorkForAnOptedInDevice() {
        val context = compose.activity
        if (Build.VERSION.SDK_INT >= 33) InstrumentationRegistry.getInstrumentation().uiAutomation
            .grantRuntimePermission(context.packageName, Manifest.permission.POST_NOTIFICATIONS)
        val prefs = context.getSharedPreferences("pmsv-native-alerts", android.content.Context.MODE_PRIVATE)
        val oldEnabled = Alerts.enabled(context)
        val oldDigest = Alerts.last(context)
        val work = androidx.work.WorkManager.getInstance(context)
        try {
            work.cancelUniqueWork(Alerts.WORK).result.get()
            prefs.edit().putBoolean("enabled", true).putString("lastDigest", DigestCodec.dailyId(DigestCodec.today())).commit()
            Alerts.reconcile(context)
            val job = work.getWorkInfosForUniqueWork(Alerts.WORK).get().single { !it.state.isFinished }
            Alerts.reconcile(context)
            assertEquals(job.id, work.getWorkInfosForUniqueWork(Alerts.WORK).get().single { !it.state.isFinished }.id)
        } finally {
            work.cancelUniqueWork(Alerts.WORK).result.get()
            prefs.edit().putBoolean("enabled", oldEnabled).putString("lastDigest", oldDigest).commit()
            if (oldEnabled) Alerts.reconcile(context)
        }
    }

    private fun captureNotification() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val automation = instrumentation.uiAutomation
        fun shell(command: String) {
            ParcelFileDescriptor.AutoCloseInputStream(instrumentation.uiAutomation.executeShellCommand(command)).use { it.readBytes() }
        }
        fun capture() {
            val file = File(instrumentation.targetContext.getExternalFilesDir(null), "qa/native-news-notification.png")
            file.parentFile!!.mkdirs()
            file.outputStream().use { automation.takeScreenshot().compress(Bitmap.CompressFormat.PNG, 100, it) }
            shell("mkdir -p /sdcard/Download/pmsv-native-qa")
            shell("cp ${file.absolutePath} /sdcard/Download/pmsv-native-qa/${file.name}")
        }
        try {
            shell("cmd statusbar expand-notifications")
            try {
                // Android 16 can omit notification text from accessibility queries
                // even when it is painted correctly. Payload/icon assertions above
                // verify content; this screenshot is reviewed visually in CI output.
                automation.waitForIdle(1000, 10000)
            } finally {
                // Preserve evidence even if System UI never becomes idle.
                capture()
            }
        } finally {
            shell("cmd statusbar collapse")
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
