#!/bin/bash
set -euo pipefail

# Copy GoogleService-Info.plist from EAS secret to ios directory
if [ -n "${GOOGLE_SERVICE_INFO_PLIST:-}" ]; then
  cp "$GOOGLE_SERVICE_INFO_PLIST" ios/ReviewHub/GoogleService-Info.plist
  echo "GoogleService-Info.plist copied successfully"
else
  echo "Warning: GOOGLE_SERVICE_INFO_PLIST not set"
fi
