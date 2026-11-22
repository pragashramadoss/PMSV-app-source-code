# PMSV native Android app

This module is a Kotlin / Jetpack Compose Android app. Home, news and regulatory
feeds, search, update details, bookmarks, sharing, settings and notification
navigation are native Android screens. They do not launch a TWA or depend on
Chrome's desktop-site preference.

The preview now mirrors the website: the PMSV header, Welcome to the Forum,
global search, compact shortcut cards, Latest updates and the five website tabs.
Updates/News includes regulatory country desks and professional topics. Blogs,
saved updates, details and the notification dialog retain the same visual style.
The light theme is intentional, matching the website regardless of Chrome settings.

Version 2.0.5 adds a blue PMSV welcome panel, distinct tool icon tiles, colour-coded
news badges, compact source/date metadata, an emphasized leading headline, and
lighter selected-tab indicators. The same rounded blue introduction panels,
card surfaces and control styles continue into the installed audit and licence
tools. Programme tiles use outline icons instead of emoji. The website palette,
original logos and familiar five destinations remain intact. Home still offers
three primary tools, five recent headlines and access to the complete feed.
Text follows Android accessibility scaling without clipping. The Lucide licence
is bundled in assets/licenses.

The app keeps the SAME native masthead, notification dialog and five-tab
footer around Audits, FSSAI Licence and Discussions. Tool subpages update the
selected native tab. App-scoped presentation CSS removes duplicate web navigation
and normalizes the helper header; the website and form calculations are unchanged.
Tapping the current section or opening notifications preserves the active form.

The website distribution installs as `com.pmsvgroup.foodsafety.preview`, labelled
PMSV. CI debug builds have a `.debug` suffix. The first 2.0.0 preview used
an ephemeral CI debug signing key, which was not retained; Android cannot update
that package with a different key. This new identity preserves all existing apps
and their local records. Keep the old apps for existing saved audits/bookmarks.
CI outputs an UNSIGNED release APK, not an installer. Distribution must sign it
with the persistent private PMSV preview key backed up separately in the owner's
private files. Never publish that key, password or a debug-signed distributable.
Future updates must keep both this package ID and signing key and increase the
version code. The `:play-app` module compiles the same source for the existing Play package.
See README-PLAYSTORE.md for the two signing identities and release instructions.
The legacy `:app` TWA module is retained for history only.

## Content and GitHub

The existing GitHub updater gathers official/regulatory/news material and
publishes it to PMSV. The native app reads `https://pmsvgroup.com/api/news`.
Content updates therefore need no new Android release. GitHub Actions builds
and tests changes to the Android code. Production app updates can be distributed
through Google Play, or as signed APKs on GitHub Releases for direct installation.
Direct installation requires Android's user approval and consistent package/signing
identity. This preview does not contain an automatic APK downloader or installer.

Cached headlines and summaries remain available offline. Saved items retain
their content even if a later feed omits them. Original articles/documents need
connectivity. Source dates and category labels are preserved; no regulatory
interpretations are added by this app.

## Installed tools

The APK includes the audit checklists, helper, scripts, styles and logo under
`assets/tools`. These are the existing tool definitions from source commit
`dcf9bfa7da127df293cb90350c62215dd0f1b3c2`; no eligibility or scoring rules change.
`BundledTools` serves those installed files to the embedded renderer. Network
loads are blocked for these tools; missing files return a local error instead of
falling back to the website. Presentation CSS is present before the first paint.
The secure PMSV origin is retained solely to preserve existing private saved
records on upgrade. No website connection is needed to open, fill or save them.

The form renderer is still Android WebView (a hybrid form UI), not a completed
Kotlin rewrite of every audit/licence widget. The surrounding app is Compose.
External official documents, FoSCoS applications, discussions and fresh news
still require connectivity. Tool definitions update with a signed app release.

## Preview boundaries

- Audits and licence tools load their installed app files inside the shared
  native header and footer. Discussions connects to PMSV online. Form content
  uses the embedded renderer; it has not been rewritten as native form widgets.
  Save Draft stores new checklists in this preview app's private WebView storage;
  reopen them from the audit tool's Saved Audits. Saved articles use separate
  native app storage. Neither is uploaded to GitHub. Account backup is not
  connected, so clearing app data or uninstalling can remove these local records.
- TWA/Chrome storage cannot be automatically read by this app. Existing audit
  records stay in the old app. Do not uninstall it. Continue using it for report
  export/email and existing records until explicit export/import is implemented.
- Daily alerts use a 24-hour WorkManager schedule with at most one automatic
  news check per India calendar day; app-open catch-up only runs when that day
  has not been checked. Android may defer delivery. This is not instant push. Automatic
  alerts only use a nonempty digest for the current India date, once per day.
  Send news notification fetches the latest available headlines, showing their
  actual publication date (including an older day when today is empty). If the
  network fails it can preview cached news, with a clear saved-headlines message.
  Empty news never produces a placeholder test alert. Fetching runs off the UI
  thread. Manual previews neither enable daily alerts nor consume the daily digest.
  Both manual and daily notifications use a monochrome PMSV family emblem in the
  small icon and the original full-colour logo as the large icon. Notification
  taps continue to open the native Updates screen. No browser is involved.
- Instant FCM push, authenticated discussion reply alerts, report attachment
  sharing, saved-audit migration, and native audit/licence forms are release work.
  No Firebase configuration has been supplied or fabricated. No push registration
  is taken away from the existing working app.
- Release 2.1.2 keeps once-daily news alerts, local saves and the bundled form
  renderer. Instant FCM, browser-record import and report attachment sharing
  remain future work. The Play variant uses the existing production identity
  and upload key. A Play-signed install still needs verification after upload.

## Build and validation

From `android/`, with Java 17, Gradle 8.13 and Android SDK 36:

```sh
gradle :native-app:assembleDebug :native-app:testDebugUnitTest :native-app:lintDebug
gradle :native-app:connectedDebugAndroidTest
```

CI runs unit tests, lint, APK package checks and Android 16 instrumentation tests
for search, bookmarking/persistence and repeated notification navigation. UI
screenshots cover native fixture screens and offline installed Audits/FSSAI tool pages.
Tool tests check shared header/footer geometry, hidden duplicate web navigation,
helper subtabs, form continuity, back navigation, an actual offline saved audit
and private storage persistence. Tool device tests disable internet access.

Notification tests verify real headline content/date, logo resources, repeated native navigation, cached and empty news, and daily deduplication. Android 16 captures include the notification shade.

Design checks include a 360 dp layout with 130% text, unclipped navigation,
the full-feed journey, topic/regulator screens and matching tool chrome.
