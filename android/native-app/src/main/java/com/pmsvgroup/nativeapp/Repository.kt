package com.pmsvgroup.nativeapp

import android.content.Context
import android.util.AtomicFile
import org.json.JSONObject
import java.io.File
import java.io.ByteArrayOutputStream
import java.net.HttpURLConnection
import java.net.URL

class PmsvRepository(context: Context) {
    private val cache = AtomicFile(File(context.filesDir, "native-news.json"))
    private val preferences = context.getSharedPreferences("pmsv-native", Context.MODE_PRIVATE)
    fun cached(): List<NewsItem> = runCatching { NewsCodec.parse(String(cache.readFully(), Charsets.UTF_8)) }.getOrDefault(emptyList())
    fun refreshedAt(): Long = preferences.getLong("refreshedAt", 0)
    fun refresh(): List<NewsItem> {
        val raw = get("news")
        val items = NewsCodec.parse(raw)
        if (items.isEmpty()) throw IllegalStateException("No updates were returned. Your previous updates are still saved.")
        val stream = cache.startWrite()
        try { stream.write(NewsCodec.encode(items).toByteArray(Charsets.UTF_8)); cache.finishWrite(stream) }
        catch (e: Exception) { cache.failWrite(stream); throw e }
        preferences.edit().putLong("refreshedAt", System.currentTimeMillis()).apply()
        return items
    }
    fun saved(): List<NewsItem> = runCatching { NewsCodec.parse(preferences.getString("saved", "{\"news\":[]}")!!) }.getOrDefault(emptyList())
    fun save(items: List<NewsItem>) { preferences.edit().putString("saved", NewsCodec.encode(items)).apply() }
    fun digest(): Digest? {
        val o = JSONObject(get("push/latest"))
        return DigestCodec.parse(o)
    }
    private fun get(path: String): String {
        val connection = URL("https://pmsvgroup.com/api/$path").openConnection() as HttpURLConnection
        connection.connectTimeout = 12000
        connection.readTimeout = 15000
        connection.instanceFollowRedirects = false
        connection.setRequestProperty("Accept", "application/json")
        connection.setRequestProperty("User-Agent", "PMSV-Native/2.0 Android")
        try {
            if (connection.responseCode != 200) throw IllegalStateException("PMSV is temporarily unavailable. Your saved updates are available offline.")
            return connection.inputStream.use { input ->
                val bytes = ByteArrayOutputStream()
                val buffer = ByteArray(8192)
                var count = input.read(buffer)
                while (count != -1) {
                    require(bytes.size() + count <= 8 * 1024 * 1024) { "PMSV response is too large." }
                    bytes.write(buffer, 0, count)
                    count = input.read(buffer)
                }
                bytes.toString("UTF-8")
            }
        } finally { connection.disconnect() }
    }
}
