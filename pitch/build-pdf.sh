#!/usr/bin/env bash
# Re-export the deck to PDF. Run after editing deck.html.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$PWD/INDEX0_deck.pdf" "file://$PWD/deck.html" 2>/dev/null
pages=$(pdfinfo INDEX0_deck.pdf 2>/dev/null | awk '/^Pages:/{print $2}')
echo "wrote INDEX0_deck.pdf (${pages:-?} pages)"
