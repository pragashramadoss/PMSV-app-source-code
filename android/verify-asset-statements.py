#!/usr/bin/env python3
"""Validate JSON after Android resource compilation, not just in source XML."""
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

source = Path(__file__).parent / "app/src/main/res/values/strings.xml"
aapt2 = sys.argv[1]
with tempfile.TemporaryDirectory() as output:
    subprocess.run([aapt2, "compile", str(source), "-o", output], check=True)
    dump = subprocess.check_output(
        [aapt2, "dump", "apc", str(Path(output) / "values_strings.arsc.flat")], text=True)
match = re.search(r'string/asset_statements\n\s*\(\) "(.*)" src=', dump)
if not match:
    raise SystemExit("Compiled asset_statements resource is missing")
statements = json.loads(match.group(1))
expected = [{"relation": ["delegate_permission/common.handle_all_urls"],
             "target": {"namespace": "web", "site": "https://pmsvgroup.com"}}]
if statements != expected:
    raise SystemExit("Compiled asset_statements does not match the PMSV production origin")
print("PASS: compiled Android asset_statements is valid JSON for https://pmsvgroup.com")
