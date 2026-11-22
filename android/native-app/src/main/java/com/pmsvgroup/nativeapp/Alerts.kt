package com.pmsvgroup.nativeapp

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import java.util.concurrent.TimeUnit

data class NewsAlertResult(val posted: Boolean, val message: String)

object Alerts {
    const val CHANNEL = "pmsv_daily_native"
    internal const val WORK = "pmsv-native-daily-updates"
    private const val CATCH_UP = "pmsv-native-catch-up"
    private fun prefs(context: Context) = context.getSharedPreferences("pmsv-native-alerts", Context.MODE_PRIVATE)
    fun enabled(context: Context) = prefs(context).getBoolean("enabled", false)
    fun allowed(context: Context): Boolean {
        val permissionGranted = Build.VERSION.SDK_INT < 33 ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
        val channel = context.getSystemService(NotificationManager::class.java).getNotificationChannel(CHANNEL)
        return permissionGranted && NotificationManagerCompat.from(context).areNotificationsEnabled() &&
            channel?.importance != NotificationManager.IMPORTANCE_NONE
    }
    fun createChannel(context: Context) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel(CHANNEL, "PMSV daily updates", NotificationManager.IMPORTANCE_DEFAULT).apply {
            description = "Food safety and quality news from PMSV"
        })
    }
    fun setEnabled(context: Context, value: Boolean) {
        prefs(context).edit().putBoolean("enabled", value).apply()
        val manager = WorkManager.getInstance(context)
        if (!value) {
            manager.cancelUniqueWork(WORK)
            manager.cancelUniqueWork(CATCH_UP)
            return
        }
        reconcile(context)
    }

    fun reconcile(context: Context) {
        if (!enabled(context) || !allowed(context)) return
        createChannel(context)
        val manager = WorkManager.getInstance(context)
        val network = Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
        val periodic = PeriodicWorkRequestBuilder<DailyUpdatesWorker>(24, TimeUnit.HOURS)
            .setConstraints(network).build()
        manager.enqueueUniquePeriodicWork(WORK, ExistingPeriodicWorkPolicy.UPDATE, periodic)

        // A resume catch-up is useful if Android postponed the scheduled work,
        // but only one automatic network check is allowed per India calendar day.
        if (deliveredToday(context) || checkedToday(context)) return
        val catchUp = OneTimeWorkRequestBuilder<DailyUpdatesWorker>().setConstraints(network).build()
        manager.enqueueUniqueWork(CATCH_UP, ExistingWorkPolicy.KEEP, catchUp)
    }

    internal fun deliveredToday(context: Context) = last(context) == DigestCodec.dailyId(DigestCodec.today())
    internal fun checkedToday(context: Context, day: String = DigestCodec.today()): Boolean {
        val saved = prefs(context)
        return DailyCheckPolicy.alreadyChecked(
            saved.getString("lastDailyCheckDate", null),
            saved.getLong("lastDailyCheck", 0L),
            day
        )
    }
    @Synchronized
    internal fun claimDailyCheck(context: Context): Boolean {
        val day = DigestCodec.today()
        if (checkedToday(context, day)) return false
        // Persist before fetching, preventing the periodic and app-open workers
        // from checking twice if they start together or the server times out.
        return prefs(context).edit()
            .putString("lastDailyCheckDate", day)
            .putLong("lastDailyCheck", System.currentTimeMillis())
            .commit()
    }
    fun post(context: Context, title: String, body: String, id: Int = 100): Boolean {
        if (!allowed(context)) return false
        createChannel(context)
        val intent = Intent(context, MainActivity::class.java).putExtra("screen", "updates")
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val pending = PendingIntent.getActivity(context, id, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notification = NotificationCompat.Builder(context, CHANNEL).setSmallIcon(R.drawable.ic_notification)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.pmsv_logo))
            .setColor(Color.rgb(49, 85, 217))
            .setContentTitle(title).setContentText(body).setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pending).setAutoCancel(true).build()
        return try { NotificationManagerCompat.from(context).notify(id, notification); true } catch (_: SecurityException) { false }
    }
    fun last(context: Context) = prefs(context).getString("lastDigest", "")
    fun mark(context: Context, id: String) { prefs(context).edit().putString("lastDigest", id).apply() }

    suspend fun previewLatest(context: Context, load: () -> NewsSnapshot = { PmsvRepository(context).latestNews() }): NewsAlertResult = withContext(Dispatchers.IO) {
        if (!allowed(context)) return@withContext NewsAlertResult(false,
            "Android has not allowed notifications. Open notification settings below.")
        val snapshot = load()
        val digest = DigestCodec.latestAvailable(snapshot.items) ?: return@withContext NewsAlertResult(false,
            if (snapshot.fromCache) "Could not load news. Connect to the internet and try again."
            else "No news headlines are available yet. Try again later.")
        currentCoroutineContext().ensureActive()
        // Manual previews must not mark today's digest delivered or enable background alerts.
        if (!post(context, digest.title, digest.body, 101)) return@withContext NewsAlertResult(false,
            "Android has not allowed notifications. Open notification settings below.")
        NewsAlertResult(true, if (snapshot.fromCache)
            "Saved headlines from ${displayDate(digest.date)} posted. Could not refresh; showing news already on this phone."
            else "Headlines from ${displayDate(digest.date)} posted. Tap the notification to open Updates.")
    }

    @Synchronized
    internal fun deliverDaily(context: Context, digest: Digest?): Boolean {
        if (digest == null || !enabled(context) || digest.id == last(context)) return false
        if (!post(context, digest.title, digest.body)) return false
        mark(context, digest.id)
        return true
    }
}

class DailyUpdatesWorker(context: Context, parameters: WorkerParameters) : Worker(context, parameters) {
    override fun doWork(): Result {
        val context = applicationContext
        if (!Alerts.enabled(context) || !Alerts.allowed(context) || Alerts.deliveredToday(context)) return Result.success()
        if (!Alerts.claimDailyCheck(context)) return Result.success()
        return try {
            val digest = PmsvRepository(context).digest()
            Alerts.deliverDaily(context, digest)
            Result.success()
        } catch (_: Exception) {
            // Strictly once a day: do not retry the network request again today.
            Result.success()
        }
    }
}
