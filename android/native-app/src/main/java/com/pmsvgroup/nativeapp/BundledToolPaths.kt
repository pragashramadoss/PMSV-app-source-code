package com.pmsvgroup.nativeapp

import java.net.URI

/** Keep the existing secure origin so upgrades retain users' saved tool records. */
internal object BundledToolPaths {
    private fun path(url: String): String? {
        if (!Links.isPmsv(url)) return null
        return runCatching { URI(url).path.removePrefix("/wp-content/plugins/pmsv-original-app-preview/public") }.getOrNull()
    }
    fun isLocal(url: String): Boolean {
        val path = path(url) ?: return false
        return path == "/audits" || path.startsWith("/audits/") || path == "/fssai-license" || path.startsWith("/fssai-license/") || path.startsWith("/brand/")
    }
    fun asset(url: String): String? {
        val path = path(url) ?: return null
        if (path.split('/').any { it == "." || it == ".." } || '\\' in path) return null
        return when {
            path in listOf("/audits", "/audits/") -> "tools/audits/index.html"
            path in listOf("/fssai-license", "/fssai-license/") -> "tools/fssai-license/index.html"
            path == "/brand/pmsv-family.png" -> "tools/brand/pmsv-family.png"
            Regex("/(audits|fssai-license)/[A-Za-z0-9_-]+\\.(html|css|js)").matches(path) -> "tools$path"
            else -> null
        }
    }
}
