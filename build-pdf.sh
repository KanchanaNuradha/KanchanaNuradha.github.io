#!/usr/bin/env bash
# ---------------------------------------------------------------
# Generate Kanchana-Nuradha.pdf from the live preview at :4847.
# Requires a Chromium-based browser (Chrome / Brave / Edge).
# ---------------------------------------------------------------
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-4847}"
URL="http://127.0.0.1:${PORT}/"
OUT="${HERE}/Kanchana-Nuradha.pdf"

# Locate a Chromium-based browser
BROWSER=""
for candidate in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium"
do
  if [ -x "$candidate" ]; then BROWSER="$candidate"; break; fi
done

if [ -z "$BROWSER" ]; then
  echo "✗ No Chromium-based browser found in /Applications." >&2
  exit 1
fi

# Boot a local server in the background if nothing's listening on $PORT
if ! curl -s -o /dev/null -w '%{http_code}' "$URL" | grep -q '^2'; then
  echo "→ Starting local server on :$PORT ..."
  (cd "$HERE" && python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &)
  STARTED_SERVER=1
  for _ in $(seq 1 30); do
    sleep 0.2
    curl -s -o /dev/null -w '%{http_code}' "$URL" | grep -q '^2' && break
  done
fi

echo "→ Rendering PDF via $(basename "$BROWSER") ..."
"$BROWSER" \
  --headless=new \
  --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=5000 \
  --no-pdf-header-footer --print-to-pdf-no-header \
  --print-to-pdf="$OUT" \
  "$URL" >/dev/null 2>&1 || true

if [ "${STARTED_SERVER:-0}" = "1" ]; then
  pkill -f "http.server ${PORT}" 2>/dev/null || true
fi

if [ -f "$OUT" ]; then
  echo "✓ Wrote $OUT ($(du -h "$OUT" | cut -f1))"
else
  echo "✗ PDF was not created." >&2
  exit 1
fi
