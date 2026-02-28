@echo off
setlocal enabledelayedexpansion

:: ──────────────────────────────────────────────
::  run_expo_build.bat — Interactive EAS Build Runner (Windows)
:: ──────────────────────────────────────────────

:: ── Parse flags ──
set "PROFILE="
set "PLATFORM="
set "LOCAL_FLAG="

:parse_args
if "%~1"=="" goto :end_parse
if /i "%~1"=="-p" (
    set "PROFILE=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-t" (
    set "PLATFORM=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-l" (
    set "LOCAL_FLAG=--local"
    shift
    goto :parse_args
)
if /i "%~1"=="-h" goto :usage
shift
goto :parse_args
:end_parse

:: ── Verify eas-cli is available ──
where eas >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: eas-cli is not installed.
    echo Install it with: npm install -g eas-cli
    exit /b 1
)

:: ── Interactive profile selection ──
if "%PROFILE%"=="" (
    echo Select a build profile:
    echo   1) development
    echo   2) preview
    echo   3) production
    set /p "PROFILE_CHOICE=Enter choice (1-3): "

    if "!PROFILE_CHOICE!"=="1" set "PROFILE=development"
    if "!PROFILE_CHOICE!"=="2" set "PROFILE=preview"
    if "!PROFILE_CHOICE!"=="3" set "PROFILE=production"

    if "!PROFILE!"=="" (
        echo Invalid selection. Try again.
        exit /b 1
    )
)

:: Validate profile
if /i not "%PROFILE%"=="development" if /i not "%PROFILE%"=="preview" if /i not "%PROFILE%"=="production" (
    echo Error: Invalid profile '%PROFILE%'. Must be one of: development preview production
    exit /b 1
)

:: ── Interactive platform selection ──
if "%PLATFORM%"=="" (
    echo Select a target platform:
    echo   1) android
    echo   2) ios
    echo   3) all
    set /p "PLATFORM_CHOICE=Enter choice (1-3): "

    if "!PLATFORM_CHOICE!"=="1" set "PLATFORM=android"
    if "!PLATFORM_CHOICE!"=="2" set "PLATFORM=ios"
    if "!PLATFORM_CHOICE!"=="3" set "PLATFORM=all"

    if "!PLATFORM!"=="" (
        echo Invalid selection. Try again.
        exit /b 1
    )
)

:: Validate platform
if /i not "%PLATFORM%"=="android" if /i not "%PLATFORM%"=="ios" if /i not "%PLATFORM%"=="all" (
    echo Error: Invalid platform '%PLATFORM%'. Must be one of: android ios all
    exit /b 1
)

:: ── Build the command ──
set "CMD=eas build --profile %PROFILE% --platform %PLATFORM%"

if not "%LOCAL_FLAG%"=="" (
    set "CMD=!CMD! --local"
)

:: ── Confirm and run ──
echo.
echo ──────────────────────────────────
echo   Profile:  %PROFILE%
echo   Platform: %PLATFORM%
if not "%LOCAL_FLAG%"=="" (
    echo   Local:    --local
) else (
    echo   Local:    no
)
echo   Command:  !CMD!
echo ──────────────────────────────────
echo.
set /p "CONFIRM=Proceed with build? (y/N) "
if /i "!CONFIRM!"=="y" (
    !CMD!
) else (
    echo Build cancelled.
    exit /b 0
)

exit /b 0

:: ── Usage ──
:usage
echo Usage: %~nx0 [-p profile] [-t platform] [-l] [-h]
echo.
echo Options:
echo   -p  Build profile: development ^| preview ^| production  (default: interactive)
echo   -t  Target platform: android ^| ios ^| all               (default: interactive)
echo   -l  Run build locally (--local flag)
echo   -h  Show this help message
echo.
echo Examples:
echo   %~nx0                              # Interactive mode
echo   %~nx0 -p preview -t android        # Preview APK build
echo   %~nx0 -p production -t all         # Production build for both platforms
echo   %~nx0 -p development -t android -l # Local development APK build
exit /b 0
