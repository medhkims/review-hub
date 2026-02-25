# Pre-Deployment Checklist

Complete this checklist before deploying Firebase services to production.

---

## ✅ Prerequisites

### 1. Firebase CLI Setup
- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Logged into Firebase (`firebase login`)
- [ ] Correct project selected (`firebase use reviewhub-91cfb`)

**Verify:**
```bash
firebase projects:list
# Should show reviewhub-91cfb
```

### 2. Node.js & Dependencies
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Root dependencies installed (`npm install`)
- [ ] Functions dependencies ready to install

**Verify:**
```bash
node --version  # Should be 18+
npm list --depth=0
```

### 3. Environment Configuration
- [ ] `.env` file exists and configured
- [ ] Firebase config in `app.json`
- [ ] All sensitive files in `.gitignore`

**Verify:**
```bash
# Check .env exists (but don't show contents)
ls -la .env

# Check gitignore
cat .gitignore | grep -E "(serviceAccountKey|\.env|google-services)"
```

---

## 📋 File Verification

### Required Files Exist
- [ ] `firebase.json` (updated with functions config)
- [ ] `firestore.rules` (production security rules)
- [ ] `firestore.indexes.json` (composite indexes)
- [ ] `storage.rules` (storage security)
- [ ] `functions/package.json`
- [ ] `functions/tsconfig.json`
- [ ] `functions/src/index.ts`

**Verify:**
```bash
ls firebase.json firestore.rules firestore.indexes.json storage.rules
ls functions/package.json functions/tsconfig.json functions/src/index.ts
```

### Documentation Complete
- [ ] `FIRESTORE_STRUCTURE.md` created
- [ ] `DEPLOYMENT_GUIDE.md` created
- [ ] `FIREBASE_IMPLEMENTATION_SUMMARY.md` created
- [ ] `QUICK_REFERENCE.md` created

---

## 🔒 Security Check

### Code Review
- [ ] No hardcoded credentials in code
- [ ] No API keys in version control
- [ ] `.gitignore` includes all sensitive files
- [ ] Environment variables properly configured

### Firestore Rules
- [ ] Rules require authentication
- [ ] User can only access own data
- [ ] Data validation in place
- [ ] No open wildcards (`allow read, write: if true`)

**Verify:**
```bash
# Check rules don't have open access
cat firestore.rules | grep "if true"
# Should return nothing
```

### Functions Security
- [ ] Functions use Firebase Admin SDK properly
- [ ] Auth context checked in callable functions
- [ ] Input validation in all functions
- [ ] No sensitive data in function logs

---

## 🏗️ Architecture Verification

### Clean Architecture Compliance
- [ ] Domain layer has zero Firebase imports
- [ ] Data layer implements domain interfaces
- [ ] Presentation uses domain entities only
- [ ] All dependencies wired in `container.ts`

**Verify:**
```bash
# Check Domain layer doesn't import Firebase
grep -r "from 'firebase" src/domain/
# Should return nothing

# Check Presentation doesn't import Data layer
grep -r "from '@/data" src/presentation/
# Should return nothing (except in container.ts)
```

### Data Flow Check
- [ ] Use cases call repositories (not data sources directly)
- [ ] Repositories return `Either<Failure, T>`
- [ ] Models mapped to entities at repository boundary
- [ ] Exceptions caught and converted to Failures

---

## 🧪 Local Testing

### Emulator Testing (Recommended)
- [ ] Start emulators: `firebase emulators:start`
- [ ] Access emulator UI: http://localhost:4000
- [ ] Test Firestore rules in emulator
- [ ] Test functions trigger correctly
- [ ] Test app connects to emulators

**Test Firestore Rules:**
```bash
firebase emulators:start --only firestore
# Then test in Emulator UI
```

### App Testing
- [ ] App builds without errors: `npm run android/ios`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Linting passes: `npx eslint . --ext .ts,.tsx`
- [ ] No console errors in dev
- [ ] Offline mode works

---

## 📦 Functions Preparation

### Functions Build Check
- [ ] Functions directory has `node_modules` or will install
- [ ] TypeScript compiles: `cd functions && npm run build`
- [ ] No type errors
- [ ] No circular dependencies

**Verify:**
```bash
cd functions
npm install
npm run build
cd ..
```

### Functions Review
- [ ] `createUserProfile` - Creates profile on sign-up
- [ ] `deleteUserData` - Cleans up on deletion
- [ ] `updateDenormalizedProfileData` - Syncs data
- [ ] `getUserProfile` - Callable for public profiles

---

## 🚀 Deployment Strategy

### Order of Deployment
1. [ ] **Firestore Rules** (most important - security)
2. [ ] **Firestore Indexes** (may take time to build)
3. [ ] **Storage Rules** (if using storage)
4. [ ] **Cloud Functions** (depends on rules)

### Rollback Plan
- [ ] Know how to rollback rules in Console
- [ ] Have git commit to revert to if needed
- [ ] Know how to check function logs
- [ ] Have backup of current rules (if any)

**Backup Current Rules:**
```bash
# Backup current rules (if any exist)
firebase firestore:rules:get > firestore.rules.backup
```

---

## 📊 Monitoring Setup

### Firebase Console Access
- [ ] Can access: https://console.firebase.google.com/project/reviewhub-91cfb
- [ ] Can view Firestore data
- [ ] Can view function logs
- [ ] Can view authentication users

### Logging Ready
- [ ] Know how to view function logs: `firebase functions:log`
- [ ] Know how to follow logs: `firebase functions:log --follow`
- [ ] Have terminal ready for monitoring

---

## 💰 Billing & Alerts

### Cost Awareness
- [ ] Understand free tier limits
- [ ] Know expected usage
- [ ] Billing alerts configured (optional but recommended)

**Free Tier Limits:**
- Firestore: 50K reads, 20K writes/day
- Functions: 2M invocations/month
- Storage: 5GB storage, 1GB downloads/day

### Google Cloud Console
- [ ] Access: https://console.cloud.google.com
- [ ] Set up budget alerts (recommended)
- [ ] Monitor usage after deployment

---

## 🎯 Post-Deployment Plan

### Immediate Verification (< 5 minutes)
- [ ] Check deployment succeeded
- [ ] View function logs for errors
- [ ] Verify rules deployed
- [ ] Check indexes building status

### Testing (< 30 minutes)
- [ ] Sign up test user
- [ ] Verify profile created automatically
- [ ] Navigate to Personal Info screen
- [ ] Edit profile and save
- [ ] Check Firestore for updated data

### Monitoring (First 24 hours)
- [ ] Monitor function logs regularly
- [ ] Check for error patterns
- [ ] Verify no security issues
- [ ] Monitor usage/costs

---

## 🔧 Troubleshooting Preparation

### Have Ready
- [ ] `DEPLOYMENT_GUIDE.md` open for reference
- [ ] Firebase Console open in browser
- [ ] Terminal ready for commands
- [ ] `QUICK_REFERENCE.md` for commands

### Know These Commands
```bash
# View logs
firebase functions:log --only createUserProfile

# Rollback rules (Console UI)
# Firebase Console → Firestore → Rules → History

# Redeploy specific service
firebase deploy --only functions:createUserProfile

# Check deployment status
firebase projects:list
```

---

## ✅ Final Checklist

Before running deployment:
- [ ] All prerequisites met
- [ ] All files verified
- [ ] Security checks passed
- [ ] Local testing complete
- [ ] Functions build successfully
- [ ] Monitoring ready
- [ ] Troubleshooting guide available
- [ ] Team/stakeholders notified (if applicable)

---

## 🚀 Ready to Deploy?

If all items are checked, you're ready to deploy!

**Quick Deploy:**
```bash
bash scripts/setup-firebase.sh
```

**Or Manual:**
```bash
cd functions && npm install && cd ..
firebase deploy
```

**Monitor:**
```bash
firebase functions:log --follow
```

---

## 📞 Emergency Contacts

If something goes wrong:
- Firebase Status: https://status.firebase.google.com
- Firebase Support: https://firebase.google.com/support
- Documentation: https://firebase.google.com/docs

---

**Last Updated**: 2026-02-16
**Deployment Target**: Production (reviewhub-91cfb)
