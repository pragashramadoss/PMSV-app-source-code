# PMSV Google Play build

- App: PMSV Food Safety Updates
- Application ID: com.pmsvgroup.foodsafety
- Website: https://pmsvgroup.com/
- Version: 1.0.1 (versionCode 2)
- Target SDK: 36 (Android 16)
- Minimum SDK: 24
- Packaging: Trusted Web Activity using Android Browser Helper

The release bundle built by CI is intentionally unsigned. Signing is performed outside GitHub so the upload key is never committed to the public repository.

After the first AAB is uploaded to Google Play, use Play Console > App integrity to obtain the Google Play app-signing SHA-256 fingerprint. Add that fingerprint to https://pmsvgroup.com/.well-known/assetlinks.json so the TWA is verified when installed from Google Play.
