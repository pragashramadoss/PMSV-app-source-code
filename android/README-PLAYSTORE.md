# PMSV Google Play build

- App: PMSV Food Safety & Quality Forum
- Application ID: com.pmsvgroup.foodsafety
- Website: https://pmsvgroup.com/
- Version: 1.0.3 (versionCode 4)
- Target SDK: 36 (Android 16)
- Minimum SDK: 24
- Packaging: Trusted Web Activity using Android Browser Helper

The release bundle built by CI is intentionally unsigned. Signing is performed outside GitHub so the upload key is never committed to the public repository.

After the first AAB is uploaded to Google Play, use Play Console > App integrity to obtain the Google Play app-signing SHA-256 fingerprint. Add that fingerprint to https://pmsvgroup.com/.well-known/assetlinks.json so the TWA is verified when installed from Google Play.

## 1.0.3 verification repair

The asset_statements JSON string previously contained unescaped double quotes.
AAPT2 removed these during compilation, leaving invalid JSON in the app resource.
Quotes are now Android-escaped and a CI check parses the compiled resource.

On 14 October 2026 the user confirmed the Play app-signing SHA-256 matches the
live site's assetlinks.json:
`B1:77:8B:BF:10:BE:26:26:FE:54:A1:5B:8C:CE:D4:58:8D:08:EA:DE:BD:C3:78:1A:06:0A:2B:3F:CC:D3:1D:C1`.
Google Digital Asset Links returned linked=true for this association.

Release requires signing the CI AAB with the existing upload key and uploading
to the existing Play testing track. Do not substitute a new signing key.
The installed Play-signed release must still be checked on a physical phone:
launch from the icon and from a notification and confirm the browser toolbar
is absent. The compiler regression check does not prove device-level TWA success.
