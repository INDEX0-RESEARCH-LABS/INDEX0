#!/usr/bin/env bash
# Rebuild the surface shots from shots.tpl.html.
#   ./build-shots.sh          -> shots.html + shots/NN-*.png (with caption strip)
#                                + shots/NN-*-bare.png (no strip, for the deck)
set -euo pipefail
cd "$(dirname "$0")"

python3 - <<'PY'
import base64, pathlib
b64 = base64.b64encode(open("/tmp/fonts/inter-400.woff2", "rb").read()).decode()
tpl = pathlib.Path("shots.tpl.html").read_text()
pathlib.Path("shots.html").write_text(tpl.replace("__INTER__", b64))
PY

names=(cli editor browser surfaces loop)
mkdir -p .

for i in "${!names[@]}"; do
  n=$((i + 1))
  name=$(printf "%02d-%s" "$n" "${names[$i]}")
  chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size=1600,1000 --virtual-time-budget=2500 \
    --screenshot="${name}.png" "file://$PWD/shots.html?n=${n}" >/dev/null 2>&1
  chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size=1600,940 --virtual-time-budget=2500 \
    --screenshot="${name}-bare.png" "file://$PWD/shots.html?n=${n}&bare=1" >/dev/null 2>&1
  echo "wrote ${name}.png"
done

# 01 carries a margin-annotation column; the deck shows the terminal alone so the
# three thumbnails share one aspect ratio.
magick 01-cli-bare.png -crop 1200x724+78+108 +repage 01-cli-deck.png
echo "wrote 01-cli-deck.png"
