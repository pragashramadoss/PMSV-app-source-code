package com.pmsvgroup.nativeapp

import org.json.JSONArray
import org.json.JSONObject
import java.net.URI
import java.time.LocalDate
import java.time.format.DateTimeFormatter

data class NewsItem(
    val id: String, val title: String, val summary: String, val published: String,
    val source: String, val category: String, val tab: String, val region: String, val url: String
) {
    fun json() = JSONObject().put("id", id).put("title", title).put("summary", summary)
        .put("published", published).put("source", source).put("category", category)
        .put("tab", tab).put("region", region).put("url", url)
}

object NewsCodec {
    fun parse(raw: String): List<NewsItem> {
        val array = JSONObject(raw).getJSONArray("news")
        return (0 until array.length()).mapNotNull { i ->
            runCatching {
                val o = array.getJSONObject(i)
                val id = o.getString("id").takeIf { it.isNotBlank() } ?: return@runCatching null
                val title = o.getString("title").takeIf { it.isNotBlank() } ?: return@runCatching null
                val url = o.getString("url")
                if (!Links.isHttps(url)) return@runCatching null
                val date = o.getString("published")
                LocalDate.parse(date)
                NewsItem(id, title, o.optString("summary"), date, o.optString("source"),
                    o.optString("category"), o.optString("tab"), o.optString("region"), url)
            }.getOrNull()
        }.distinctBy { it.id }.sortedWith(compareByDescending<NewsItem> { it.published }.thenBy { it.title })
    }
    fun encode(items: List<NewsItem>): String = JSONObject().put("news", JSONArray(items.map { it.json() })).toString()
}

object Links {
    fun isHttps(raw: String): Boolean = runCatching {
        val u = URI(raw)
        u.scheme == "https" && !u.host.isNullOrBlank() && u.userInfo == null && u.port == -1
    }.getOrDefault(false)
    fun isPmsv(raw: String): Boolean = isHttps(raw) && URI(raw).host == "pmsvgroup.com"
    fun nativeDestination(raw: String): String? {
        if (!isPmsv(raw)) return null
        return when (URI(raw).path.orEmpty().trimEnd('/')) {
            "" -> "home"
            "/updates" -> "updates"
            "/blogs" -> "blogs"
            else -> null
        }
    }
}

fun filteredNews(items: List<NewsItem>, category: String, query: String): List<NewsItem> {
    val words = query.trim().split(Regex("\\s+")).filter { it.isNotBlank() }
    return items.filter { item ->
        val text = "${item.title} ${item.summary} ${item.source} ${item.category} ${item.region} ${item.published} ${displayDate(item.published)}"
        (category == "all" || item.tab == category) && words.all { word ->
            // A search for day 6 must not match the 6 inside the year 2026.
            if (word.all { it.isDigit() }) Regex("(?<!\\d)${Regex.escape(word)}(?!\\d)").containsMatchIn(text)
            else text.contains(word, ignoreCase = true)
        }
    }
}

fun displayDate(value: String): String = runCatching {
    LocalDate.parse(value).format(DateTimeFormatter.ofPattern("d MMM yyyy"))
}.getOrDefault(value)

data class Digest(val id: String, val title: String, val body: String, val date: String = "")

// This pure policy can be tested without Android WorkManager. Legacy check
// timestamps are interpreted in India time during the first upgraded launch.
internal object DailyCheckPolicy {
    fun alreadyChecked(lastDay: String?, legacyCheckMillis: Long, today: String): Boolean {
        if (lastDay != null) return lastDay == today
        if (legacyCheckMillis <= 0L) return false
        return runCatching {
            java.time.Instant.ofEpochMilli(legacyCheckMillis)
                .atZone(java.time.ZoneId.of("Asia/Kolkata"))
                .toLocalDate().toString() == today
        }.getOrDefault(false)
    }
}

object DigestCodec {
    fun today(): String = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata")).toString()
    fun dailyId(date: String) = "pmsv-news-$date"

    fun parse(o: JSONObject, today: String = DigestCodec.today()): Digest? {
        val date = o.optString("date")
        if (o.optInt("count", 0) <= 0 || date != today || o.optString("body").isBlank()) return null
        // The website reuses its tag; date is essential to avoid suppressing tomorrow's alert.
        return Digest(dailyId(date), o.optString("title", "PMSV updates"), o.getString("body"), date)
    }

    // A manual preview can show the latest available day, including yesterday.
    // Keep its real publication date; automatic daily alerts still require today.
    fun latestAvailable(items: List<NewsItem>, today: String = DigestCodec.today()): Digest? {
        val eligible = items.filter { it.tab != "blogs" && it.title.isNotBlank() &&
            runCatching { !LocalDate.parse(it.published).isAfter(LocalDate.parse(today)) }.getOrDefault(false) }
        val date = eligible.maxOfOrNull { it.published } ?: return null
        val headlines = eligible.filter { it.published == date }
            .sortedWith(compareBy<NewsItem> { if (it.region == "india") 0 else 1 }.thenBy { it.title })
            .distinctBy { it.title.trim().lowercase(java.util.Locale.ROOT) }.take(3)
        val body = headlines.mapIndexed { index, item ->
            "${index + 1}. ${item.title.replace(Regex("\\s+"), " ").trim().take(300)}"
        }.joinToString("\n")
        return Digest(dailyId(date), "News · ${displayDate(date)}", body, date)
    }
}
