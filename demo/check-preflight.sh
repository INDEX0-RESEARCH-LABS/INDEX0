#!/usr/bin/env bash
# Preflight gate for the demo runner: bad route must fail before docker is touched.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

bash -n demo/run-demo.sh

out="$(DEMO_MODEL=nope ./demo/run-demo.sh 2>&1 || true)"
grep -q "is not a route in infra/litellm/config.yaml" <<<"$out" \
  || { echo "FAIL: unknown route was not rejected"; echo "$out"; exit 1; }

# The failure must come before any container work.
if grep -q "docker run" <<<"$out"; then
  echo "FAIL: started docker before validating the route"; exit 1
fi

echo "preflight ok: syntax valid, unknown route rejected, nothing started"
