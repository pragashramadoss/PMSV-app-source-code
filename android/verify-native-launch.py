"""Verify a real release home; recover only the emulator's System UI ANR."""
import pathlib
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

package, destination = sys.argv[1:]
output = pathlib.Path(destination)
output.parent.mkdir(parents=True, exist_ok=True)

def adb(*args):
    return subprocess.run(["adb", *args], check=True, capture_output=True, text=True).stdout

for attempt in range(8):
    adb("shell", "uiautomator", "dump", "/sdcard/pmsv-launch-check.xml")
    adb("pull", "/sdcard/pmsv-launch-check.xml", str(output))
    tree = ET.parse(output)
    nodes = list(tree.iter("node"))
    if any(n.get("package") == package and "Welcome to the Forum" in n.get("text", "") for n in nodes):
        print(f"Verified native home: {package}")
        sys.exit(0)
    system_ui_anr = any(n.get("text") == "System UI isn't responding" for n in nodes)
    if system_ui_anr:
        wait = next((n for n in nodes if n.get("resource-id") == "android:id/aerr_wait"), None)
        if wait is not None:
            x1, y1, x2, y2 = map(int, re.findall(r"\d+", wait.get("bounds", "")))
            adb("shell", "input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
            print("Waited for the emulator System UI to recover.")
    time.sleep(2)
raise SystemExit(f"Native home did not become visible for {package}; inspect {output}")
