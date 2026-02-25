# Firestore Database Structure

This document defines the complete Firestore database structure for ReviewHub.

---

## Collections Overview

```
firestore/
├── profiles/              # User profile documents
├── posts/                 # Feed posts (future)
├── conversations/         # Chat conversations (future)
│   └── messages/          # Subcollection: messages
├── reviews/               # Product/service reviews (future)
└── user_settings/         # Private user settings
```

---

## 1. Profiles Collection

**Collection Path**: `/profiles/{userId}`

**Document ID**: Same as Firebase Auth UID

### Schema

```typescript
{
  id: string;                    // Same as document ID
  user_id: string;               // Firebase Auth UID
  display_name: string;          // User's full name (1-100 chars)
  email: string;                 // User's email
  phone_number: string | null;   // Optional phone number (8-20 chars)
  bio: string;                   // User bio/description
  avatar_url: string | null;     // Firebase Storage URL to avatar image
  followers_count: number;       // Count of followers
  following_count: number;       // Count of following
  updated_at: Timestamp;         // Last update timestamp
  created_at: Timestamp;         // Profile creation timestamp
}
```

### Example Document

```json
{
  "id": "abc123xyz",
  "user_id": "abc123xyz",
  "display_name": "Chaima Ben Farhat",
  "email": "chaima.bf@business.tn",
  "phone_number": "+216 27277796",
  "bio": "Software engineer passionate about mobile development",
  "avatar_url": "https://firebasestorage.googleapis.com/...",
  "followers_count": 150,
  "following_count": 200,
  "updated_at": "2026-02-16T10:30:00Z",
  "created_at": "2025-12-01T08:00:00Z"
}
```

### Indexes Required

```javascript
// Composite index for search/discovery (future)
profiles:
  - display_name (ASC), created_at (DESC)
```

### Security Rules

- ✅ Users can read their own profile
- ✅ Users can create their own profile
- ✅ Users can update their own profile
- ✅ Users can delete their own profile
- ❌ Users cannot read other users' profiles (can be relaxed for public profiles later)

---

## 2. Posts Collection (Future)

**Collection Path**: `/posts/{postId}`

### Schema

```typescript
{
  id: string;
  user_id: string;               // Author's UID
  author_name: string;           // Denormalized for performance
  author_avatar: string | null;
  content: string;               // Post text content
  images: string[];              // Array of Storage URLs
  likes_count: number;
  comments_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## 3. Conversations Collection (Future)

**Collection Path**: `/conversations/{conversationId}`

### Schema

```typescript
{
  id: string;
  participant_ids: string[];     // Array of user UIDs (max 2 for DM)
  participant_names: string[];   // Denormalized names
  participant_avatars: (string | null)[];
  last_message: string;          // Preview text
  last_message_at: Timestamp;
  unread_count: {                // Map of userId -> count
    [userId: string]: number;
  };
  created_at: Timestamp;
}
```

### Subcollection: Messages

**Collection Path**: `/conversations/{conversationId}/messages/{messageId}`

```typescript
{
  id: string;
  sender_id: string;
  sender_name: string;           // Denormalized
  text: string;
  image_url: string | null;
  sent_at: Timestamp;
  read_by: string[];             // Array of user UIDs who read the message
}
```

---

## 4. Reviews Collection (Future)

**Collection Path**: `/reviews/{reviewId}`

### Schema

```typescript
{
  id: string;
  user_id: string;
  user_name: string;             // Denormalized
  user_avatar: string | null;
  item_id: string;               // ID of reviewed item/service
  item_name: string;
  rating: number;                // 1-5 stars
  title: string;
  content: string;
  images: string[];
  helpful_count: number;         // Upvotes
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## 5. User Settings Collection

**Collection Path**: `/user_settings/{userId}`

### Schema

```typescript
{
  user_id: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'ar';
  privacy: {
    profile_visibility: 'public' | 'private';
    show_email: boolean;
    show_phone: boolean;
  };
  updated_at: Timestamp;
}
```

---

## Profile Creation Flow

### On User Sign Up (Cloud Function)

When a new user signs up via Firebase Auth, a Cloud Function automatically creates their profile document:

```javascript
// functions/src/onCreate.ts
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  const profileRef = admin.firestore().collection('profiles').doc(user.uid);

  await profileRef.set({
    id: user.uid,
    user_id: user.uid,
    display_name: user.displayName || 'Anonymous User',
    email: user.email,
    phone_number: user.phoneNumber || null,
    bio: '',
    avatar_url: user.photoURL || null,
    followers_count: 0,
    following_count: 0,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });
});
```

---

## Migration & Seeding

### Initial Profile Setup (Manual)

For existing users without profiles, run this script:

```bash
# Deploy the Cloud Function
firebase deploy --only functions:createUserProfile

# Or manually create profiles via Firebase Console
```

---

## Best Practices

### 1. Denormalization
- Store frequently accessed user data (name, avatar) in posts/messages
- Trade storage for read performance
- Update denormalized data when source changes

### 2. Offline Support
- All reads automatically use Firestore cache
- Writes queue when offline and sync when online
- Use `onSnapshot()` with `metadata.fromCache` to indicate offline data

### 3. Security
- Never trust client-side data
- Always validate in security rules
- Use server timestamps (`serverTimestamp()`)
- Limit document size (max 1MB per document)

### 4. Indexing
- Create composite indexes for complex queries
- Monitor index usage in Firebase Console
- Delete unused indexes

---

## Deployment

Deploy security rules:

```bash
firebase deploy --only firestore:rules
```

Deploy indexes:

```bash
firebase deploy --only firestore:indexes
```

Deploy Cloud Functions:

```bash
firebase deploy --only functions
```

---

## Testing

Test security rules locally:

```bash
firebase emulators:start --only firestore
```

Use the Firestore Emulator UI at: `http://localhost:4000`
