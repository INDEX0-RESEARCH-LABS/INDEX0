#!/usr/bin/env bash
# Rebuild the surface shots from shots.tpl.html.
#   ./build-shots.sh   -> shots.html + 01-app 02-bug 03-run 04-patch 05-browser 06-receipt
set -euo pipefail
cd "$(dirname "$0")"

missing=0
for f in IBMPlexSans-400.woff2 IBMPlexMono-400.woff2 Manrope-400.woff2 Fraunces-500.woff2; do
  [ -f "/tmp/fonts/$f" ] || { echo "missing /tmp/fonts/$f — see README.md"; missing=1; }
done
[ "$missing" = 0 ] || exit 1

python3 - <<'PY'
import base64, pathlib
def b64(p): return base64.b64encode(pathlib.Path(p).read_bytes()).decode()
out = pathlib.Path("shots.tpl.html").read_text()
for token, f in [("__PLEX_SANS__","IBMPlexSans-400.woff2"),
                 ("__PLEX_MONO__","IBMPlexMono-400.woff2"),
                 ("__MANROPE__","Manrope-400.woff2"),
                 ("__FRAUNCES__","Fraunces-500.woff2")]:
    out = out.replace(token, b64("/tmp/fonts/" + f))
pathlib.Path("shots.html").write_text(out)
PY

names=(app bug run patch browser receipt)

for i in "${!names[@]}"; do
  n=$((i + 1))
  name=$(printf "%02d-%s" "$n" "${names[$i]}")
  chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size=1600,1000 --virtual-time-budget=3000 \
    --screenshot="${name}.png" "file://$PWD/shots.html?n=${n}" >/dev/null 2>&1
  echo "wrote ${name}.png"
done
