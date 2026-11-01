#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$PWD/ONE_PAGER.pdf" "file://$PWD/one-pager.html" 2>/dev/null
pages=$(pdfinfo ONE_PAGER.pdf 2>/dev/null | awk '/^Pages:/{print $2}')
echo "wrote ONE_PAGER.pdf (${pages:-?} pages)"
