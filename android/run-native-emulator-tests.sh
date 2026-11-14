#!/usr/bin/env bash
set +e
gradle -p android --no-daemon :native-app:connectedDebugAndroidTest
test_status=$?
mkdir -p native-qa
adb pull /sdcard/Android/data/com.pmsvgroup.foodsafety.nativepreview/files/qa native-qa/
if [ "$test_status" -ne 0 ]; then
  adb logcat -d -t 1000 > native-qa/emulator-logcat.txt
fi
exit "$test_status"
