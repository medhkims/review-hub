#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-tchecki-com.sh
# Deploys Mohamed's app (master branch) to Tchecki.com
# ─────────────────────────────────────────────────────────────────────────────
set -e

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "▶  Switching to master branch..."
git checkout master

echo "▶  Installing dependencies..."
npm install --legacy-peer-deps

echo "▶  Building web bundle..."
npx expo export --platform web

echo "▶  Deploying to tchecki-com (Tchecki.com)..."
npx firebase deploy --only hosting:tchecki-com --project reviewhub-91cfb

echo "✅  Deployed to https://tchecki-com.web.app"
echo "    (Connect Tchecki.com in Firebase Console → Hosting → tchecki-com → Add custom domain)"

# Return to original branch
git checkout "$CURRENT_BRANCH"
