#!/bin/bash
# Build single index.html from parts
cd /home/huyhuynh/Documents/web_cttn

CSS=$(cat parts/styles.css)
JS_DATA=$(cat parts/data.js)
JS_APP=$(cat parts/app.js)
JS_COMBINED="${JS_DATA}
${JS_APP}"

# Read HTML template and replace placeholders
sed -e "/__CSS_PLACEHOLDER__/{
  r parts/styles.css
  d
}" -e "/__JS_PLACEHOLDER__/{
  d
}" parts/structure.html > /tmp/temp_build.html

# Now insert JS before the closing script tag
# We need a different approach - use awk
awk '
/__CSS_PLACEHOLDER__/ {
  while ((getline line < "parts/styles.css") > 0) print line
  next
}
/__JS_PLACEHOLDER__/ {
  while ((getline line < "parts/data.js") > 0) print line
  while ((getline line < "parts/app.js") > 0) print line
  next
}
{ print }
' parts/structure.html > index.html

echo "Build complete: index.html ($(wc -c < index.html) bytes)"
