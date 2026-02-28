#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────
#  run_dev_build_android.sh — Run dev build on Android emulator
# ──────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

usage() {
  echo "Usage: $0 [-e emulator] [-c] [-h]"
  echo ""
  echo "Builds and runs the ReviewHub dev client on an Android emulator."
  echo ""
  echo "Options:"
  echo "  -e  Emulator AVD name (default: auto-select running or first available)"
  echo "  -c  Clean build (remove android/app/build before building)"
  echo "  -h  Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                          # Build & run on default emulator"
  echo "  $0 -c                       # Clean build & run"
  echo "  $0 -e \"Pixel_7_API_34\"      # Target a specific AVD"
  exit 0
}

# ── Parse flags ──
EMULATOR=""
CLEAN=false

while getopts "e:ch" opt; do
  case $opt in
    e) EMULATOR="$OPTARG" ;;
    c) CLEAN=true ;;
    h) usage ;;
    *) usage ;;
  esac
done

# ── Preflight checks ──
echo "Running preflight checks..."

if ! command -v npx &>/dev/null; then
  echo "Error: npx not found. Install Node.js first."
  exit 1
fi

# Check ANDROID_HOME / ANDROID_SDK_ROOT
ANDROID_SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [ -z "$ANDROID_SDK" ]; then
  echo "Error: ANDROID_HOME or ANDROID_SDK_ROOT is not set."
  echo "Set it in your shell profile, e.g.:"
  echo "  export ANDROID_HOME=\$HOME/Library/Android/sdk"
  exit 1
fi

EMULATOR_BIN="$ANDROID_SDK/emulator/emulator"
ADB_BIN="$ANDROID_SDK/platform-tools/adb"

if [ ! -f "$EMULATOR_BIN" ]; then
  echo "Error: Android emulator not found at $EMULATOR_BIN"
  exit 1
fi

if [ ! -f "$ADB_BIN" ]; then
  echo "Error: adb not found at $ADB_BIN"
  exit 1
fi

# ── Check node_modules ──
if [ ! -d "node_modules" ]; then
  echo "node_modules not found. Installing dependencies..."
  npm install
fi

# ── Clean build if requested ──
if [ "$CLEAN" = true ]; then
  echo "Cleaning Android build artifacts..."
  rm -rf android/app/build
  cd android && ./gradlew clean && cd ..
fi

# ── Start emulator if none is running ──
RUNNING_DEVICE=$("$ADB_BIN" devices 2>/dev/null | grep -w "device" | head -1 | awk '{print $1}')

if [ -z "$RUNNING_DEVICE" ]; then
  echo "No running Android device/emulator detected."

  if [ -n "$EMULATOR" ]; then
    AVD_NAME="$EMULATOR"
  else
    # Pick the first available AVD
    AVD_NAME=$("$EMULATOR_BIN" -list-avds 2>/dev/null | head -1)
    if [ -z "$AVD_NAME" ]; then
      echo "Error: No AVDs found. Create one in Android Studio (Device Manager)."
      exit 1
    fi
  fi

  echo "Starting emulator: $AVD_NAME"
  "$EMULATOR_BIN" -avd "$AVD_NAME" -no-snapshot-load &
  EMULATOR_PID=$!

  # Wait for the emulator to boot
  echo "Waiting for emulator to boot..."
  "$ADB_BIN" wait-for-device

  BOOT_COMPLETED=""
  while [ "$BOOT_COMPLETED" != "1" ]; do
    sleep 2
    BOOT_COMPLETED=$("$ADB_BIN" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || echo "")
  done
  echo "Emulator is ready."
else
  echo "Using running device: $RUNNING_DEVICE"
fi

# ── Build and run ──
echo ""
echo "──────────────────────────────────"
echo "  Building ReviewHub (Debug)"
echo "  Target: Android Emulator"
if [ -n "$EMULATOR" ]; then
  echo "  AVD: $EMULATOR"
else
  echo "  AVD: auto-detect"
fi
echo "──────────────────────────────────"
echo ""

npx expo run:android
