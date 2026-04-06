#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-tchecki-tn.sh
# Deploys Claude's app (claude-app branch) to Tchecki.tn
# ─────────────────────────────────────────────────────────────────────────────
set -e

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "▶  Switching to claude-app branch..."
git checkout claude-app

echo "▶  Installing dependencies..."
npm install --legacy-peer-deps

echo "▶  Building web bundle..."
npx expo export --platform web

echo "▶  Deploying to tchecki-tn (Tchecki.tn)..."
npx firebase deploy --only hosting:tchecki-tn --project reviewhub-91cfb

echo "✅  Deployed to https://tchecki-tn.web.app"
echo "    (Connect Tchecki.tn in Firebase Console → Hosting → tchecki-tn → Add custom domain)"

# Return to original branch
git checkout "$CURRENT_BRANCH"
