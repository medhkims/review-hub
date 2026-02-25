# ReviewHub Deployment Guide

Complete guide for deploying Firebase services for the ReviewHub app.

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ Logged into Firebase (`firebase login`)
- ✅ Firebase project created (`reviewhub-91cfb`)

---

## Quick Deploy (All Services)

Deploy everything at once:

```bash
# From project root
firebase deploy
```

This will deploy:
- Firestore security rules
- Firestore indexes
- Storage rules
- Cloud Functions

---

## Step-by-Step Deployment

### 1. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

**What this does:**
- Replaces the open development rules with production-ready rules
- Restricts profile access to authenticated users only
- Validates data types and field constraints
- Protects user privacy

**Verify:**
```bash
# Test rules locally (optional)
firebase emulators:start --only firestore
```

---

### 2. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

**What this does:**
- Creates composite indexes for complex queries
- Optimizes search and filtering operations

**Note:** Indexes take a few minutes to build. Monitor progress in Firebase Console:
`https://console.firebase.google.com/project/reviewhub-91cfb/firestore/indexes`

---

### 3. Deploy Storage Rules

```bash
firebase deploy --only storage
```

**What this does:**
- Sets up security rules for Firebase Storage
- Allows authenticated users to upload/download their own files
- Restricts access to user-specific folders

---

### 4. Deploy Cloud Functions

#### Install Dependencies First

```bash
cd functions
npm install
cd ..
```

#### Deploy All Functions

```bash
firebase deploy --only functions
```

#### Deploy Specific Functions

```bash
# Deploy only the createUserProfile function
firebase deploy --only functions:createUserProfile

# Deploy multiple specific functions
firebase deploy --only functions:createUserProfile,functions:deleteUserData
```

**Functions Deployed:**

1. **createUserProfile** (Auth Trigger)
   - Automatically creates Firestore profile when user signs up
   - Triggers: `onCreate` for Firebase Auth users

2. **deleteUserData** (Auth Trigger)
   - Cleans up user data when account is deleted
   - Triggers: `onDelete` for Firebase Auth users

3. **updateDenormalizedProfileData** (Firestore Trigger)
   - Updates user data across collections when profile changes
   - Triggers: `onUpdate` for `/profiles/{userId}` documents

4. **getUserProfile** (Callable Function)
   - HTTP callable function for fetching other users' public profiles
   - Used for viewing profiles, following, etc.

**Verify Functions:**
```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only createUserProfile
```

---

## Testing Locally with Emulators

### Start All Emulators

```bash
firebase emulators:start
```

This starts:
- Auth Emulator (port 9099)
- Firestore Emulator (port 8080)
- Functions Emulator (port 5001)
- Storage Emulator (port 9199)
- Emulator UI (port 4000)

**Access Emulator UI:** `http://localhost:4000`

### Configure App to Use Emulators

Update `src/core/firebase/firebaseConfig.ts`:

```typescript
// DEV: Connect to emulators (comment out in production)
if (__DEV__) {
  const { connectAuthEmulator } = require('firebase/auth');
  const { connectFirestoreEmulator } = require('firebase/firestore');
  const { connectStorageEmulator } = require('firebase/storage');
  const { connectFunctionsEmulator } = require('firebase/functions');

  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

---

## Initial Data Setup

### Option 1: Automatic (Via Sign Up)

The `createUserProfile` Cloud Function automatically creates profiles when users sign up:

1. User signs up via the app
2. Cloud Function triggers
3. Profile document created in Firestore

**No manual setup needed!**

### Option 2: Manual (Firebase Console)

For testing or existing users:

1. Go to Firebase Console: `https://console.firebase.google.com/project/reviewhub-91cfb/firestore`
2. Create collection: `profiles`
3. Add document with user's UID as document ID
4. Add fields according to schema (see `FIRESTORE_STRUCTURE.md`)

### Option 3: Seed Script (For Development)

Create test data:

```bash
# Create a seed script (see below)
node scripts/seedFirestore.js
```

---

## Post-Deployment Checklist

After deploying, verify everything works:

- [ ] **Firestore Rules**: Test profile read/write from app
- [ ] **Cloud Functions**: Sign up a test user and verify profile creation
- [ ] **Storage Rules**: Test avatar upload (when implemented)
- [ ] **Indexes**: Check index build status in Console
- [ ] **Emulators**: Test locally before deploying to production

---

## Monitoring & Logs

### View Cloud Function Logs

```bash
# All logs
firebase functions:log

# Last 100 logs
firebase functions:log --limit 100

# Specific function
firebase functions:log --only createUserProfile

# Follow logs in real-time
firebase functions:log --follow
```

### Firebase Console

Monitor everything in the Firebase Console:

- **Functions**: `https://console.firebase.google.com/project/reviewhub-91cfb/functions`
- **Firestore**: `https://console.firebase.google.com/project/reviewhub-91cfb/firestore`
- **Auth**: `https://console.firebase.google.com/project/reviewhub-91cfb/authentication`
- **Storage**: `https://console.firebase.google.com/project/reviewhub-91cfb/storage`

---

## Rollback

### Revert to Previous Rules

```bash
# Firestore rules are versioned in Firebase Console
# Go to: Firestore → Rules → History
# Select previous version and publish
```

### Revert Cloud Functions

```bash
# Functions are versioned
# Go to: Functions → Select function → History
# Or redeploy previous code from git
git checkout <previous-commit>
firebase deploy --only functions
```

---

## Cost Estimation

### Firestore
- **Reads**: First 50,000/day free, then $0.06 per 100,000
- **Writes**: First 20,000/day free, then $0.18 per 100,000
- **Storage**: First 1 GB free, then $0.18/GB

### Cloud Functions
- **Invocations**: First 2,000,000/month free, then $0.40 per million
- **Compute Time**: First 400,000 GB-seconds free
- **Network Egress**: First 5 GB/month free

### Storage
- **Storage**: First 5 GB free, then $0.026/GB
- **Downloads**: First 1 GB/day free, then $0.12/GB

**Expected Cost (Small App):**
- 0-1000 users: **FREE** (within free tier)
- 1000-10000 users: **$5-20/month**

---

## Troubleshooting

### Error: "Permission Denied" in Firestore

**Solution:** Check security rules are deployed
```bash
firebase deploy --only firestore:rules
```

### Error: Function Failed to Deploy

**Solution:** Check Node.js version
```bash
node --version  # Should be 18+
cd functions && npm install && cd ..
firebase deploy --only functions
```

### Error: Index Not Found

**Solution:** Deploy indexes and wait for build
```bash
firebase deploy --only firestore:indexes
# Wait 5-10 minutes for indexes to build
```

### Cloud Function Not Triggering

**Solution:** Check function logs
```bash
firebase functions:log --only createUserProfile
# Verify the trigger is correct in functions/src/index.ts
```

---

## CI/CD Integration (Future)

### GitHub Actions Example

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: cd functions && npm ci && cd ..
      - uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## Security Reminders

- ✅ Never commit `.env` files
- ✅ Never commit service account keys
- ✅ Always test security rules before deploying
- ✅ Use Firebase App Check in production
- ✅ Enable Firebase Crashlytics for error tracking
- ✅ Set up billing alerts in Google Cloud Console

---

## Next Steps

After successful deployment:

1. **Test the Personal Info screen** in the app
2. **Monitor Cloud Function logs** for the first few sign-ups
3. **Verify Firestore data** is being created correctly
4. **Set up Firebase App Check** for production security
5. **Enable Firebase Analytics** for usage tracking
6. **Implement avatar upload** to complete Personal Info feature

---

## Support

- Firebase Documentation: `https://firebase.google.com/docs`
- Firebase Console: `https://console.firebase.google.com/project/reviewhub-91cfb`
- Firebase Status: `https://status.firebase.google.com/`

For questions, check Firebase StackOverflow or Firebase Discord.
