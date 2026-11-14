package com.pmsvgroup.nativeapp

import org.junit.Assert.*
import org.junit.Test

class ToolPagesTest {
    @Test fun trustedSubpagesKeepTheCorrectNativeTab() {
        assertEquals("audits", ToolPages.section("https://pmsvgroup.com/audits/fssai-inspection-app.html?draft=123"))
        assertEquals("licence", ToolPages.section("https://pmsvgroup.com/fssai-license/#saved"))
        assertEquals("licence", ToolPages.section("https://pmsvgroup.com/wp-content/plugins/pmsv-original-app-preview/public/fssai-license/index.html"))
        assertEquals("discussions", ToolPages.section("https://pmsvgroup.com/discussions/topic-123"))
    }
    @Test fun presentationChangesNeverApplyToUntrustedOrigins() {
        listOf("https://pmsvgroup.com.evil.example/audits/", "http://pmsvgroup.com/audits/", "https://user@pmsvgroup.com/audits/", "https://pmsvgroup.com:444/audits/", "javascript:alert(1)").forEach {
            assertEquals("", ToolPages.section(it))
            assertEquals("false", ToolPages.presentationScript(it, "body { color: red; }"))
        }
        assertEquals("", ToolPages.section("https://pmsvgroup.com/audits-fake/"))
    }
}
