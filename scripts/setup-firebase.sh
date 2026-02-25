#!/bin/bash

# Firebase Setup Script for ReviewHub
# This script helps set up Firebase services for the first time

set -e  # Exit on error

echo "🚀 ReviewHub Firebase Setup"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI found${NC}"

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo "Logging in..."
    firebase login
fi

echo -e "${GREEN}✅ Logged in to Firebase${NC}"
echo ""

# Step 1: Install Functions Dependencies
echo -e "${BLUE}📦 Step 1: Installing Cloud Functions dependencies...${NC}"
cd functions
npm install
cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Deploy Firestore Rules
echo -e "${BLUE}🔒 Step 2: Deploying Firestore security rules...${NC}"
firebase deploy --only firestore:rules
echo -e "${GREEN}✅ Firestore rules deployed${NC}"
echo ""

# Step 3: Deploy Firestore Indexes
echo -e "${BLUE}📑 Step 3: Deploying Firestore indexes...${NC}"
firebase deploy --only firestore:indexes
echo -e "${YELLOW}⏳ Indexes are building (this may take 5-10 minutes)${NC}"
echo ""

# Step 4: Deploy Storage Rules
echo -e "${BLUE}📁 Step 4: Deploying Storage rules...${NC}"
firebase deploy --only storage
echo -e "${GREEN}✅ Storage rules deployed${NC}"
echo ""

# Step 5: Deploy Cloud Functions
echo -e "${BLUE}⚡ Step 5: Deploying Cloud Functions...${NC}"
echo "Functions being deployed:"
echo "  - createUserProfile (creates profile on sign up)"
echo "  - deleteUserData (cleans up on account deletion)"
echo "  - updateDenormalizedProfileData (keeps data in sync)"
echo "  - getUserProfile (callable function for viewing profiles)"
echo ""

firebase deploy --only functions
echo -e "${GREEN}✅ Cloud Functions deployed${NC}"
echo ""

# Summary
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Deployment Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Firestore security rules deployed"
echo "✅ Firestore indexes deployed (building...)"
echo "✅ Storage rules deployed"
echo "✅ 4 Cloud Functions deployed"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔗 Useful Links${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Firebase Console:"
echo "  https://console.firebase.google.com/project/reviewhub-91cfb"
echo ""
echo "Firestore Database:"
echo "  https://console.firebase.google.com/project/reviewhub-91cfb/firestore"
echo ""
echo "Cloud Functions:"
echo "  https://console.firebase.google.com/project/reviewhub-91cfb/functions"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 Next Steps${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Wait for indexes to finish building (check console)"
echo "2. Test sign up in the app to verify profile creation"
echo "3. Check function logs: firebase functions:log"
echo "4. Optional: Run seed script for test data"
echo "   node scripts/seedFirestore.js"
echo ""
echo -e "${GREEN}🎉 Your Firebase backend is ready!${NC}"
