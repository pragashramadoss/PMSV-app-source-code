package com.pmsvgroup.nativeapp

import android.content.Intent
import android.net.ConnectivityManager
import android.graphics.Bitmap
import android.os.ParcelFileDescriptor
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createEmptyComposeRule
import androidx.test.core.app.ActivityScenario
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.*
import org.junit.Before
import org.junit.After
import org.junit.Rule
import org.junit.Test
import java.io.File
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

/** Installed tools must work from a cold load with the emulator disconnected. */
class ToolShellTest {
    @get:Rule val compose = createEmptyComposeRule()
    private val instrumentation = InstrumentationRegistry.getInstrumentation()
    private lateinit var scenario: ActivityScenario<ToolActivity>
    private fun shell(command: String) {
        ParcelFileDescriptor.AutoCloseInputStream(instrumentation.uiAutomation.executeShellCommand(command)).use { it.readBytes() }
    }
    @Before fun disconnectDevice() {
        shell("cmd connectivity airplane-mode enable")
        shell("svc wifi disable")
        shell("svc data disable")
        compose.waitUntil(10000) { instrumentation.targetContext.getSystemService(ConnectivityManager::class.java).activeNetwork == null }
    }
    @After fun reconnectDevice() {
        shell("cmd connectivity airplane-mode disable")
        shell("svc wifi enable")
        shell("svc data enable")
    }
    private fun launch(url: String) {
        scenario = ActivityScenario.launch(Intent(instrumentation.targetContext, ToolActivity::class.java)
            .putExtra("url", url).putExtra("title", "Audits"))
    }
    private fun web(view: View): WebView? {
        if (view is WebView) return view
        if (view is ViewGroup) for (index in 0 until view.childCount) web(view.getChildAt(index))?.let { return it }
        return null
    }
    private fun js(script: String): String {
        val result = AtomicReference("null")
        val done = CountDownLatch(1)
        scenario.onActivity { activity ->
            val view = web(activity.window.decorView)
            if (view == null) done.countDown()
            else view.evaluateJavascript(script) { result.set(it); done.countDown() }
        }
        assertTrue("WebView JavaScript callback", done.await(5, TimeUnit.SECONDS))
        return result.get()
    }
    private fun loaded(section: String, selector: String) {
        compose.waitUntil(60000) {
            js("document.documentElement.getAttribute('data-pmsv-native') === '$section' && !!document.querySelector('$selector')") == "true"
        }
        compose.waitUntil(10000) { compose.onAllNodesWithTag("tool-loading").fetchSemanticsNodes().isEmpty() }
        scenario.onActivity { assertTrue(requireNotNull(web(it.window.decorView)).settings.blockNetworkLoads) }
        compose.onNodeWithContentDescription("PMSV home").assertIsDisplayed()
        listOf("Updates/News", "Audits", "FSSAI Licence", "Blogs", "Discussions").forEach {
            compose.onNodeWithContentDescription("Navigate to $it").assertIsDisplayed()
        }
    }
    @Test fun offlineAuditsAndLicenceUseOneHeaderAndFooter() {
        launch("https://pmsvgroup.com/audits/index.html")
        try {
            loaded("audits", ".pmsv-audit-nav")
            compose.onNodeWithContentDescription("Navigate to Audits").assertIsSelected()
            assertEquals("true", js("getComputedStyle(document.querySelector('.pmsv-audit-nav')).display === 'none'"))
            assertEquals("true", js("getComputedStyle(document.querySelector('.pmsv-audit-masthead')).display === 'none'"))
            val header = compose.onNodeWithTag("pmsv-header").fetchSemanticsNode().boundsInRoot
            val footer = compose.onNodeWithTag("pmsv-navigation").fetchSemanticsNode().boundsInRoot
            capture("tool-audits.png")

            compose.onNodeWithContentDescription("Navigate to FSSAI Licence").performClick()
            loaded("licence", "#startLicenceBtn")
            compose.onNodeWithContentDescription("Navigate to FSSAI Licence").assertIsSelected()
            compose.onNodeWithContentDescription("Navigate to Audits").assertIsNotSelected()
            assertEquals(header, compose.onNodeWithTag("pmsv-header").fetchSemanticsNode().boundsInRoot)
            assertEquals(footer, compose.onNodeWithTag("pmsv-navigation").fetchSemanticsNode().boundsInRoot)
            assertEquals("true", js("getComputedStyle(document.querySelector('.helper-bottom-nav')).display === 'none'"))
            assertEquals("true", js("getComputedStyle(document.querySelector('.tabs')).display !== 'none' && document.querySelectorAll('.tabs .tab').length === 3"))
            capture("tool-licence.png")
            js("document.querySelector('[data-view=saved]').click()")
            assertEquals("true", js("!document.getElementById('saved').classList.contains('hidden')"))
            js("document.querySelector('[data-view=sources]').click()")
            assertEquals("true", js("!document.getElementById('sources').classList.contains('hidden')"))
            js("document.querySelector('[data-view=home]').click(); document.getElementById('startLicenceBtn').click()")
            assertEquals("true", js("!document.getElementById('wizard').classList.contains('hidden')"))
            // Opening native notifications and re-tapping the tab must keep this form.
            compose.onNodeWithContentDescription("App notifications").performClick()
            compose.onNodeWithText("Daily update alerts").assertIsDisplayed()
            compose.onNodeWithContentDescription("Close notifications").performClick()
            compose.onNodeWithContentDescription("Navigate to FSSAI Licence").performClick()
            assertEquals("true", js("!document.getElementById('wizard').classList.contains('hidden')"))
            capture("tool-licence-form.png")
            scenario.onActivity { it.onBackPressedDispatcher.onBackPressed() }
            loaded("audits", ".pmsv-audit-nav")
            compose.onNodeWithContentDescription("Navigate to Audits").assertIsSelected()
        } finally { scenario.close() }
    }
    @Test fun toolRecreationRetainsOriginStorageAndSelectedSection() {
        launch("https://pmsvgroup.com/fssai-license")
        try {
            loaded("licence", "#startLicenceBtn")
            js("localStorage.setItem('pmsv-shell-qa', 'retained')")
            scenario.recreate()
            loaded("licence", "#startLicenceBtn")
            compose.onNodeWithContentDescription("Navigate to FSSAI Licence").assertIsSelected()
            assertEquals("\"retained\"", js("localStorage.getItem('pmsv-shell-qa')"))
            js("localStorage.removeItem('pmsv-shell-qa')")
        } finally { scenario.close() }
    }
    @Test fun offlineAuditCanBeSavedAndReopenedWithAnswers() {
        launch("https://pmsvgroup.com/audits/general-manufacturing.html")
        try {
            loaded("audits", ".pmsv-draft")
            js("document.getElementById('fbo').value = 'Offline QA audit'; document.getElementById('auditor').value = 'QA'; const row = document.querySelector('tr[data-n=\"1\"]'); row.querySelector('select').value = 'C'; row.querySelector('select').dispatchEvent(new Event('change', {bubbles:true})); row.querySelector('textarea').value = 'Offline evidence'; document.querySelector('.pmsv-draft').click()")
            assertEquals("true", js("JSON.parse(localStorage.getItem('pmsvFssaiAudits')).some(x => x.fbo === 'Offline QA audit' && x.items[0].status === 'C' && x.items[0].comment === 'Offline evidence')"))
            scenario.recreate()
            loaded("audits", ".pmsv-draft")
            assertEquals("true", js("document.getElementById('fbo').value === 'Offline QA audit' && document.querySelector('tr[data-n=\"1\"] select').value === 'C' && document.querySelector('tr[data-n=\"1\"] textarea').value === 'Offline evidence'"))
            capture("tool-offline-audit.png")
            js("localStorage.setItem('pmsvFssaiAudits', JSON.stringify(JSON.parse(localStorage.getItem('pmsvFssaiAudits')).filter(x => x.fbo !== 'Offline QA audit')))")
        } finally { scenario.close() }
    }
    private fun capture(name: String) {
        compose.waitForIdle()
        instrumentation.uiAutomation.waitForIdle(300, 5000)
        val bitmap = instrumentation.uiAutomation.takeScreenshot()
        val file = File(File(instrumentation.targetContext.getExternalFilesDir(null), "qa").apply { mkdirs() }, name)
        file.outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
        shell("mkdir -p /sdcard/Download/pmsv-native-qa")
        shell("cp ${file.absolutePath} /sdcard/Download/pmsv-native-qa/$name")
    }
}
