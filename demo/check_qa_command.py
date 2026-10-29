"""Smoke-check the QA verification command against the real sandbox.

Builds the same command qa.py builds, posts it to the sandbox-manager, and
prints the observed result. Run with the orchestrator on PYTHONPATH.
"""
import json
import sys

import httpx

from src.graph.nodes.qa import verification_command

PATCH = """diff --git a/src/math.js b/src/math.js
--- a/src/math.js
+++ b/src/math.js
@@ -1,5 +1,8 @@
 // Billing rate helper. NOTE: divide() has no zero guard — see test/math.test.js.
 export function divide(numerator, denominator) {
+  if (denominator === 0) {
+    throw new RangeError("division by zero");
+  }
   return numerator / denominator;
 }
 
"""


def run(label, diff):
    command = verification_command(diff)
    resp = httpx.post(
        "http://localhost:4001/execute",
        json={
            "id": "smoke",
            "code": command,
            "language": "bash",
            "timeoutMs": 120000,
            "environmentVariables": {
                "SANDBOX_WORKSPACE_PATH": "/home/darion-dev/Dev/Incubator/INDEX0/demo/workspace"
            },
        },
        timeout=140.0,
    )
    data = resp.json().get("data", {})
    print(f"--- {label}: exitCode={data.get('exitCode')} duration={data.get('durationMs')}ms")
    tail = (data.get("stdout") or "").strip().splitlines()[-14:]
    print("\n".join(tail))
    if data.get("stderr"):
        print("STDERR:", data["stderr"].strip()[:400])
    return data.get("exitCode")


if __name__ == "__main__":
    failed = run("no patch (bug present)", "")
    passed = run("with fix", PATCH)
    ok = failed != 0 and passed == 0
    print("RESULT:", "PASS" if ok else "FAIL")
    sys.exit(0 if ok else 1)
