# ReviewHub - Quick Reference

Essential commands and information for ReviewHub development.

---

## 🚀 Quick Setup

```bash
# Deploy Firebase (one command)
bash scripts/setup-firebase.sh              # macOS/Linux
scripts\setup-firebase.bat                  # Windows

# Seed test data
node scripts/seedFirestore.js
```

---

## 📱 Development

```bash
# Start Expo dev server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web

# Type checking
npx tsc --noEmit

# Linting
npx eslint . --ext .ts,.tsx

# Tests
npx jest --passWithNoTests
```

---

## 🔥 Firebase Commands

### Deploy Services

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:createUserProfile
```

### Emulators

```bash
# Start all emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only firestore,auth

# Access Emulator UI
http://localhost:4000
```

### Logs & Monitoring

```bash
# View all function logs
firebase functions:log

# View specific function logs
firebase functions:log --only createUserProfile

# Follow logs in real-time
firebase functions:log --follow

# Last 100 logs
firebase functions:log --limit 100
```

---

## 🗂️ Project Structure

```
src/
├── domain/         # Pure business logic (no external deps)
├── data/           # Firebase integration (models, repos)
├── presentation/   # UI components, screens, hooks
└── core/           # DI, i18n, theme, utils

app/                # Expo Router (file-based routing)
functions/          # Cloud Functions (TypeScript)
scripts/            # Utility scripts
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Architecture rules (READ THIS FIRST) |
| `FIRESTORE_STRUCTURE.md` | Database schema |
| `DEPLOYMENT_GUIDE.md` | Deploy instructions |
| `firebase.json` | Firebase configuration |
| `firestore.rules` | Security rules |
| `src/core/di/container.ts` | Dependency injection |
| `.env` | Environment variables (gitignored) |

---

## 🔒 Security Rules Testing

```bash
# Validate rules syntax
firebase deploy --only firestore:rules --dry-run

# Test rules locally
firebase emulators:start --only firestore
# Then test in Emulator UI at http://localhost:4000
```

---

## 📊 Firebase Console URLs

- **Project**: https://console.firebase.google.com/project/reviewhub-91cfb
- **Firestore**: https://console.firebase.google.com/project/reviewhub-91cfb/firestore
- **Functions**: https://console.firebase.google.com/project/reviewhub-91cfb/functions
- **Auth**: https://console.firebase.google.com/project/reviewhub-91cfb/authentication
- **Storage**: https://console.firebase.google.com/project/reviewhub-91cfb/storage

---

## 🐛 Debugging

### Common Issues

**"Permission denied" in Firestore**
```bash
firebase deploy --only firestore:rules
```

**Function not triggering**
```bash
firebase functions:log --only createUserProfile
# Check function logs for errors
```

**Index not found**
```bash
firebase deploy --only firestore:indexes
# Wait 5-10 minutes for indexes to build
```

**Profile not created on sign up**
```bash
# Check function logs
firebase functions:log --only createUserProfile

# Verify function deployed
firebase functions:list
```

---

## 📦 Key Dependencies

```json
{
  "expo": "~52.x.x",
  "react-native": "0.76.x",
  "firebase": "^11.0.0",
  "zustand": "^5.0.0",
  "react-i18next": "^15.0.0",
  "nativewind": "^4.0.0"
}
```

---

## 🏗️ Clean Architecture Layers

### Domain Layer (Pure)
- **Entities**: Core data structures
- **Use Cases**: Business logic
- **Repositories**: Interfaces (contracts)

### Data Layer (Firebase)
- **Models**: Firestore document shapes
- **Mappers**: Model ↔ Entity conversion
- **Data Sources**: Remote (Firestore) + Local (Cache)
- **Repository Impls**: Implements domain interfaces

### Presentation Layer (UI)
- **Screens**: React Native components
- **Hooks**: ViewModel pattern
- **Stores**: Zustand state management
- **Components**: Reusable UI elements

---

## 🎨 Styling

### NativeWind Classes

```tsx
// Custom colors (in tailwind.config.js)
className="bg-neon-purple"       // #A855F7
className="bg-midnight"          // #0F172A
className="bg-card-dark"         // #1E293B
className="border-border-dark"   // #334155

// Custom shadows
className="shadow-neon-glow"     // Purple glow effect

// Custom animations
className="animate-pulse-purple" // Pulsing purple glow
```

---

## 🌐 i18n

```typescript
// In components
const { t } = useTranslation();

// Usage
<AppText>{t('personalInfo.title')}</AppText>

// Change language
i18n.changeLanguage('ar');  // Arabic
i18n.changeLanguage('en');  // English
```

**Translation files:**
- `src/core/i18n/locales/en.json`
- `src/core/i18n/locales/ar.json`

---

## 🧪 Testing

```bash
# Unit tests
npx jest

# Watch mode
npx jest --watch

# Coverage
npx jest --coverage

# E2E tests (Maestro)
maestro test e2e/
```

---

## 🔄 Git Workflow

```bash
# Check status
git status

# Stage changes
git add <file>

# Commit (conventional commits)
git commit -m "feat: add personal info screen"
git commit -m "fix: resolve profile update bug"
git commit -m "refactor: improve mapper logic"

# Push
git push origin main
```

---

## 💡 Useful Commands

```bash
# Clear Metro bundler cache
npm start -- --clear

# Clear all caches
rm -rf node_modules
rm -rf .expo
npm install

# Check TypeScript
npx tsc --noEmit

# Format code (if using Prettier)
npx prettier --write .

# Generate component
# (manually create following CLAUDE.md conventions)
```

---

## 📞 Support

- **Firebase Docs**: https://firebase.google.com/docs
- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev/docs
- **NativeWind Docs**: https://www.nativewind.dev

---

## ⚡ Pro Tips

1. **Always** read `CLAUDE.md` before writing code
2. **Never** import Firebase SDK in Domain layer
3. **Always** map models to entities at repository boundary
4. **Use** Either type for error handling (no thrown exceptions in use cases)
5. **Cache** aggressively for offline-first experience
6. **Test** security rules before deploying
7. **Monitor** function logs after deployment
8. **Keep** layer separation strict

---

**Last Updated**: 2026-02-16
**Version**: 1.0.0
