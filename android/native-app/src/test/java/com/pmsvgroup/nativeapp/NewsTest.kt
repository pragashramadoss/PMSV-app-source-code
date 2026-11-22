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
    @Test fun searchAcceptsDisplayedAndIsoPublicationDates() {
        assertEquals(listOf(milk), filteredNews(listOf(news, milk), "all", "6 Nov 2026"))
        assertEquals(listOf(milk), filteredNews(listOf(news, milk), "all", "2026-11-06"))
    }
    @Test fun toolNavigationReturnsOnlyKnownPmsvRoutesToNativeScreens() {
        assertEquals("home", Links.nativeDestination("https://pmsvgroup.com/"))
        assertEquals("updates", Links.nativeDestination("https://pmsvgroup.com/updates/?source=audits"))
        assertEquals("blogs", Links.nativeDestination("https://pmsvgroup.com/blogs"))
        assertNull(Links.nativeDestination("https://pmsvgroup.com/blogs/my-article"))
        assertNull(Links.nativeDestination("https://pmsvgroup.com/audits/index.html"))
        assertNull(Links.nativeDestination("https://pmsvgroup.com.evil.example/updates"))
    }
    @Test fun publicLinksRejectExecutableSchemesAndSpoofedPmsvOrigins() {
        for (url in listOf("javascript:alert(1)", "file:///etc/passwd", "http://pmsvgroup.com", "https://attacker@pmsvgroup.com/", "https://pmsvgroup.com:444/")) assertFalse(url, Links.isHttps(url))
        assertFalse(Links.isPmsv("https://pmsvgroup.com.evil.example/"))
        assertTrue(Links.isPmsv("https://pmsvgroup.com/audits/index.html"))
    }
    @Test fun dailyNewsCheckOccursOnlyOncePerIndiaCalendarDay() {
        assertFalse(DailyCheckPolicy.alreadyChecked(null, 0L, "2026-11-22"))
        assertTrue(DailyCheckPolicy.alreadyChecked("2026-11-22", 0L, "2026-11-22"))
        assertFalse(DailyCheckPolicy.alreadyChecked("2026-11-21", 0L, "2026-11-22"))
        // 19:00 UTC on 21 Nov is already 00:30 on 22 Nov in India.
        val legacy = java.time.Instant.parse("2026-11-21T19:00:00Z").toEpochMilli()
        assertTrue(DailyCheckPolicy.alreadyChecked(null, legacy, "2026-11-22"))
        assertFalse(DailyCheckPolicy.alreadyChecked(null, legacy, "2026-11-23"))
        // Once a check has been recorded on a day, even an empty digest
        // must not trigger a second automatic request until the next date.
        assertTrue(DailyCheckPolicy.alreadyChecked("2026-11-22", legacy, "2026-11-22"))
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
    @Test fun manualNewsPreviewUsesActualLatestDateWhenTodayIsEmpty() {
        val digest = DigestCodec.latestAvailable(listOf(milk, news), "2026-11-15")!!
        assertEquals("2026-11-14", digest.date)
        assertEquals("News · 14 Nov 2026", digest.title)
        assertEquals("1. Food safety news", digest.body)
        assertFalse(digest.body.contains("native notification"))
    }
    @Test fun previewContainsThreeDistinctHeadlinesFromOneDayWithIndiaFirst() {
        val india = news.copy(id = "india", title = "Indian food safety notice", region = "india")
        val other = news.copy(id = "other", title = "Another food safety notice")
        val extra = news.copy(id = "extra", title = "Z extra notice")
        val duplicate = india.copy(id = "duplicate")
        val digest = DigestCodec.latestAvailable(listOf(news, india, other, extra, duplicate, milk), "2026-11-15")!!
        assertEquals(listOf("1. Indian food safety notice", "2. Another food safety notice", "3. Food safety news"), digest.body.lines())
    }
    @Test fun previewRejectsFutureDatesInvalidDatesBlogsAndEmptyNews() {
        assertNull(DigestCodec.latestAvailable(emptyList(), "2026-11-15"))
        assertNull(DigestCodec.latestAvailable(listOf(news.copy(published = "2026-11-16"),
            news.copy(published = "bad"), news.copy(tab = "blogs")), "2026-11-15"))
    }
}
