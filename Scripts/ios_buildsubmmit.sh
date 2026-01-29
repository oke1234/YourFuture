#!/bin/bash

# Script om automatisch te fetchen, rebasen, pushen en iOS build & submitten
# Plaats dit in $DEV/ en voer uit vanuit elke locatie

# Pad naar je repo
REPO_DIR="$HOME/dev/YourFuture"

# Check of de repo bestaat
if [ ! -d "$REPO_DIR" ]; then
  echo "Fout: Repo directory $REPO_DIR bestaat niet!"
  exit 1
fi

cd "$REPO_DIR" || exit 1
echo "🚀 Werkdirectory ingesteld op $REPO_DIR"

# Fetch upstream
echo "🔄 Fetching upstream..."
git fetch upstream
if [ $? -ne 0 ]; then
  echo "Fout: git fetch upstream mislukt!"
  exit 1
fi

# Checkout main
echo "🔧 Checkout main branch..."
git checkout main
if [ $? -ne 0 ]; then
  echo "Fout: git checkout main mislukt!"
  exit 1
fi

# Rebase met upstream/main
echo "♻️ Rebasen met upstream/main..."
git rebase upstream/main
if [ $? -ne 0 ]; then
  echo "Fout: git rebase upstream/main mislukt!"
  echo "Gebruik 'git rebase --abort' om terug te keren naar de vorige staat."
  exit 1
fi

# Config postBuffer voor grote pushes
echo "⚙️ Configureren git http.postBuffer..."
git config http.postBuffer 524288000

# Status tonen
echo "📋 Git status:"
git status

# Push naar origin main
echo "⬆️ Pushen naar origin main..."
git push origin main --force-with-lease
if [ $? -ne 0 ]; then
  echo "Fout: git push mislukt!"
  exit 1
fi

# iOS build
echo "📱 Starten iOS build met EAS..."
eas build -p ios
if [ $? -ne 0 ]; then
  echo "Fout: eas build ios mislukt!"
  exit 1
fi

# iOS submit
echo "🚀 Submitten iOS build met EAS..."
eas submit -p ios
if [ $? -ne 0 ]; then
  echo "Fout: eas submit ios mislukt!"
  exit 1
fi

echo "✅ Build en submit succesvol afgerond!"
