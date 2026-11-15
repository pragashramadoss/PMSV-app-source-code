package com.pmsvgroup.nativeapp

import org.junit.Assert.*
import org.junit.Test

class BundledToolPathsTest {
    @Test fun savedAuditAndHelperRoutesResolveToInstalledAssets() {
        assertEquals("tools/audits/general-manufacturing.html", BundledToolPaths.asset("https://pmsvgroup.com/audits/general-manufacturing.html?draft=insp-123"))
        assertEquals("tools/fssai-license/index.html", BundledToolPaths.asset("https://pmsvgroup.com/fssai-license"))
        assertEquals("tools/audits/audit-forum.css", BundledToolPaths.asset("https://pmsvgroup.com/wp-content/plugins/pmsv-original-app-preview/public/audits/audit-forum.css?v=35"))
        assertNull(BundledToolPaths.asset("https://pmsvgroup.com/discussions"))
        assertTrue(BundledToolPaths.isLocal("https://pmsvgroup.com/audits/missing-file.html"))
    }
    @Test fun localAssetResolutionRejectsTraversalAndForeignOrigins() {
        listOf("https://pmsvgroup.com/audits/../secret.html", "https://pmsvgroup.com/audits/%2e%2e/secret.html", "https://pmsvgroup.com.evil.example/audits/index.html", "file:///android_asset/tools/audits/index.html", "https://pmsvgroup.com/audits/%00.html").forEach {
            assertNull(it, BundledToolPaths.asset(it))
        }
    }
}
