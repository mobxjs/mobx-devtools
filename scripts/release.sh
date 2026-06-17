#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

# --- Preflight checks ---

if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean. Commit or stash changes first."
  exit 1
fi

BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "master" ]; then
  echo "Error: Must be on master branch (currently on '$BRANCH')."
  exit 1
fi

git pull --ff-only origin master

# --- Bump version ---

npm run bootstrap
node scripts/bump-version.js

VERSION=$(node -p "require('./package.json').version")

# --- Build ---

npm run build

# --- Commit, push & release ---

git add -A
git commit -m "chore: Release $VERSION"
git push origin master

gh release create "$VERSION" \
  --title "$VERSION" \
  --generate-notes \
  ./lib/*.zip

# --- Print release notes ---

NOTES=$(gh release view "$VERSION" --json body -q .body)

echo ""
echo "=== Release $VERSION published ==="
echo ""
echo "GitHub: $(gh release view "$VERSION" --json url -q .url)"
echo ""
echo "--- Release notes ---"
echo ""
echo "$NOTES"
echo ""
echo "--- Upload to stores ---"
echo "  Chrome:  https://chrome.google.com/webstore/devconsole"
echo "  Firefox: https://addons.mozilla.org/en-US/developers/addons"
echo ""
echo "Zip files:"
echo "  ./lib/chrome.zip"
echo "  ./lib/firefox.zip"
