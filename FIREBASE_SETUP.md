# 🔥 Firebase Setup Guide - ReviewHub

## ✅ Configuration Complete!

Your Firebase project is fully configured and ready to use. This document provides reference information and next steps.

---

## 📊 Project Overview

| Property | Value |
|----------|-------|
| **Project Name** | ReviewHub |
| **Project ID** | reviewhub-91cfb |
| **Project Number** | 713435343120 |
| **Region** | nam5 (US) |
| **Console URL** | https://console.firebase.google.com/project/reviewhub-91cfb |

---

## 📱 Registered Apps

### iOS App
- **App ID**: `1:713435343120:ios:2dc63f632b3390448cdd95`
- **Bundle ID**: `com.reviewhub.app`
- **Config File**: `GoogleService-Info.plist`

### Android App
- **App ID**: `1:713435343120:android:5c42ee77f314a95b8cdd95`
- **Package Name**: `com.reviewhub.app`
- **Config File**: `google-services.json`

### Web App
- **App ID**: `1:713435343120:web:054ce9a892746b748cdd95`
- **Config**: Stored in `app.json` extra field

---

## 🔧 Enabled Services

### 1. Firestore Database
- **Status**: ✅ Enabled
- **Database ID**: `(default)`
- **Region**: `nam5`
- **Mode**: Native mode with offline persistence
- **Rules File**: `firestore.rules`
- **Console**: https://console.firebase.google.com/project/reviewhub-91cfb/firestore

### 2. Authentication
- **Status**: ✅ Enabled
- **Providers**:
  - ✅ Email/Password (enabled)
  - ✅ Google Sign-In (configured)
  - ❌ Anonymous (disabled)
- **Console**: https://console.firebase.google.com/project/reviewhub-91cfb/authentication

### 3. Cloud Storage
- **Status**: ✅ Enabled
- **Bucket**: `reviewhub-91cfb.firebasestorage.app`
- **Rules File**: `storage.rules`
- **Console**: https://console.firebase.google.com/project/reviewhub-91cfb/storage

### 4. Cloud Functions
- **Status**: ⏳ Ready (not deployed)
- **Region**: Will be configured on first deploy

---

## 🔐 Security Configuration

### Firestore Rules (`firestore.rules`)
```
⚠️ IMPORTANT: Current rules are OPEN and expire March 18, 2026
```

**Current Rules**: Allow all read/write until expiration date

**Before Production**: Update rules to implement proper access control:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Add more collection-specific rules here...
  }
}
```

### Storage Rules (`storage.rules`)
```
✅ Configured with user-based authentication
```

**Current Setup**:
- Users can read/write files in their own folder (`/users/{userId}`)
- Profile pictures are publicly readable
- Posts and chat attachments require authentication

---

## 📁 Project Structure

```
ReviewHub/
├── .env                          # Firebase credentials (gitignored) ✅
├── .env.example                  # Template for environment variables ✅
├── firebase.json                 # Firebase configuration ✅
├── firestore.rules              # Firestore security rules ✅
├── firestore.indexes.json       # Firestore indexes ✅
├── storage.rules                # Storage security rules ✅
├── google-services.json         # Android config (gitignored) ✅
├── GoogleService-Info.plist     # iOS config (gitignored) ✅
└── src/
    └── core/
        └── firebase/
            ├── firebaseConfig.ts    # Firebase initialization ✅
            └── firebaseTest.ts      # Connection test utility ✅
```

---

## 🚀 Next Steps

### 1. Test Firebase Connection
```bash
# Start the development server
npx expo start
```

In your app, you can test the connection:
```typescript
import { testFirebaseConnection } from '@/core/firebase/firebaseTest';

// Test Firebase services
testFirebaseConnection();
```

### 2. Deploy Security Rules (Important!)
```bash
# Make sure you're in the project directory
cd c:\Users\ASUS\Desktop\ReviewHub

# Login if not already logged in
firebase login

# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules
```

### 3. Update Firestore Security Rules
1. Open `firestore.rules`
2. Replace the default rules with production-ready rules
3. Deploy using the command above

### 4. Enable Additional Auth Providers (Optional)

**Google Sign-In**:
1. Go to [Authentication Console](https://console.firebase.google.com/project/reviewhub-91cfb/authentication/providers)
2. Click "Google" provider
3. Enable and configure OAuth consent screen
4. Add authorized domains

**Other Providers**:
- Facebook, Apple, Twitter, GitHub, etc. can be enabled in the console

### 5. Create Firestore Indexes (As Needed)

When you create complex queries, Firebase will prompt you to create indexes. Add them to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Then deploy:
```bash
firebase deploy --only firestore:indexes
```

---

## 🧪 Testing Firebase

### Manual Test in Console
1. **Firestore**: Go to the [Firestore console](https://console.firebase.google.com/project/reviewhub-91cfb/firestore)
   - Create a test collection
   - Add a document
   - Verify offline persistence in your app

2. **Authentication**: Go to the [Auth console](https://console.firebase.google.com/project/reviewhub-91cfb/authentication/users)
   - Manually add a test user
   - Try signing in from your app

3. **Storage**: Go to the [Storage console](https://console.firebase.google.com/project/reviewhub-91cfb/storage)
   - Create a test folder
   - Upload a test file

### Automated Test
Use the test utility in your code:
```typescript
import { testFirebaseConnection, getFirebaseStatus } from '@/core/firebase/firebaseTest';

// Test connection
await testFirebaseConnection();

// Get status
const status = getFirebaseStatus();
console.log(status);
```

---

## 📝 Environment Variables

All Firebase credentials are stored in `.env`:

```env
FIREBASE_API_KEY=AIzaSyC2P11O4HM--Gu8XaCV3lRgg-hqZ7qvV8g
FIREBASE_AUTH_DOMAIN=reviewhub-91cfb.firebaseapp.com
FIREBASE_PROJECT_ID=reviewhub-91cfb
FIREBASE_STORAGE_BUCKET=reviewhub-91cfb.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=713435343120
FIREBASE_APP_ID=1:713435343120:web:054ce9a892746b748cdd95
FIREBASE_MEASUREMENT_ID=G-PGYF9P58JX
```

These are also available in `app.json` under `extra.firebase` for use with `expo-constants`.

---

## 🔒 Security Reminders

1. ✅ **Never commit sensitive files** (already in `.gitignore`):
   - `.env`
   - `google-services.json`
   - `GoogleService-Info.plist`

2. ⚠️ **Update Firestore rules before production** - Current rules expire March 18, 2026

3. 🔐 **Don't share API keys publicly** - While Firebase API keys are not secret, they should still be protected

4. 🛡️ **Enable App Check** (recommended for production):
   ```bash
   # Install App Check
   npm install firebase/app-check

   # Configure in firebaseConfig.ts
   import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
   initializeAppCheck(app, {
     provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
   });
   ```

---

## 🐛 Troubleshooting

### Issue: Firebase not connecting
**Solution**: Check that all environment variables are loaded:
```typescript
import Constants from 'expo-constants';
console.log(Constants.expoConfig?.extra?.firebase);
```

### Issue: Firestore offline persistence not working
**Solution**: Ensure you're using `initializeFirestore` with `persistentLocalCache` (already configured in `firebaseConfig.ts`)

### Issue: Authentication not persisting
**Solution**: The Firebase Web SDK automatically handles auth persistence with AsyncStorage

### Issue: Storage upload failing
**Solution**: Check that:
1. User is authenticated
2. Storage rules allow the operation
3. File size is within limits

---

## 📚 Useful Commands

```bash
# Start development server
npx expo start

# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios

# Deploy Firebase rules
firebase deploy --only firestore:rules,storage:rules

# Deploy Firebase indexes
firebase deploy --only firestore:indexes

# View Firebase logs
firebase functions:log

# Test Firebase rules locally
firebase emulators:start
```

---

## 📖 Documentation Links

- [Firebase Console](https://console.firebase.google.com/project/reviewhub-91cfb)
- [Firebase Web SDK Docs](https://firebase.google.com/docs/web/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Cloud Storage Documentation](https://firebase.google.com/docs/storage)
- [Security Rules Reference](https://firebase.google.com/docs/rules)
- [Expo + Firebase Guide](https://docs.expo.dev/guides/using-firebase/)

---

## ✅ Configuration Checklist

- [x] Firebase project created
- [x] Firebase CLI authenticated
- [x] iOS, Android, and Web apps registered
- [x] Firestore enabled with offline persistence
- [x] Authentication enabled (Email/Password, Google)
- [x] Cloud Storage enabled
- [x] Security rules created
- [x] Environment variables configured
- [x] Firebase SDK initialized in code
- [ ] **TODO**: Update Firestore rules for production
- [ ] **TODO**: Deploy security rules
- [ ] **TODO**: Test authentication flow
- [ ] **TODO**: Test Firestore operations
- [ ] **TODO**: Test Storage operations

---

## 🎉 You're All Set!

Your Firebase backend is fully configured and ready for development. Follow the next steps above to deploy security rules and start building your app!

For questions or issues, refer to the [Firebase Documentation](https://firebase.google.com/docs) or the ReviewHub project's [CLAUDE.md](./CLAUDE.md) for architecture guidelines.
