package com.pmsvgroup.nativeapp

import android.content.res.AssetManager
import android.webkit.WebResourceResponse
import java.io.ByteArrayInputStream
import java.io.IOException

/** APK assets, never a website/cache fallback, supply the audit and licence tools. */
internal class BundledTools(private val assets: AssetManager, private val shellCss: String) {
    fun response(url: String): WebResourceResponse? {
        if (!BundledToolPaths.isLocal(url)) return null
        val path = BundledToolPaths.asset(url) ?: return missing()
        return try {
            val mime = when (path.substringAfterLast('.')) {
                "html" -> "text/html"
                "css" -> "text/css"
                "js" -> "application/javascript"
                "png" -> "image/png"
                else -> return missing()
            }
            val input = if (mime == "text/html") {
                // Render the app layout from the first frame, with no duplicate chrome.
                val html = assets.open(path).bufferedReader().use { it.readText() }
                    .replaceFirst("<html", "<html data-pmsv-native=\"${ToolPages.section(url)}\"")
                    .replace("</head>", "<style id=\"pmsv-native-shell\">$shellCss</style></head>")
                ByteArrayInputStream(html.toByteArray(Charsets.UTF_8))
            } else assets.open(path)
            WebResourceResponse(mime, if (mime == "image/png") null else "UTF-8", 200, "OK",
                mapOf("Cache-Control" to "no-store", "X-PMSV-Content" to "installed-app",
                    "Content-Security-Policy" to "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'"), input)
        } catch (_: IOException) { missing() }
    }
    private fun missing() = WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
        mapOf("Cache-Control" to "no-store"), ByteArrayInputStream("Tool file is not included in this app version.".toByteArray()))
}
