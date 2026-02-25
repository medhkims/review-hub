#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────
#  run_dev_build_ios.sh — Run dev build on local iPhone
# ──────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

usage() {
  echo "Usage: $0 [-d device] [-c] [-n] [-h]"
  echo ""
  echo "Builds and runs the ReviewHub dev client on a local iOS device."
  echo ""
  echo "Options:"
  echo "  -d  Device name or UDID (default: auto-select connected device)"
  echo "  -c  Clean build (remove ios/build before building)"
  echo "  -n  Skip pod install"
  echo "  -h  Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                          # Build & run on connected iPhone"
  echo "  $0 -c                       # Clean build & run"
  echo "  $0 -d \"iPhone de Mohamed\"   # Target a specific device"
  exit 0
}

# ── Parse flags ──
DEVICE=""
CLEAN=false
SKIP_PODS=false

while getopts "d:cnh" opt; do
  case $opt in
    d) DEVICE="$OPTARG" ;;
    c) CLEAN=true ;;
    n) SKIP_PODS=true ;;
    h) usage ;;
    *) usage ;;
  esac
done

# ── Preflight checks ──
echo "🔍 Running preflight checks..."

if ! command -v xcodebuild &>/dev/null; then
  echo "Error: Xcode command-line tools not found."
  echo "Install with: xcode-select --install"
  exit 1
fi

if ! command -v npx &>/dev/null; then
  echo "Error: npx not found. Install Node.js first."
  exit 1
fi

if ! command -v pod &>/dev/null; then
  echo "Warning: CocoaPods not found. Install with: sudo gem install cocoapods"
  echo "Proceeding anyway (pod install may be skipped)..."
fi

# ── Check node_modules ──
if [ ! -d "node_modules" ]; then
  echo "📦 node_modules not found. Installing dependencies..."
  npm install
fi

# ── Clean build if requested ──
if [ "$CLEAN" = true ]; then
  echo "🧹 Cleaning iOS build artifacts..."
  rm -rf ios/build
  rm -rf ios/Pods
  SKIP_PODS=false
fi

# ── Pod install ──
if [ "$SKIP_PODS" = false ]; then
  if [ -f "ios/Podfile" ]; then
    echo "📱 Installing CocoaPods dependencies..."
    cd ios
    pod install
    cd ..
  fi
fi

# ── Build and run ──
echo ""
echo "──────────────────────────────────"
echo "  Building ReviewHub (Debug)"
echo "  Target: Physical iOS device"
if [ -n "$DEVICE" ]; then
  echo "  Device: $DEVICE"
else
  echo "  Device: auto-detect"
fi
echo "──────────────────────────────────"
echo ""

CMD="npx expo run:ios --device"

if [ -n "$DEVICE" ]; then
  CMD="$CMD \"$DEVICE\""
fi

eval "$CMD"
