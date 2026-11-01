#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$PWD/deck-13.pdf" "file://$PWD/deck-13.html" 2>/dev/null
pages=$(pdfinfo deck-13.pdf 2>/dev/null | awk '/^Pages:/{print $2}')
echo "wrote deck-13.pdf (${pages:-?} pages)"
