#!/usr/bin/env bash
set +e
gradle -p android --no-daemon :native-app:connectedDebugAndroidTest
test_status=$?
mkdir -p native-qa
adb pull /sdcard/Download/pmsv-native-qa native-qa/
if [ "$test_status" -eq 0 ]; then
  # Smoke-test the release variant's install, update and launch with a disposable
  # CI signature. Only the unsigned release leaves CI; distribution uses the
  # backed-up private preview key, never this runner's debug key.
  "$ANDROID_HOME/build-tools/35.0.0/apksigner" sign --ks "$HOME/.android/debug.keystore" --ks-pass pass:android --key-pass pass:android --out /tmp/pmsv-release-test.apk android/native-app/build/outputs/apk/release/native-app-release-unsigned.apk &&
  adb install /tmp/pmsv-release-test.apk &&
  adb install -r /tmp/pmsv-release-test.apk &&
  adb shell am start -W -n com.pmsvgroup.foodsafety.preview/com.pmsvgroup.nativeapp.MainActivity &&
  adb shell uiautomator dump /sdcard/pmsv-release.xml &&
  adb pull /sdcard/pmsv-release.xml native-qa/release-launch.xml &&
  grep -q 'Welcome to the Forum' native-qa/release-launch.xml
  test_status=$?
fi
if [ "$test_status" -ne 0 ]; then
  adb logcat -d -t 1000 > native-qa/emulator-logcat.txt
fi
exit "$test_status"
