#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$PWD/deck-uber.pdf" "file://$PWD/deck-uber.html" 2>/dev/null
pages=$(pdfinfo deck-uber.pdf 2>/dev/null | awk '/^Pages:/{print $2}')
echo "wrote deck-uber.pdf (${pages:-?} pages)"
