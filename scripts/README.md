# Scripts

Utility scripts for ReviewHub development and maintenance.

---

## seedFirestore.js

Seeds the Firestore database with sample data for development and testing.

### Prerequisites

1. **Download Service Account Key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in the project root
   - **Important:** Add `serviceAccountKey.json` to `.gitignore` (already done)

2. **Install Firebase Admin SDK:**
   ```bash
   npm install -g firebase-admin
   # Or locally in the project
   npm install firebase-admin --save-dev
   ```

### Usage

**Seed with sample data:**
```bash
node scripts/seedFirestore.js
```

**What it does:**
- Clears existing data in profiles, posts, and user_settings collections
- Creates 3 sample user profiles
- Creates 2 sample posts
- Creates user settings for each profile

**Use cases:**
- Setting up a new development environment
- Testing the app with realistic data
- Resetting test data after experiments
- Demonstrating features to stakeholders

### Customization

Edit `seedFirestore.js` to:
- Add more sample users
- Change profile data
- Add sample conversations, reviews, etc.
- Skip clearing existing data (comment out `clearCollection` calls)

### Safety

**⚠️ Warning:** This script will **DELETE** existing data in the specified collections!

To keep existing data, comment out these lines:
```javascript
// await clearCollection('profiles');
// await clearCollection('posts');
// await clearCollection('user_settings');
```

---

## Future Scripts

### testFirestoreRules.js (Coming Soon)
Test Firestore security rules locally before deployment.

### migrateData.js (Coming Soon)
Migrate data structure when schema changes.

### exportData.js (Coming Soon)
Export Firestore data to JSON for backups.

### generateMockData.js (Coming Soon)
Generate large amounts of mock data for performance testing.

---

## Best Practices

1. **Never commit service account keys** to version control
2. **Use emulators** for local testing (no real data affected)
3. **Backup data** before running destructive scripts
4. **Test scripts** on a development Firebase project first
5. **Document changes** when modifying scripts

---

## Troubleshooting

### Error: "Service account key not found"
**Solution:** Download key from Firebase Console and save as `serviceAccountKey.json`

### Error: "Permission denied"
**Solution:** Ensure service account has Firestore Admin permissions

### Error: "Cannot find module 'firebase-admin'"
**Solution:** Run `npm install firebase-admin --save-dev`
