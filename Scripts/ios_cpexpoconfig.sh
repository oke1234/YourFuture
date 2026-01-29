#!/bin/bash
# MacExpoConfigFull.sh
# Kopieert belangrijke configuratiebestanden en .env bestanden naar clipboard

# Project root (één niveau boven /scripts)
PROJECT_ROOT="$(dirname "$0")/.."

# Bestandslocaties
APP_CONFIG="$PROJECT_ROOT/app.config.js"
EAS_CONFIG="$PROJECT_ROOT/eas.json"
POD_FILE="$PROJECT_ROOT/ios/Podfile"
FIX_POD_SCRIPT="$PROJECT_ROOT/scripts/fixPodfile.js"
PACKAGE_JSON="$PROJECT_ROOT/package.json"
ENV_LOCAL="$PROJECT_ROOT/.env.local"
ENV_PROD="$PROJECT_ROOT/.env.production"

# Lees bestanden
APP_CONTENT=$(cat "$APP_CONFIG" 2>/dev/null || echo "app.config.js niet gevonden")
EAS_CONTENT=$(cat "$EAS_CONFIG" 2>/dev/null || echo "eas.json niet gevonden")
POD_CONTENT=$(cat "$POD_FILE" 2>/dev/null || echo "Podfile niet gevonden")
FIX_POD_CONTENT=$(cat "$FIX_POD_SCRIPT" 2>/dev/null || echo "scripts/fixPodfile.js niet gevonden")
PACKAGE_CONTENT=$(cat "$PACKAGE_JSON" 2>/dev/null || echo "package.json niet gevonden")
ENV_LOCAL_CONTENT=$(cat "$ENV_LOCAL" 2>/dev/null || echo ".env.local niet gevonden")
ENV_PROD_CONTENT=$(cat "$ENV_PROD" 2>/dev/null || echo ".env.production niet gevonden")

# Pak belangrijke info (bundleIdentifier en projectId) met macOS grep/sed
BUNDLE_ID=$(grep 'bundleIdentifier' "$APP_CONFIG" | head -n 1 | sed 's/.*bundleIdentifier[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
PROJECT_ID=$(grep 'projectId' "$APP_CONFIG" | head -n 1 | sed 's/.*projectId[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Combineer alles
OUTPUT="===== app.config.js =====
$APP_CONTENT

===== eas.json =====
$EAS_CONTENT

===== Podfile =====
$POD_CONTENT

===== scripts/fixPodfile.js =====
$FIX_POD_CONTENT

===== package.json =====
$PACKAGE_CONTENT

===== .env.local =====
$ENV_LOCAL_CONTENT

===== .env.production =====
$ENV_PROD_CONTENT

===== Belangrijke info =====
Bundle Identifier: $BUNDLE_ID
EAS Project ID: $PROJECT_ID
"

# Kopieer naar macOS clipboard
echo "$OUTPUT" | pbcopy

echo "Alle relevante configuratie (incl. package.json en .env bestanden) is gekopieerd naar je clipboard! 😄"
