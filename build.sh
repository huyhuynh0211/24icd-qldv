#!/bin/bash
cd /home/huyhuynh/Documents/web_cttn/24icd-qldv
awk '
/__CSS_PLACEHOLDER__/ { while ((getline line < "parts/styles.css") > 0) print line; next }
/__JS_PLACEHOLDER__/ { print "(() => {"; while ((getline line < "parts/data.js") > 0) print line; while ((getline line < "parts/app1.js") > 0) print line; while ((getline line < "parts/app2.js") > 0) print line; while ((getline line < "parts/app3.js") > 0) print line; print "})();"; next }
{ print }
' parts/structure.html > index.html
echo "Build: index.html ($(wc -c < index.html) bytes, $(wc -l < index.html) lines)"
