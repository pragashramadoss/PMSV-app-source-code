package com.pmsvgroup.nativeapp

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.*
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

/** Existing forms remain web tools during migration; native screens never use this activity. */
class ToolActivity : ComponentActivity() {
    private lateinit var web: WebView
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val url = intent.getStringExtra("url") ?: return finish()
        if (!Links.isPmsv(url)) return finish()
        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setBackgroundColor(Color.WHITE) }
        val toolbar = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(8, 4, 8, 4) }
        toolbar.addView(Button(this).apply { text = "Back"; setOnClickListener { onBackPressedDispatcher.onBackPressed() } })
        toolbar.addView(TextView(this).apply { text = intent.getStringExtra("title") ?: "PMSV tools"; textSize = 18f; setTextColor(Color.rgb(7,92,88)); setPadding(16,24,0,0) }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        root.addView(toolbar)
        val error = TextView(this).apply { visibility = android.view.View.GONE; setPadding(20,20,20,20); text = "This tool needs a connection. Use Retry when you are online." }
        root.addView(error)
        val retry = Button(this).apply { text = "Retry"; visibility = android.view.View.GONE }
        root.addView(retry)
        web = WebView(this)
        web.settings.apply {
            javaScriptEnabled = true; domStorageEnabled = true
            allowFileAccess = false; allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            javaScriptCanOpenWindowsAutomatically = false
            setSupportMultipleWindows(false)
        }
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false)
        // Existing Save / Reset / Finish forms use standard JavaScript dialogs.
        web.webChromeClient = WebChromeClient()
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val target = request.url.toString()
                val destination = if (request.isForMainFrame) Links.nativeDestination(target) else null
                if (destination != null) {
                    startActivity(Intent(this@ToolActivity, MainActivity::class.java)
                        .putExtra("screen", destination)
                        .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP))
                    finish()
                    return true
                }
                if (Links.isPmsv(target)) return false
                if (request.isForMainFrame && Links.isHttps(target)) runCatching { startActivity(Intent(Intent.ACTION_VIEW, request.url)) }
                return true
            }
            override fun onReceivedError(view: WebView, request: WebResourceRequest, failure: WebResourceError) {
                if (request.isForMainFrame) { error.visibility = android.view.View.VISIBLE; retry.visibility = android.view.View.VISIBLE }
            }
            override fun onPageFinished(view: WebView, url: String) { /* Never change the user's page or inject a JavaScript bridge. */ }
        }
        retry.setOnClickListener { error.visibility = android.view.View.GONE; retry.visibility = android.view.View.GONE; web.reload() }
        web.setDownloadListener { target, _, _, _, _ ->
            if (Links.isHttps(target)) runCatching { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(target))) }
            else Toast.makeText(this, "For report downloads, use your current PMSV app while report sharing is being migrated.", Toast.LENGTH_LONG).show()
        }
        root.addView(web, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))
        setContentView(root)
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom); insets
        }
        if (savedInstanceState == null || web.restoreState(savedInstanceState) == null) web.loadUrl(url)
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() { if (web.canGoBack()) web.goBack() else finish() }
        })
    }
    override fun onSaveInstanceState(outState: Bundle) { web.saveState(outState); super.onSaveInstanceState(outState) }
    override fun onDestroy() { if (::web.isInitialized) { (web.parent as? ViewGroup)?.removeView(web); web.destroy() }; super.onDestroy() }
    companion object {
        fun open(context: Context, title: String, url: String) {
            if (Links.isPmsv(url)) context.startActivity(Intent(context, ToolActivity::class.java).putExtra("url", url).putExtra("title", title))
        }
    }
}
