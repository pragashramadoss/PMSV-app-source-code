package com.pmsvgroup.nativeapp

import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test

class NewsTest {
    private val milk = NewsItem("milk", "Milk logo amendment", "Graphic specifications", "2026-11-06", "FSSAI", "Gazette notification", "fssai", "india", "https://www.fssai.gov.in/milk.pdf")
    private val news = milk.copy(id = "news", title = "Food safety news", tab = "general", category = "Food safety news", region = "world", published = "2026-11-14", url = "https://example.com/news")
    @Test fun roundTripPreservesSavedSummariesAndOfficialLinks() {
        assertEquals(listOf(news, milk), NewsCodec.parse(NewsCodec.encode(listOf(milk, news))))
    }
    @Test fun fssaiSearchIncludesSixNovemberMilkAmendment() {
        assertEquals(listOf(milk), filteredNews(listOf(news, milk), "fssai", "milk logo"))
        assertEquals(listOf(milk), filteredNews(listOf(news, milk), "all", "gazette INDIA"))
        assertTrue(filteredNews(listOf(milk), "general", "milk").isEmpty())
    }
    @Test fun malformedEntryDoesNotHideOtherUpdates() {
        val json = JSONObject(NewsCodec.encode(listOf(milk, news)))
        json.getJSONArray("news").getJSONObject(0).put("published", "bad")
        assertEquals(listOf(news), NewsCodec.parse(json.toString()))
    }
    @Test fun publicLinksRejectExecutableSchemesAndSpoofedPmsvOrigins() {
        for (url in listOf("javascript:alert(1)", "file:///etc/passwd", "http://pmsvgroup.com", "https://attacker@pmsvgroup.com/", "https://pmsvgroup.com:444/")) assertFalse(url, Links.isHttps(url))
        assertFalse(Links.isPmsv("https://pmsvgroup.com.evil.example/"))
        assertTrue(Links.isPmsv("https://pmsvgroup.com/audits/index.html"))
    }
    @Test fun dailyDigestUsesDateSoTomorrowCanNotifyAgain() {
        val json = JSONObject().put("tag", "pmsv-news").put("date", "2026-11-14").put("count", 3).put("body", "Daily headlines")
        assertEquals("pmsv-news-2026-11-14", DigestCodec.parse(json, "2026-11-14")!!.id)
        assertNull(DigestCodec.parse(json, "2026-11-15"))
        json.put("date", "2026-11-15")
        assertEquals("pmsv-news-2026-11-15", DigestCodec.parse(json, "2026-11-15")!!.id)
        json.put("count", 0)
        assertNull(DigestCodec.parse(json, "2026-11-15"))
    }
}
