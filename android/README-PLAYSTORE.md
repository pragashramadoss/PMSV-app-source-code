# PMSV Android 2.1.0

The Google Play package now builds the same native PMSV interface as the website
installer. Home, feeds, search, bookmarks, settings and notifications use Compose.
Audits and FSSAI Licence are packaged offline tools within the shared app shell.

## Distribution

| Channel | Package | Artifact | Signature |
| --- | --- | --- | --- |
| Existing Google Play listing | com.pmsvgroup.foodsafety | :play-app release AAB | Existing Play upload key |
| Website / existing preview installs | com.pmsvgroup.foodsafety.preview | :native-app release APK | Retained private preview signing key |

Both are version 2.1.0, versionCode 11, target SDK 36 and minimum SDK 26.
Both show PMSV as the launcher name. They compile identical sources and tools.
Debug builds add .debug and are never distributed.

The Play upload certificate SHA-256 is
26:5F:74:D7:00:54:D5:7B:E2:EE:98:11:93:10:8B:98:DF:AD:0D:AD:B2:FD:C1:CB:38:74:1D:28:10:17:57:C5.
Google's existing Play app-signing certificate is
B1:77:8B:BF:10:BE:26:26:FE:54:A1:5B:8C:CE:D4:58:8D:08:EA:DE:BD:C3:78:1A:06:0A:2B:3F:CC:D3:1D:C1.
Do not sign a website APK with the upload key under the Play package: it would
conflict with Play-installed copies. Keep each distribution's package and key.
A Play-signed universal APK can replace this separate website channel later,
after it is obtained from Play Console. Do not fabricate that signature.

CI builds unsigned release artifacts. Sign the AAB outside GitHub using the
retained upload key; sign only the website APK with its retained direct-install
key. Never commit passwords, private keys or CI debug-signed installers.

## Play Console handoff

Upload PMSV-2.1.0-Play-Upload-Signed.aab to the existing app and testing track.
Do not create a new Play listing. Review the release and Data safety declaration,
then submit it. Building or signing an AAB does not publish it to Google Play.

Suggested release notes:
- Redesigned PMSV interface with consistent navigation across all sections.
- News, search, saved updates and branded notifications within the Android app.
- Included offline audit checklists and FSSAI Licence Helper.
- Improved compact layouts and support for larger text.

## Storage and migration

Updating the website package keeps its existing saved audits and bookmarks.
Do not uninstall or clear app data. The previous Play app used Chrome/TWA storage;
those records remain in the browser and cannot be imported automatically into the
new native app. Open pmsvgroup.com in the original browser for earlier records.
New audits are saved privately on the phone. No account backup is connected.

Daily news notifications use Android WorkManager periodic synchronization, not
instant FCM push. Existing source dates and categories are retained. Fresh news,
discussions and external documents require internet. Report attachment sharing
and automatic migration of browser-saved records remain outside this release.
The policy at https://pmsvgroup.com/privacy covers both app and website behavior.

## Build and verification

From android with Java 17, Gradle 8.13 and SDK 36:

    gradle :play-app:bundleRelease :play-app:assembleRelease
    gradle :native-app:assembleRelease

Both modules share native-app-config.gradle and native-app/src. CI runs unit,
lint and Android 16 device checks for both distributions, then validates release
package identity, native launch, install and update. Private signing is separate.
The legacy :app TWA source is retained for history and is no longer the Play build.
