#!/usr/bin/env bash
# Rebuild the surface shots from shots.tpl.html.
#   ./build-shots.sh   -> shots.html + 01-ask 02-terminal 03-editor 04-browser 05-receipt
set -euo pipefail
cd "$(dirname "$0")"

for f in IBMPlexSans-400.woff2 IBMPlexMono-400.woff2; do
  [ -f "/tmp/fonts/$f" ] || { echo "missing /tmp/fonts/$f — see README.md"; exit 1; }
done

python3 - <<'PY'
import base64, pathlib
def b64(p): return base64.b64encode(pathlib.Path(p).read_bytes()).decode()
tpl = pathlib.Path("shots.tpl.html").read_text()
out = tpl.replace("__PLEX_SANS__", b64("/tmp/fonts/IBMPlexSans-400.woff2"))
out = out.replace("__PLEX_MONO__", b64("/tmp/fonts/IBMPlexMono-400.woff2"))
pathlib.Path("shots.html").write_text(out)
PY

names=(ask terminal editor browser receipt)

for i in "${!names[@]}"; do
  n=$((i + 1))
  name=$(printf "%02d-%s" "$n" "${names[$i]}")
  chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size=1600,1000 --virtual-time-budget=2500 \
    --screenshot="${name}.png" "file://$PWD/shots.html?n=${n}" >/dev/null 2>&1
  echo "wrote ${name}.png"
done
