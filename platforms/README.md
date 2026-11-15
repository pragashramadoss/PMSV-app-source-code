# PMSV 2.2.0 — Windows, Mac and iPhone preview

These new platform builds use PMSV's website interface and include the audit checklists and FSSAI licence helper inside the application. Chrome is not required. The existing Android 2.1.0 release is unchanged.

## Packages and release status

- Windows x64: NSIS installer. Installs per user; no administrator account required. This preview is not publisher-signed. Windows may show an unknown-publisher warning. A Windows code-signing certificate is needed for a signed public release.
- Mac Apple Silicon (arm64): DMG for M-series Macs.
- Mac Intel (x64): DMG for Intel Macs.
- Both Mac builds are ad-hoc signed for development integrity, not signed with an Apple Developer ID or notarized. They are developer previews, not ready for a friction-free public website download. Do not disable Gatekeeper to install them. Use the signed/notarized release when available.
- iPhone: a compiled, unsigned device archive and an Xcode project for signing, plus a separate simulator app. These are developer packages, not installable IPA files. An Apple Developer team must sign and distribute through TestFlight or the App Store for normal users. A simulator app cannot be installed on a physical iPhone.

## What is available

- Same compact PMSV navigation, news lists, search, audits, FSSAI helper, blogs and discussions as the website.
- Audit and licence tools load from bundled files, including without internet.
- Saved audits/assessments remain in this application's private local storage. They are not uploaded to GitHub. Existing browser and Android records are separate; there is no automatic migration or account sync.
- Desktop report downloads open a native Save dialog. iPhone report downloads open the native share sheet; choose Save to Files or another destination.
- Print uses the operating system print dialog. On iPhone the print preview can be shared/saved as PDF.
- News refreshes from pmsvgroup.com, with a local cache and a bundled archive when offline. Discussions require internet; submitted posts and chosen display names are public.
- News notifications can run while this preview is open. These builds do not yet provide background server push when closed, or discussion-reply alerts.
- Uninstalling or clearing app data can erase saved assessments. Export important records. Cloud backup is not connected.

## Rebuild

Source: https://github.com/pragashramadoss/PMSV-app-source-code/tree/platform/desktop-ios-2.2.0

Use Node 24 and run from the repository root:

```
npm ci
npm ci --prefix platforms
npm run --prefix platforms build:web
npm test --prefix platforms
cd platforms
npx electron-builder --win --x64 --publish never
# On a Mac, use --mac --arm64 or --mac --x64 instead.
```

For iOS, use Xcode 26 or later, macOS and XcodeGen:

```
cd platforms
npx cap sync ios
cd ios/App
xcodegen generate
open App.xcodeproj
```

Choose the App scheme, set your Apple Developer team under Signing & Capabilities, and use Product > Archive. The application bundle ID is `com.pmsvgroup.foodsafety`, version 2.2.0, build 12. Verify the bundle ID is available in your developer account. App Store Connect privacy answers and review information must match the final app's features.

In the downloadable iPhone signing package, the web assets and generated Xcode project are already included. Run `npm ci` from that package's root to restore the local Capacitor plugin packages referenced by Swift Package Manager, then open `ios/App/App.xcodeproj`. Do not run `cap sync` there unless rebuilding from the complete repository. The unsigned `.xcarchive` can also be inspected in Xcode Organizer. Signing/export and on-device testing are still required.

For final Mac distribution, replace the ad-hoc identity with the team's Developer ID Application certificate, enable notarization with securely supplied credentials, rebuild both architectures, staple the notarization ticket and verify Gatekeeper acceptance. Never commit signing certificates, keys or credentials.

## Verification

The build workflow installs the Windows installer and mounts each Mac DMG before testing the resulting application. It checks local Home rendering, an offline audit saved and reopened after relaunch, the bundled licence helper, a native file export, and renderer isolation. The iPhone workflow builds a device archive and runs UI tests in an iPhone simulator. The included checksums identify the exact packages. This does not replace physical-device testing or store review.
