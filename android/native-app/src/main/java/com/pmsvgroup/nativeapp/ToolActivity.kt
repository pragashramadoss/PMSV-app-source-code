package com.pmsvgroup.nativeapp

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.view.ViewGroup
import android.webkit.*
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat

/** Existing forms share the native app shell while their content is being migrated. */
class ToolActivity : ComponentActivity() {
    private lateinit var web: WebView
    private var section by mutableStateOf("")
    private var loading by mutableStateOf(true)
    private var failed by mutableStateOf(false)
    private var alertEnabled by mutableStateOf(false)
    private var alertAllowed by mutableStateOf(false)
    private var pageGeneration = 0L
    private val permission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        alertAllowed = granted && Alerts.allowed(this)
        if (alertAllowed) { Alerts.setEnabled(this, true); alertEnabled = true }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val initialUrl = intent.getStringExtra("url") ?: return finish()
        if (!Links.isPmsv(initialUrl)) return finish()
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.light(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.light(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT))
        val shellCss = assets.open("native-tool-shell.css").bufferedReader().use { it.readText() }
        section = ToolPages.section(initialUrl)
        web = WebView(this).apply {
            visibility = View.INVISIBLE
            setBackgroundColor(android.graphics.Color.rgb(245, 247, 250))
            settings.apply {
                javaScriptEnabled = true; domStorageEnabled = true
                allowFileAccess = false; allowContentAccess = false
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                javaScriptCanOpenWindowsAutomatically = false
                setSupportMultipleWindows(false)
            }
            CookieManager.getInstance().setAcceptThirdPartyCookies(this, false)
            // Save / Reset / Finish forms keep their standard JavaScript dialogs.
            webChromeClient = WebChromeClient()
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    val target = request.url.toString()
                    val destination = if (request.isForMainFrame) Links.nativeDestination(target) else null
                    if (destination != null) { openNative(destination); return true }
                    if (Links.isPmsv(target)) return false
                    if (request.isForMainFrame && Links.isHttps(target))
                        runCatching { startActivity(Intent(Intent.ACTION_VIEW, request.url)) }
                    return true
                }
                override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
                    pageGeneration++
                    section = ToolPages.section(url)
                    loading = true; failed = false
                    view.visibility = View.INVISIBLE
                }
                override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                    if (request.isForMainFrame) showFailure()
                }
                override fun onReceivedHttpError(view: WebView, request: WebResourceRequest, error: WebResourceResponse) {
                    if (request.isForMainFrame && error.statusCode >= 400) showFailure()
                }
                override fun onPageFinished(view: WebView, url: String) {
                    if (failed || !Links.isPmsv(url)) return
                    val generation = pageGeneration
                    section = ToolPages.section(url)
                    // Only replace trusted pages' presentation. No JS bridge, storage
                    // changes, form edits or changes to licence/audit calculations.
                    view.evaluateJavascript(ToolPages.presentationScript(url, shellCss)) {
                        view.postVisualStateCallback(generation, object : WebView.VisualStateCallback() {
                            override fun onComplete(requestId: Long) {
                                if (generation == pageGeneration && !failed && !isDestroyed) {
                                    view.visibility = View.VISIBLE
                                    loading = false
                                }
                            }
                        })
                    }
                }
            }
            setDownloadListener { target, _, _, _, _ ->
                if (Links.isHttps(target)) runCatching { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(target))) }
                else Toast.makeText(this@ToolActivity, "For report downloads, use your current PMSV app while report sharing is being migrated.", Toast.LENGTH_LONG).show()
            }
        }
        setContent {
            var notifications by rememberSaveable { mutableStateOf(false) }
            PmsvTheme {
                BackHandler { if (web.canGoBack()) web.goBack() else finish() }
                Scaffold(containerColor = MaterialTheme.colorScheme.background,
                    topBar = { PmsvHeader(alertEnabled, alertAllowed,
                        onHome = { openNative("home") }, onNotifications = { notifications = true },
                        onSaved = { openNative("saved") }, onSettings = { openNative("settings") },
                        onRefresh = { web.reload() }, refreshEnabled = !loading, refreshLabel = "Refresh page") },
                    bottomBar = { PmsvNavigation(section, ::navigate) }) { padding ->
                    Box(Modifier.fillMaxSize().padding(padding).consumeWindowInsets(padding).imePadding()) {
                        AndroidView(factory = { web }, modifier = Modifier.fillMaxSize())
                        if (loading) LinearProgressIndicator(Modifier.fillMaxWidth(), color = MaterialTheme.colorScheme.secondary)
                        if (failed) Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                            Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("This tool could not load. Check your connection and try again.")
                                Spacer(Modifier.height(12.dp))
                                Button(onClick = { web.reload() }) { Text("Retry") }
                            }
                        }
                    }
                }
                if (notifications) PmsvNotificationDialog(alertEnabled, alertAllowed, ::toggleAlerts,
                    test = { Alerts.post(this, "PMSV native notification", "This notification opens your native PMSV Updates screen.", 101) },
                    settings = ::openSettings, onDismiss = { notifications = false })
            }
        }
        if (savedInstanceState == null || web.restoreState(savedInstanceState) == null) web.loadUrl(initialUrl)
        else section = ToolPages.section(web.url ?: initialUrl)
    }

    private fun showFailure() { failed = true; loading = false }
    private fun navigate(target: String) {
        val url = ToolPages.url(target)
        if (url != null) {
            // Re-tapping a section must not reset an in-progress form.
            if (section != target) web.loadUrl(url)
        } else openNative(target)
    }
    private fun openNative(target: String) {
        startActivity(Intent(this, MainActivity::class.java).putExtra("screen", target)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP))
        finish()
    }
    private fun toggleAlerts(value: Boolean) {
        if (!value) { Alerts.setEnabled(this, false); alertEnabled = false }
        else if (Alerts.allowed(this)) { Alerts.setEnabled(this, true); alertEnabled = true }
        else if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED)
            permission.launch(Manifest.permission.POST_NOTIFICATIONS)
        else openSettings()
    }
    private fun openSettings() { startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, packageName)) }
    override fun onResume() {
        super.onResume()
        alertEnabled = Alerts.enabled(this); alertAllowed = Alerts.allowed(this)
    }
    override fun onSaveInstanceState(outState: Bundle) {
        if (::web.isInitialized) web.saveState(outState)
        super.onSaveInstanceState(outState)
    }
    override fun onDestroy() {
        if (::web.isInitialized) { (web.parent as? ViewGroup)?.removeView(web); web.destroy() }
        super.onDestroy()
    }
    companion object {
        fun open(context: Context, title: String, url: String) {
            if (Links.isPmsv(url)) context.startActivity(Intent(context, ToolActivity::class.java).putExtra("url", url).putExtra("title", title))
        }
    }
}
