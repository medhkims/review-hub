#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
#  run_expo_build.sh — Interactive EAS Build Runner
# ──────────────────────────────────────────────

PROFILES=("development" "preview" "production")
PLATFORMS=("android" "ios" "all")

usage() {
  echo "Usage: $0 [-p profile] [-t platform] [-l] [-h]"
  echo ""
  echo "Options:"
  echo "  -p  Build profile: development | preview | production  (default: interactive)"
  echo "  -t  Target platform: android | ios | all               (default: interactive)"
  echo "  -l  Run build locally (--local flag)"
  echo "  -h  Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                              # Interactive mode"
  echo "  $0 -p preview -t android        # Preview APK build"
  echo "  $0 -p production -t all         # Production build for both platforms"
  echo "  $0 -p development -t android -l # Local development APK build"
  exit 0
}

# ── Parse flags ──
PROFILE=""
PLATFORM=""
LOCAL_FLAG=""

while getopts "p:t:lh" opt; do
  case $opt in
    p) PROFILE="$OPTARG" ;;
    t) PLATFORM="$OPTARG" ;;
    l) LOCAL_FLAG="--local" ;;
    h) usage ;;
    *) usage ;;
  esac
done

# ── Verify eas-cli is available ──
if ! command -v eas &>/dev/null; then
  echo "Error: eas-cli is not installed."
  echo "Install it with: npm install -g eas-cli"
  exit 1
fi

# ── Interactive profile selection ──
if [[ -z "$PROFILE" ]]; then
  echo "Select a build profile:"
  select PROFILE in "${PROFILES[@]}"; do
    [[ -n "$PROFILE" ]] && break
    echo "Invalid selection. Try again."
  done
fi

# Validate profile
if [[ ! " ${PROFILES[*]} " =~ " ${PROFILE} " ]]; then
  echo "Error: Invalid profile '$PROFILE'. Must be one of: ${PROFILES[*]}"
  exit 1
fi

# ── Interactive platform selection ──
if [[ -z "$PLATFORM" ]]; then
  echo "Select a target platform:"
  select PLATFORM in "${PLATFORMS[@]}"; do
    [[ -n "$PLATFORM" ]] && break
    echo "Invalid selection. Try again."
  done
fi

# Validate platform
if [[ ! " ${PLATFORMS[*]} " =~ " ${PLATFORM} " ]]; then
  echo "Error: Invalid platform '$PLATFORM'. Must be one of: ${PLATFORMS[*]}"
  exit 1
fi

# ── Build the command ──
CMD="eas build --profile $PROFILE"

if [[ "$PLATFORM" != "all" ]]; then
  CMD="$CMD --platform $PLATFORM"
else
  CMD="$CMD --platform all"
fi

if [[ -n "$LOCAL_FLAG" ]]; then
  CMD="$CMD --local"
fi

# ── Confirm and run ──
echo ""
echo "──────────────────────────────────"
echo "  Profile:  $PROFILE"
echo "  Platform: $PLATFORM"
echo "  Local:    ${LOCAL_FLAG:-no}"
echo "  Command:  $CMD"
echo "──────────────────────────────────"
echo ""
read -rp "Proceed with build? (y/N) " confirm
if [[ "$confirm" =~ ^[Yy]$ ]]; then
  eval "$CMD"
else
  echo "Build cancelled."
  exit 0
fi
