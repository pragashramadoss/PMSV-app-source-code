# Android download release

The header download button serves the signed native PMSV Android app at
`/?pmsv_android=1`. `/?pmsv_android=info` reports its version, package, size and
SHA-256 digest. Neither route installs a browser shortcut.

`plugin/android-release.json` pins the installer filename and exact bytes.
The APK is a release artifact, not a source file. After the WordPress workflow
has built and tested the plugin ZIP, add the verified signed APK to
`pmsv-original-app-preview/android-release/` inside that ZIP. The file must match
the committed release metadata exactly. Never package a signing key or password.

On the first download or info request, the plugin verifies the bundled APK and
copies it atomically to WordPress uploads under `pmsv-android/`. It then verifies
the persisted file before serving it. Later plugin updates can omit the APK
while keeping the same metadata: the installer persists outside the plugin
directory. For a new app version, update the metadata and bundle the matching
signed release. Missing or mismatched bytes return a temporary-unavailability
error rather than an unverified download.

The website channel uses `com.pmsvgroup.foodsafety.preview` and its retained
preview certificate, preserving existing preview audit data during updates.
Google Play uses `com.pmsvgroup.foodsafety` and the original Play upload key;
Google applies the Play app-signing key to distributed installs. Do not publish
an APK signed by the upload key under the Play package for website installs.

Before publication run `php wordpress/tests/android-download.php`, all existing
notification tests and the production build. After publication verify the info
endpoint, a full download and resumed byte ranges, including the downloaded
APK's digest, certificate, package and version.
