@echo off
setlocal enabledelayedexpansion

:: ──────────────────────────────────────────────────────────
::  run_dev_build_android.bat — Run dev build on Android emulator (Windows)
:: ──────────────────────────────────────────────────────────

cd /d "%~dp0"

:: ── Parse flags ──
set "EMULATOR="
set "CLEAN=false"

:parse_args
if "%~1"=="" goto :end_parse
if /i "%~1"=="-e" (
    set "EMULATOR=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-c" (
    set "CLEAN=true"
    shift
    goto :parse_args
)
if /i "%~1"=="-h" goto :usage
shift
goto :parse_args
:end_parse

:: ── Preflight checks ──
echo Running preflight checks...

where npx >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npx not found. Install Node.js first.
    exit /b 1
)

:: Check ANDROID_HOME / ANDROID_SDK_ROOT
set "ANDROID_SDK=%ANDROID_HOME%"
if "%ANDROID_SDK%"=="" set "ANDROID_SDK=%ANDROID_SDK_ROOT%"
if "%ANDROID_SDK%"=="" (
    :: Try default Windows path
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
        echo ANDROID_HOME not set. Using default: !ANDROID_SDK!
    ) else (
        echo Error: ANDROID_HOME or ANDROID_SDK_ROOT is not set.
        echo Set it in your system environment variables, e.g.:
        echo   setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
        exit /b 1
    )
)

set "EMULATOR_BIN=%ANDROID_SDK%\emulator\emulator.exe"
set "ADB_BIN=%ANDROID_SDK%\platform-tools\adb.exe"

if not exist "%EMULATOR_BIN%" (
    echo Error: Android emulator not found at %EMULATOR_BIN%
    exit /b 1
)

if not exist "%ADB_BIN%" (
    echo Error: adb not found at %ADB_BIN%
    exit /b 1
)

:: ── Check node_modules ──
if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    call npm install
)

:: ── Clean build if requested ──
if "%CLEAN%"=="true" (
    echo Cleaning Android build artifacts...
    if exist "android\app\build" rmdir /s /q "android\app\build"
    pushd android
    call gradlew.bat clean
    popd
)

:: ── Start emulator if none is running ──
set "RUNNING_DEVICE="
for /f "tokens=1" %%a in ('"%ADB_BIN%" devices 2^>nul ^| findstr /r /c:"device$"') do (
    if not defined RUNNING_DEVICE set "RUNNING_DEVICE=%%a"
)

if not defined RUNNING_DEVICE (
    echo No running Android device/emulator detected.

    if defined EMULATOR (
        set "AVD_NAME=%EMULATOR%"
    ) else (
        :: Pick the first available AVD
        set "AVD_NAME="
        for /f "delims=" %%a in ('"%EMULATOR_BIN%" -list-avds 2^>nul') do (
            if not defined AVD_NAME set "AVD_NAME=%%a"
        )
        if not defined AVD_NAME (
            echo Error: No AVDs found. Create one in Android Studio ^(Device Manager^).
            exit /b 1
        )
    )

    echo Starting emulator: !AVD_NAME!
    start "" "%EMULATOR_BIN%" -avd "!AVD_NAME!" -no-snapshot-load

    :: Wait for the emulator to boot
    echo Waiting for emulator to boot...
    "%ADB_BIN%" wait-for-device

    :wait_boot
    set "BOOT_COMPLETED="
    for /f "delims=" %%a in ('"%ADB_BIN%" shell getprop sys.boot_completed 2^>nul') do set "BOOT_COMPLETED=%%a"
    set "BOOT_COMPLETED=!BOOT_COMPLETED: =!"
    if not "!BOOT_COMPLETED!"=="1" (
        timeout /t 2 /nobreak >nul
        goto :wait_boot
    )
    echo Emulator is ready.
) else (
    echo Using running device: %RUNNING_DEVICE%
)

:: ── Build and run ──
echo.
echo ──────────────────────────────────
echo   Building ReviewHub (Debug)
echo   Target: Android Emulator
if defined EMULATOR (
    echo   AVD: %EMULATOR%
) else (
    echo   AVD: auto-detect
)
echo ──────────────────────────────────
echo.

call npx expo run:android

exit /b 0

:: ── Usage ──
:usage
echo Usage: %~nx0 [-e emulator] [-c] [-h]
echo.
echo Builds and runs the ReviewHub dev client on an Android emulator.
echo.
echo Options:
echo   -e  Emulator AVD name (default: auto-select running or first available)
echo   -c  Clean build (remove android\app\build before building)
echo   -h  Show this help message
echo.
echo Examples:
echo   %~nx0                          # Build ^& run on default emulator
echo   %~nx0 -c                       # Clean build ^& run
echo   %~nx0 -e "Pixel_7_API_34"      # Target a specific AVD
exit /b 0
