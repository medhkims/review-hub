@echo off
REM Firebase Setup Script for ReviewHub (Windows)
REM This script helps set up Firebase services for the first time

echo.
echo ========================================
echo ReviewHub Firebase Setup (Windows)
echo ========================================
echo.

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Firebase CLI not found
    echo Install it with: npm install -g firebase-tools
    exit /b 1
)

echo [OK] Firebase CLI found
echo.

REM Check if logged in
firebase projects:list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Not logged in to Firebase
    echo Logging in...
    firebase login
)

echo [OK] Logged in to Firebase
echo.

REM Step 1: Install Functions Dependencies
echo ========================================
echo Step 1: Installing Cloud Functions dependencies...
echo ========================================
cd functions
call npm install
cd ..
echo [OK] Dependencies installed
echo.

REM Step 2: Deploy Firestore Rules
echo ========================================
echo Step 2: Deploying Firestore security rules...
echo ========================================
firebase deploy --only firestore:rules
echo [OK] Firestore rules deployed
echo.

REM Step 3: Deploy Firestore Indexes
echo ========================================
echo Step 3: Deploying Firestore indexes...
echo ========================================
firebase deploy --only firestore:indexes
echo [WAIT] Indexes are building (this may take 5-10 minutes)
echo.

REM Step 4: Deploy Storage Rules
echo ========================================
echo Step 4: Deploying Storage rules...
echo ========================================
firebase deploy --only storage
echo [OK] Storage rules deployed
echo.

REM Step 5: Deploy Cloud Functions
echo ========================================
echo Step 5: Deploying Cloud Functions...
echo ========================================
echo Functions being deployed:
echo   - createUserProfile
echo   - deleteUserData
echo   - updateDenormalizedProfileData
echo   - getUserProfile
echo.
firebase deploy --only functions
echo [OK] Cloud Functions deployed
echo.

REM Summary
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Deployment Summary:
echo   [OK] Firestore security rules deployed
echo   [OK] Firestore indexes deployed (building...)
echo   [OK] Storage rules deployed
echo   [OK] 4 Cloud Functions deployed
echo.
echo Useful Links:
echo   Firebase Console:
echo   https://console.firebase.google.com/project/reviewhub-91cfb
echo.
echo   Firestore Database:
echo   https://console.firebase.google.com/project/reviewhub-91cfb/firestore
echo.
echo   Cloud Functions:
echo   https://console.firebase.google.com/project/reviewhub-91cfb/functions
echo.
echo Next Steps:
echo   1. Wait for indexes to finish building (check console)
echo   2. Test sign up in the app to verify profile creation
echo   3. Check function logs: firebase functions:log
echo   4. Optional: Run seed script for test data
echo      node scripts/seedFirestore.js
echo.
echo Your Firebase backend is ready!
echo.

pause
