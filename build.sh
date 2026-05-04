#!/bin/bash
cd /home/huyhuynh/Documents/web_cttn/24icd-qldv

# ============================================================
# Build script — index.html is the source of truth.
# Run this ONCE to split index.html into parts/ for future
# refactoring. After first run, edit parts/*.js / parts/*.css
# and run this again to rebuild index.html from parts.
# ============================================================

EXTRACT=0
if grep -q "__CSS_PLACEHOLDER__\|__JS_PLACEHOLDER__" parts/structure.html 2>/dev/null; then
  # parts/ still has placeholders — assemble from parts/
  echo "[build] Assembling index.html from parts/ ..."
  awk '
/__CSS_PLACEHOLDER__/ { while ((getline line < "parts/styles.css") > 0) print line; next }
/__JS_PLACEHOLDER__/  { print "(() => {"; while ((getline line < "parts/data.js") > 0) print line; while ((getline line < "parts/app1.js") > 0) print line; while ((getline line < "parts/app2.js") > 0) print line; while ((getline line < "parts/app3.js") > 0) print line; print "})();"; next }
{ print }
' parts/structure.html > index.html
  echo "[build] Done — built from parts/"
else
  # No placeholders in parts/ — user edits index.html directly.
  # This script acts as a no-op to avoid accidental overwrites.
  echo "[build] parts/ is already merged (no placeholders)."
  echo "[build] index.html is the source of truth — no rebuild needed."
  echo "[build] To split index.html into parts/: edit this script to set EXTRACT=1, then run again."
fi

echo "Build: index.html ($(wc -c < index.html) bytes, $(wc -l < index.html) lines)"