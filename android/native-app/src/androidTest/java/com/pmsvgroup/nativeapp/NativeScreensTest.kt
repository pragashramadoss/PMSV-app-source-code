package com.pmsvgroup.nativeapp

import android.content.Context
import android.graphics.Bitmap
import androidx.compose.runtime.*
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
    private fun launch() {
        compose.setContent {
            var saved by remember { mutableStateOf(emptyList<NewsItem>()) }
            PmsvTheme { PmsvApp(PmsvState(listOf(news, milk), saved, false, updatedAt = 1794650000000L), "home" to 1L,
                {}, { item -> saved = if (saved.any { it.id == item.id }) saved.filterNot { it.id == item.id } else saved + item },
                { _, _ -> }, {}, {}, false, true, {}, { true }, {}) }
        }
    }
    @Test fun nativeSearchAndBookmarkJourney() {
        launch()
        compose.onNodeWithText("Explore FSSAI updates").performClick()
        compose.onNodeWithText("Updates & insights").assertIsDisplayed()
        compose.onNodeWithText("Search updates").performTextInput("milk")
        compose.onNodeWithText("Milk logo amendment").assertIsDisplayed().performClick()
        compose.onNodeWithText("Graphic specifications for milk packs.").assertIsDisplayed()
        compose.onNodeWithText("Save update").performScrollTo().performClick()
        compose.onNodeWithContentDescription("Back to updates").performClick()
        compose.onNodeWithText("Saved", useUnmergedTree = true).performClick()
        compose.onNodeWithText("Your saved updates").assertIsDisplayed()
        compose.onNodeWithText("Milk logo amendment").assertIsDisplayed()
        compose.onNodeWithContentDescription("Unsave Milk logo amendment").performClick()
        compose.onNodeWithText("Nothing saved here yet").assertIsDisplayed()
    }
    @Test fun captureNativeHomeAndSettings() {
        launch()
        compose.waitForIdle()
        capture("native-home.png")
        compose.onNodeWithText("Settings", useUnmergedTree = true).performClick()
        compose.onNodeWithText("Daily update alerts").assertIsDisplayed()
        compose.onNodeWithText("Send native test notification").performClick()
        compose.onNodeWithText("Test posted. Check your notification shade and tap it to open Updates.").assertExists()
        capture("native-settings.png")
    }
    private fun capture(name: String) {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val bitmap = instrumentation.uiAutomation.takeScreenshot()
        val folder = File(instrumentation.targetContext.getExternalFilesDir(null), "qa").apply { mkdirs() }
        File(folder, name).outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
    @Test fun savedContentSurvivesRepositoryRecreation() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val repository = PmsvRepository(context)
        repository.save(listOf(milk))
        org.junit.Assert.assertEquals(listOf(milk), PmsvRepository(context).saved())
        repository.save(emptyList())
    }
}
