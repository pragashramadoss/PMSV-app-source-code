package com.pmsvgroup.nativeapp

import android.content.Context
import android.graphics.Bitmap
import android.os.ParcelFileDescriptor
import androidx.compose.runtime.*
import androidx.compose.foundation.layout.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.getOrNull
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Rule
import org.junit.Test
import java.io.File

class NativeScreensTest {
    @get:Rule val compose = createComposeRule()
    private val milk = NewsItem("milk", "Milk logo amendment", "Graphic specifications for milk packs.", "2026-11-06", "FSSAI", "Gazette notification", "fssai", "india", "https://www.fssai.gov.in/milk.pdf")
    private val news = milk.copy(id = "news", title = "Food safety update", source = "Food Safety News", tab = "general", published = "2026-11-14")
    private val blog = milk.copy(id = "blog", title = "Practical food safety lessons", tab = "blogs", source = "PMSV", category = "Food safety")
    private val us = milk.copy(id = "us", title = "US regulatory notice", region = "us", source = "US FDA")
    private var openedTool: Pair<String, String>? = null
    private fun launch(compactLargeText: Boolean = false) {
        compose.setContent {
            var saved by remember { mutableStateOf(emptyList<NewsItem>()) }
            val density = LocalDensity.current
            CompositionLocalProvider(LocalDensity provides Density(density.density, if (compactLargeText) 1.3f else density.fontScale)) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
            Box((if (compactLargeText) Modifier.width(360.dp) else Modifier.fillMaxWidth()).fillMaxHeight().testTag("screen-frame")) {
            PmsvTheme { PmsvApp(PmsvState(listOf(news, milk, blog, us,
                news.copy(id = "long", title = "Food safety authorities publish new guidance for handling and storage across food businesses"),
                news.copy(id = "sixth", title = "More food safety updates")), saved, false, updatedAt = 1794650000000L), "home" to 1L,
                {}, { item -> saved = if (saved.any { it.id == item.id }) saved.filterNot { it.id == item.id } else saved + item },
                { title, url -> openedTool = title to url }, {}, {}, false, true, {}, { NewsAlertResult(true, "Headlines from 14 Nov 2026 posted. Tap the notification to open Updates.") }, {}) }
            }
            }
            }
        }
    }
    @Test fun nativeSearchAndBookmarkJourney() {
        launch()
        compose.onNodeWithText("Welcome to the Forum").assertIsDisplayed()
        compose.onNodeWithContentDescription("Search news updates").performTextInput("milk")
        compose.onNode(hasScrollToIndexAction()).performScrollToNode(hasText("Milk logo amendment"))
        compose.onNodeWithText("Milk logo amendment").assertIsDisplayed().performClick()
        compose.onNodeWithText("Graphic specifications for milk packs.").assertIsDisplayed()
        compose.onNodeWithText("Save update").performScrollTo().performClick()
        compose.onNodeWithContentDescription("Back to updates").performClick()
        compose.onNodeWithContentDescription("More options").performClick()
        compose.onNodeWithText("Saved updates").performClick()
        compose.onNodeWithText("On this device").assertIsDisplayed()
        compose.onNodeWithText("Milk logo amendment").assertIsDisplayed()
        compose.onNodeWithContentDescription("Unsave Milk logo amendment").performScrollTo().performClick()
        compose.onNodeWithText("Nothing saved here yet").assertIsDisplayed()
    }
    @Test fun captureNativeHomeAndSettings() {
        launch()
        compose.waitForIdle()
        capture("native-home.png")
        compose.onNodeWithContentDescription("App notifications").performClick()
        compose.onNodeWithText("Daily update alerts").assertIsDisplayed()
        compose.onNodeWithText("Send news notification").performClick()
        compose.onNodeWithText("Headlines from 14 Nov 2026 posted. Tap the notification to open Updates.").assertExists()
        capture("native-notifications.png")
        compose.onNodeWithContentDescription("Close notifications").performClick()
        compose.onNodeWithContentDescription("More options").performClick()
        compose.onNodeWithText("Settings").performClick()
        compose.onNodeWithText("Daily update alerts").assertIsDisplayed()
        capture("native-settings.png")
    }
    @Test fun websiteNavigationOpensMatchingToolsAndNativeBlogs() {
        launch()
        listOf("Audits" to "https://pmsvgroup.com/audits/index.html", "FSSAI Licence" to "https://pmsvgroup.com/fssai-license", "Discussions" to "https://pmsvgroup.com/discussions").forEach { (title, url) ->
            compose.onNodeWithContentDescription("Navigate to $title").performClick()
            org.junit.Assert.assertEquals(title to url, openedTool)
        }
        compose.onNodeWithContentDescription("Navigate to Blogs").performClick()
        compose.onNodeWithText("Practical food safety lessons").assertIsDisplayed()
        compose.onNodeWithText("Food safety update").assertDoesNotExist()
        capture("native-blogs.png")
    }
    @Test fun websiteRegulatoryJourneyScopesIndiaFeed() {
        launch()
        compose.onNodeWithContentDescription("Navigate to Updates/News").performClick()
        capture("native-updates.png")
        compose.onNodeWithText("Regulatory").performClick()
        capture("native-regulatory.png")
        compose.onNodeWithContentDescription("India · FSSAI").performClick()
        compose.onNode(hasScrollToIndexAction()).performScrollToNode(hasText("Milk logo amendment"))
        compose.onNodeWithText("Milk logo amendment").assertIsDisplayed()
        compose.onNodeWithText("US regulatory notice").assertDoesNotExist()
        capture("native-fssai.png")
    }
    @Test fun compactLayoutKeepsLargeTextAndAllNavigationUsable() {
        launch(compactLargeText = true)
        val frame = compose.onNodeWithTag("screen-frame").fetchSemanticsNode().boundsInRoot
        val header = compose.onNodeWithTag("pmsv-header").fetchSemanticsNode().boundsInRoot
        val footer = compose.onNodeWithTag("pmsv-navigation").fetchSemanticsNode().boundsInRoot
        listOf("PMSV", "Food Safety & Quality Forum", "Welcome to the Forum", "Updates/News", "Audits", "FSSAI Licence", "Blogs", "Discussions").forEach { label ->
            compose.onAllNodesWithText(label, useUnmergedTree = true).fetchSemanticsNodes().forEach { node ->
                org.junit.Assert.assertTrue("$label stays inside the screen", node.boundsInRoot.left >= frame.left && node.boundsInRoot.right <= frame.right)
                val layouts = mutableListOf<TextLayoutResult>()
                node.config.getOrNull(SemanticsActions.GetTextLayoutResult)?.action?.invoke(layouts)
                org.junit.Assert.assertTrue("$label is readable without clipping", layouts.all { !it.hasVisualOverflow })
            }
        }
        val search = compose.onNodeWithTag("pmsv-search").fetchSemanticsNode().boundsInRoot
        org.junit.Assert.assertTrue("Content fits between the shared bars", search.top >= header.bottom && search.bottom < footer.top)
        capture("native-home-large-text.png")
        compose.onNodeWithContentDescription("Navigate to Blogs").performClick()
        compose.onNodeWithText("Practical food safety lessons").assertIsDisplayed()
        compose.onNodeWithContentDescription("PMSV home").performClick()
        compose.onNode(hasScrollToIndexAction()).performScrollToNode(hasText("View all updates"))
        compose.onNodeWithText("View all updates").performClick()
        compose.onNode(hasScrollToIndexAction()).performScrollToNode(hasText("More food safety updates"))
        compose.onNodeWithText("More food safety updates").assertIsDisplayed()
    }
    private fun capture(name: String) {
        compose.waitForIdle()
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val bitmap = instrumentation.uiAutomation.takeScreenshot()
        val folder = File(instrumentation.targetContext.getExternalFilesDir(null), "qa").apply { mkdirs() }
        val file = File(folder, name)
        file.outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
        // Gradle uninstalls the test app before returning. Keep only these fixture
        // screenshots outside its data directory so CI can retrieve them.
        fun shell(command: String) {
            ParcelFileDescriptor.AutoCloseInputStream(instrumentation.uiAutomation.executeShellCommand(command)).use { it.readBytes() }
        }
        shell("mkdir -p /sdcard/Download/pmsv-native-qa")
        shell("cp ${file.absolutePath} /sdcard/Download/pmsv-native-qa/$name")
    }
    @Test fun savedContentSurvivesRepositoryRecreation() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val repository = PmsvRepository(context)
        repository.save(listOf(milk))
        org.junit.Assert.assertEquals(listOf(milk), PmsvRepository(context).saved())
        repository.save(emptyList())
    }
}
