package com.pmsvgroup.nativeapp

import java.net.URI
import org.json.JSONObject

/** Trusted page classification also follows subpages reached through web links. */
internal object ToolPages {
    fun section(url: String): String {
        if (!Links.isPmsv(url)) return ""
        val path = runCatching { URI(url).path }.getOrNull().orEmpty().trimEnd('/')
        return when {
            path == "/audits" || path.startsWith("/audits/") || path.startsWith("/wp-content/plugins/pmsv-original-app-preview/public/audits/") -> "audits"
            path == "/fssai-license" || path.startsWith("/fssai-license/") || path.startsWith("/wp-content/plugins/pmsv-original-app-preview/public/fssai-license/") -> "licence"
            path == "/discussions" || path.startsWith("/discussions/") -> "discussions"
            path == "/blogs" || path.startsWith("/blogs/") -> "blogs"
            else -> ""
        }
    }
    fun url(section: String): String? = when (section) {
        "audits" -> "https://pmsvgroup.com/audits/index.html"
        "licence" -> "https://pmsvgroup.com/fssai-license"
        "discussions" -> "https://pmsvgroup.com/discussions"
        else -> null
    }
    fun presentationScript(url: String, css: String): String {
        if (!Links.isPmsv(url)) return "false"
        return """
            (() => {
                if (location.protocol !== 'https:' || location.hostname !== 'pmsvgroup.com') return false;
                document.documentElement.setAttribute('data-pmsv-native', ${JSONObject.quote(section(url))});
                let style = document.getElementById('pmsv-native-shell');
                if (!style) { style = document.createElement('style'); style.id = 'pmsv-native-shell'; document.head.appendChild(style); }
                style.textContent = ${JSONObject.quote(css)};
                return true;
            })()
        """.trimIndent()
    }
}
