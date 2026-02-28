@echo off
setlocal

:: Copy GoogleService-Info.plist from EAS secret to ios directory
if defined GOOGLE_SERVICE_INFO_PLIST (
    copy "%GOOGLE_SERVICE_INFO_PLIST%" "ios\ReviewHub\GoogleService-Info.plist" >nul
    echo GoogleService-Info.plist copied successfully
) else (
    echo Warning: GOOGLE_SERVICE_INFO_PLIST not set
)
