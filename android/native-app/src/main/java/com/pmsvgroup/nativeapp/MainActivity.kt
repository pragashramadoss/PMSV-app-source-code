package com.pmsvgroup.nativeapp

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.runtime.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle

class MainActivity : ComponentActivity() {
    private val model: PmsvViewModel by viewModels()
    private var alertEnabled by mutableStateOf(false)
    private var alertAllowed by mutableStateOf(false)
    private var navigation by mutableStateOf(Pair("home", 0L))
    private val permission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        alertAllowed = granted && Alerts.allowed(this)
        if (alertAllowed) { Alerts.setEnabled(this, true); alertEnabled = true }
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        if (savedInstanceState == null) acceptIntent(intent)
        else navigation = (savedInstanceState.getString("navigationScreen") ?: "home") to savedInstanceState.getLong("navigationToken")
        setContent {
            val state by model.state.collectAsStateWithLifecycle()
            PmsvTheme {
                PmsvApp(state, navigation, model::refresh, model::toggleSaved,
                    openTool = { title, url -> ToolActivity.open(this, title, url) },
                    openSource = { item -> if (Links.isPmsv(item.url)) ToolActivity.open(this, item.source, item.url)
                        else runCatching { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(item.url))) } },
                    share = { item -> startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"; putExtra(Intent.EXTRA_TEXT, "${item.title}\n${item.url}")
                    }, "Share PMSV update")) },
                    alertsEnabled = alertEnabled, alertsAllowed = alertAllowed,
                    toggleAlerts = { value ->
                        if (!value) { Alerts.setEnabled(this, false); alertEnabled = false }
                        else if (Alerts.allowed(this)) { Alerts.setEnabled(this, true); alertEnabled = true }
                        else if (Build.VERSION.SDK_INT >= 33) permission.launch(Manifest.permission.POST_NOTIFICATIONS)
                        else openSettings()
                    },
                    testAlert = { Alerts.post(this, "PMSV native notification", "This notification opens your native PMSV Updates screen.", 101) },
                    openNotificationSettings = ::openSettings)
            }
        }
    }
    override fun onResume() {
        super.onResume()
        alertEnabled = Alerts.enabled(this)
        alertAllowed = Alerts.allowed(this)
        model.refreshIfStale()
    }
    override fun onSaveInstanceState(outState: Bundle) {
        outState.putString("navigationScreen", navigation.first)
        outState.putLong("navigationToken", navigation.second)
        super.onSaveInstanceState(outState)
    }
    override fun onNewIntent(intent: Intent) { super.onNewIntent(intent); setIntent(intent); acceptIntent(intent) }
    private fun acceptIntent(intent: Intent) {
        val screen = if (intent.getStringExtra("screen") == "updates") "updates" else "home"
        navigation = screen to System.nanoTime()
    }
    private fun openSettings() { startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, packageName)) }
}
