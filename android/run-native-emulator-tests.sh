#!/usr/bin/env bash
set +e
gradle -p android --no-daemon :native-app:connectedDebugAndroidTest
test_status=$?
if [ "$test_status" -eq 0 ]; then
  gradle -p android --no-daemon :play-app:connectedDebugAndroidTest
  test_status=$?
fi
mkdir -p native-qa
adb pull /sdcard/Download/pmsv-native-qa native-qa/
if [ "$test_status" -eq 0 ]; then
  # Smoke-test the release variant's install, update and launch with a disposable
  # CI signature. Only the unsigned release leaves CI; distribution uses the
  # backed-up private preview key, never this runner's debug key.
  keytool -genkeypair -keystore /tmp/pmsv-ci-release.p12 -storetype PKCS12 -alias ci-test -keyalg RSA -keysize 2048 -validity 7 -dname 'CN=Disposable CI test' -storepass android -keypass android &&
  "$ANDROID_HOME/build-tools/35.0.0/apksigner" sign --ks /tmp/pmsv-ci-release.p12 --ks-pass pass:android --key-pass pass:android --out /tmp/pmsv-release-test.apk android/native-app/build/outputs/apk/release/native-app-release-unsigned.apk &&
  adb install /tmp/pmsv-release-test.apk &&
  adb install -r /tmp/pmsv-release-test.apk &&
  adb shell am start -W -n com.pmsvgroup.foodsafety.preview/com.pmsvgroup.nativeapp.MainActivity &&
  python3 android/verify-native-launch.py com.pmsvgroup.foodsafety.preview native-qa/release-launch.xml &&
  adb shell screencap -p /sdcard/pmsv-release.png &&
  adb pull /sdcard/pmsv-release.png native-qa/release-home.png
  test_status=$?
  if [ "$test_status" -eq 0 ]; then
    "$ANDROID_HOME/build-tools/35.0.0/apksigner" sign --ks /tmp/pmsv-ci-release.p12 --ks-pass pass:android --key-pass pass:android --out /tmp/pmsv-play-test.apk android/play-app/build/outputs/apk/release/play-app-release-unsigned.apk &&
    adb install /tmp/pmsv-play-test.apk &&
    adb install -r /tmp/pmsv-play-test.apk &&
    adb shell am start -W -n com.pmsvgroup.foodsafety/com.pmsvgroup.nativeapp.MainActivity &&
    python3 android/verify-native-launch.py com.pmsvgroup.foodsafety native-qa/play-release-launch.xml
    test_status=$?
  fi
fi
if [ "$test_status" -ne 0 ]; then
  adb logcat -d -t 1000 > native-qa/emulator-logcat.txt
fi
exit "$test_status"
