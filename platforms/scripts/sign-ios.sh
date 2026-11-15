#!/bin/bash
# Run on a Mac with an authorized Apple Developer account in Xcode.
set -euo pipefail
umask 077

if [ "$(uname -s)" != Darwin ]; then
  echo 'iPhone signing requires macOS and Xcode.' >&2; exit 1
fi
if [[ ! "${APPLE_TEAM_ID:-}" =~ ^[A-Z0-9]{10}$ ]]; then
  echo 'Set APPLE_TEAM_ID to your 10-character Apple Developer team ID.' >&2; exit 1
fi

pmsv_dir="$(cd "$(dirname "$0")/.." && pwd)"
project="$pmsv_dir/ios/App/App.xcodeproj"
if [ ! -d "$project" ] || [ ! -d "$pmsv_dir/ios/App/App/public" ]; then
  echo 'Restore the signing package, or run build:web, cap sync ios and xcodegen first.' >&2; exit 1
fi
if [ ! -d "$pmsv_dir/node_modules/@capacitor/ios" ]; then
  echo 'Run ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci in the package folder first.' >&2; exit 1
fi

auth=(-allowProvisioningUpdates)
if [ -n "${APPLE_API_KEY:-}${APPLE_API_KEY_ID:-}${APPLE_API_ISSUER:-}" ]; then
  if [ ! -f "${APPLE_API_KEY:-}" ] || [ -z "${APPLE_API_KEY_ID:-}" ] || [ -z "${APPLE_API_ISSUER:-}" ]; then
    echo 'Provide APPLE_API_KEY as a .p8 file path, plus APPLE_API_KEY_ID and APPLE_API_ISSUER.' >&2; exit 1
  fi
  auth+=(-authenticationKeyPath "$APPLE_API_KEY" -authenticationKeyID "$APPLE_API_KEY_ID" -authenticationKeyIssuerID "$APPLE_API_ISSUER")
fi

output="$pmsv_dir/release/ios-signed-$(date -u +%Y%m%dT%H%M%SZ)-$$"
mkdir -p "$output"
export PMSV_EXPORT_OPTIONS="$output/ExportOptions.plist"
python3 - <<'PY'
import os, plistlib
with open(os.environ['PMSV_EXPORT_OPTIONS'], 'wb') as f:
    plistlib.dump({
        'method': 'app-store-connect',
        'destination': 'export',
        'teamID': os.environ['APPLE_TEAM_ID'],
        'signingStyle': 'automatic',
        'stripSwiftSymbols': True,
        'uploadSymbols': True,
        'manageAppVersionAndBuildNumber': False,
    }, f)
PY

xcodebuild -project "$project" -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$output/PMSV.xcarchive" \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" CODE_SIGN_STYLE=Automatic CODE_SIGNING_ALLOWED=YES \
  "${auth[@]}" archive
xcodebuild -exportArchive -archivePath "$output/PMSV.xcarchive" \
  -exportPath "$output/export" -exportOptionsPlist "$PMSV_EXPORT_OPTIONS" "${auth[@]}"
find "$output/export" -maxdepth 1 -name '*.ipa' -print -quit | while IFS= read -r ipa; do
  shasum -a 256 "$ipa" > "$output/SHA256SUMS.txt"
done
if [ ! -s "$output/SHA256SUMS.txt" ]; then
  echo 'Export did not produce an IPA.' >&2; exit 1
fi
echo "Signed export: $output"
echo 'Validate and upload using Xcode or Transporter, then test on an iPhone before distributing.'
