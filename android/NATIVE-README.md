# PMSV native Android preview

This module is a Kotlin / Jetpack Compose Android app. Home, news and regulatory
feeds, search, update details, bookmarks, sharing, settings and notification
navigation are native Android screens. They do not launch a TWA or depend on
Chrome's desktop-site preference.

The preview installs as `com.pmsvgroup.foodsafety.nativepreview`, alongside the
existing Play app. It is debug signed for testing, not a production Play update.
The existing `:app` module and live WordPress plugin are unchanged.

## Content and GitHub

The existing GitHub updater gathers official/regulatory/news material and
publishes it to PMSV. The native app reads `https://pmsvgroup.com/api/news`.
Content updates therefore need no new Android release. App-code updates still
use the Android build / Google Play release process.

Cached headlines and summaries remain available offline. Saved items retain
their content even if a later feed omits them. Original articles/documents need
connectivity. Source dates and category labels are preserved; no regulatory
interpretations are added by this app.

## Preview boundaries

- Audits, licence and discussions currently open the existing PMSV forms in an
  in-app WebView. These are explicitly labelled web tools, not claimed as native.
- TWA/Chrome storage cannot be automatically read by this app. Existing audit
  records stay in the old app. Do not uninstall it. Continue using it for report
  export/email and existing records until explicit export/import is implemented.
- Daily alerts use WorkManager with a 30-minute requested interval and Android
  may defer them. This is periodic synchronization, not instant push. A native
  test notification validates Android permission and native click navigation.
- Instant FCM push, authenticated discussion reply alerts, report attachment
  sharing, saved-audit migration, and native audit/licence forms are release work.
  No Firebase configuration has been supplied or fabricated. No push registration
  is taken away from the existing working app.
- Before production: configure the user's Firebase project/client and server
  delivery, verify offline data migration and report sharing, use the existing
  production package identity/upload key, update Play privacy disclosures, and
  verify a Play-signed build on the user's Android phone.

## Build and validation

From `android/`, with Java 17, Gradle 8.13 and Android SDK 36:

```sh
gradle :native-app:assembleDebug :native-app:testDebugUnitTest :native-app:lintDebug
gradle :native-app:connectedDebugAndroidTest
```

CI runs unit tests, lint, APK package checks and Android 16 instrumentation tests
for search, bookmarking/persistence and repeated notification navigation. UI
screenshots use explicit test fixtures; real feeds are fetched at runtime.
