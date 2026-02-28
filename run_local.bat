@echo off
setlocal enabledelayedexpansion

:: ──────────────────────────────────────────────────────────
::  run_local.bat — Start Expo Dev Server on localhost (Windows)
:: ──────────────────────────────────────────────────────────

cd /d "%~dp0"

:: ── Parse flags ──
set "MODE="
set "PORT="
set "CLEAR_CACHE=false"

:parse_args
if "%~1"=="" goto :end_parse
if /i "%~1"=="-m" (
    set "MODE=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-p" (
    set "PORT=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-c" (
    set "CLEAR_CACHE=true"
    shift
    goto :parse_args
)
if /i "%~1"=="-h" goto :usage
shift
goto :parse_args
:end_parse

:: ── Preflight checks ──
echo Running preflight checks...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Download it from https://nodejs.org
    exit /b 1
)

where npx >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npx not found. Install Node.js first.
    exit /b 1
)

:: ── Check node_modules ──
if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error: npm install failed.
        exit /b 1
    )
)

:: ── Interactive mode selection ──
if "%MODE%"=="" (
    echo.
    echo Select how to run the project:
    echo   1) Default   — Expo dev server (QR code for mobile)
    echo   2) Web       — Open in web browser (localhost)
    echo   3) Android   — Launch on Android emulator
    echo   4) Tunnel    — Expose via ngrok tunnel (remote devices)
    set /p "MODE_CHOICE=Enter choice (1-4): "

    if "!MODE_CHOICE!"=="1" set "MODE=default"
    if "!MODE_CHOICE!"=="2" set "MODE=web"
    if "!MODE_CHOICE!"=="3" set "MODE=android"
    if "!MODE_CHOICE!"=="4" set "MODE=tunnel"

    if "!MODE!"=="" (
        echo Invalid selection. Try again.
        exit /b 1
    )
)

:: Validate mode
if /i not "%MODE%"=="default" if /i not "%MODE%"=="web" if /i not "%MODE%"=="android" if /i not "%MODE%"=="tunnel" (
    echo Error: Invalid mode '%MODE%'. Must be one of: default web android tunnel
    exit /b 1
)

:: ── Build the command ──
if /i "%MODE%"=="web" (
    set "CMD=npx expo start --web"
) else if /i "%MODE%"=="android" (
    set "CMD=npx expo start --android"
) else if /i "%MODE%"=="tunnel" (
    set "CMD=npx expo start --tunnel"
) else (
    set "CMD=npx expo start"
)

if not "%PORT%"=="" (
    set "CMD=!CMD! --port %PORT%"
)

if "%CLEAR_CACHE%"=="true" (
    set "CMD=!CMD! --clear"
)

:: ── Confirm and run ──
echo.
echo ──────────────────────────────────
echo   ReviewHub — Local Dev Server
echo ──────────────────────────────────
echo   Mode:        %MODE%
if not "%PORT%"=="" (
    echo   Port:        %PORT%
) else (
    echo   Port:        8081 (default)
)
if "%CLEAR_CACHE%"=="true" (
    echo   Clear cache: yes
) else (
    echo   Clear cache: no
)
echo   Command:     !CMD!
echo ──────────────────────────────────
echo.

!CMD!

exit /b 0

:: ── Usage ──
:usage
echo Usage: %~nx0 [-m mode] [-p port] [-c] [-h]
echo.
echo Starts the Expo development server on localhost.
echo.
echo Options:
echo   -m  Run mode: default ^| web ^| android ^| tunnel  (default: interactive)
echo   -p  Port number (default: 8081)
echo   -c  Clear Metro bundler cache before starting
echo   -h  Show this help message
echo.
echo Examples:
echo   %~nx0                        # Interactive mode selection
echo   %~nx0 -m web                 # Start web on localhost
echo   %~nx0 -m default -p 3000     # Dev server on port 3000
echo   %~nx0 -m web -c              # Web mode with cache cleared
echo   %~nx0 -m tunnel              # Expose via ngrok for remote testing
exit /b 0
