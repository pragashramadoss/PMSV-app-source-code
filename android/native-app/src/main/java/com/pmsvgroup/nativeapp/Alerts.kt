package com.pmsvgroup.nativeapp

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.*
import java.util.concurrent.TimeUnit

object Alerts {
    const val CHANNEL = "pmsv_daily_native"
    private const val WORK = "pmsv-native-daily-updates"
    private fun prefs(context: Context) = context.getSharedPreferences("pmsv-native-alerts", Context.MODE_PRIVATE)
    fun enabled(context: Context) = prefs(context).getBoolean("enabled", false)
    fun allowed(context: Context): Boolean = (Build.VERSION.SDK_INT < 33 ||
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) &&
        NotificationManagerCompat.from(context).areNotificationsEnabled()
    fun createChannel(context: Context) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel(CHANNEL, "PMSV daily updates", NotificationManager.IMPORTANCE_DEFAULT).apply {
            description = "Food safety and quality news from PMSV"
        })
    }
    fun setEnabled(context: Context, value: Boolean) {
        prefs(context).edit().putBoolean("enabled", value).apply()
        val manager = WorkManager.getInstance(context)
        if (!value) { manager.cancelUniqueWork(WORK); return }
        createChannel(context)
        val request = PeriodicWorkRequestBuilder<DailyUpdatesWorker>(30, TimeUnit.MINUTES)
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build()
        manager.enqueueUniquePeriodicWork(WORK, ExistingPeriodicWorkPolicy.KEEP, request)
    }
    fun post(context: Context, title: String, body: String, id: Int = 100): Boolean {
        if (!allowed(context)) return false
        createChannel(context)
        val intent = Intent(context, MainActivity::class.java).putExtra("screen", "updates")
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val pending = PendingIntent.getActivity(context, id, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notification = NotificationCompat.Builder(context, CHANNEL).setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title).setContentText(body).setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pending).setAutoCancel(true).build()
        return try { NotificationManagerCompat.from(context).notify(id, notification); true } catch (_: SecurityException) { false }
    }
    fun last(context: Context) = prefs(context).getString("lastDigest", "")
    fun mark(context: Context, id: String) { prefs(context).edit().putString("lastDigest", id).apply() }
}

class DailyUpdatesWorker(context: Context, parameters: WorkerParameters) : Worker(context, parameters) {
    override fun doWork(): Result {
        if (!Alerts.enabled(applicationContext) || !Alerts.allowed(applicationContext)) return Result.success()
        return try {
            val digest = PmsvRepository(applicationContext).digest() ?: return Result.success()
            if (digest.id == Alerts.last(applicationContext)) return Result.success()
            if (Alerts.enabled(applicationContext) && Alerts.post(applicationContext, digest.title, digest.body))
                Alerts.mark(applicationContext, digest.id)
            Result.success()
        } catch (_: Exception) { Result.retry() }
    }
}
