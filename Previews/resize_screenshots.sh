#!/bin/bash

# Map waar de screenshots staan
# dit script: chmod +x resize_screenshots.sh

PREVIEWS_DIR="/Users/richardmos_1/dev/YourFuture/Previews"

# Resize functie
resize_screenshots() {
  for file in "$PREVIEWS_DIR"/$1*.png; do
    filename=$(basename "$file")
    output="$PREVIEWS_DIR/${filename%.png}_resized.png"
    echo "Resizing $filename → ${filename%.png}_resized.png"
    sips -z 2778 1284 "$file" --out "$output"
  done
}

# iPhone 15 Pro Max screenshots
resize_screenshots "iphone15pm"

# iPhone 17 Pro Max screenshots
resize_screenshots "iphone17pm"

echo "All done!"
