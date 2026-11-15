# PMSV publisher signing

The website at https://pmsvgroup.com/downloads offers Android 2.1.0, Windows and Mac 2.2.0 previews, and iPhone Home Screen installation. No native iPhone download or signed desktop release has been published. These signing commands are prepared but cannot be exercised until the publisher supplies the appropriate developer access and certificates.

## iPhone

Required: an active Apple Developer membership, its team ID, and an authorized account in Xcode. The application ID is `com.pmsvgroup.foodsafety`, version 2.2.0, build 12. Register the matching App Store Connect app record and check that the build number has not already been uploaded.

On a Mac, extract the tested signing package. In its root folder, restore dependencies with `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci`, set `APPLE_TEAM_ID` in your local environment, then run:

```sh
bash scripts/sign-ios.sh
```

The script creates a newly signed archive and exports an IPA for App Store Connect. It does not upload or publish the app. It may use Xcode's signed-in account, or an App Store Connect API key supplied through `APPLE_API_KEY` (local `.p8` path), `APPLE_API_KEY_ID`, and `APPLE_API_ISSUER`. The account must have permission to manage the app's signing resources. Keep all credentials outside the source folder.

Validate and upload the IPA using Xcode or Apple's Transporter. Complete the app's privacy declarations, support information and review details in App Store Connect. Test the actual signed app on a physical iPhone using TestFlight; simulator checks do not replace that step. Add the real TestFlight invitation or App Store URL to the website only after Apple makes it available.

## Mac

Required: a Developer ID Application certificate in the Mac keychain (or supplied securely with `CSC_LINK` and `CSC_KEY_PASSWORD`) and Apple notarization access. Supply one complete authentication option:

- `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`;
- `APPLE_API_KEY` (local `.p8` path), `APPLE_API_KEY_ID`, `APPLE_API_ISSUER`; or
- `APPLE_KEYCHAIN_PROFILE` for credentials already stored by `notarytool`.

From the complete repository, install root and platforms dependencies and run `npm run --prefix platforms build:web`. From `platforms`, build on the matching Mac architecture:

```sh
npx electron-builder --config electron-builder.signed.cjs --mac --arm64 --publish never
# Use --x64 on an Intel Mac.
```

The signed configuration removes the preview's ad-hoc identity, requires code signing and enables notarization. It refuses missing notarization credentials. After mounting the produced DMG, verify the contained app with `codesign --verify --deep --strict`, `spctl --assess --type exec --verbose=2`, and `xcrun stapler validate`, then run the existing `tests/desktop-smoke.mjs` against its executable. Only publish packages that pass all checks.

## Windows

Required: a trusted Windows code-signing identity. For a hardware-backed certificate accessible in the Windows certificate store, set `PMSV_WINDOWS_CERTIFICATE_SUBJECT` to its exact subject and configure the certificate provider's signing driver. If an existing valid exportable identity is available, electron-builder also supports `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD`. Cloud signing services require their provider-specific integration; a placeholder or self-signed certificate is not a public-release substitute.

From `platforms` after building the web assets:

```sh
npx electron-builder --config electron-builder.signed.cjs --win --x64 --publish never
```

`forceCodeSigning` prevents silently producing an unsigned release. Check `Get-AuthenticodeSignature` for both the installer and installed `PMSV.exe`; require a `Valid` status and the expected publisher. Run the existing installed-app smoke test before publishing. A valid certificate does not guarantee that Windows reputation prompts disappear immediately.

Do not put passwords, `.p8` files, certificates containing private keys, or provisioning credentials in the public repository, app bundle or website. Configure them in the signing machine or CI secret store. The current previews remain labelled as previews until their signed replacements are verified.

References: [Apple distribution](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases), [electron-builder v26 signing](https://www.electron.build/v26/docs/features/code-signing/), [Microsoft signing choices](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options).
