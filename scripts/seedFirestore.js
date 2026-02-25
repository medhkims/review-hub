/**
 * Firestore Seeding Script
 *
 * Creates sample data in Firestore for development and testing.
 * Run with: node scripts/seedFirestore.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // You'll need to download this from Firebase Console

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'reviewhub-91cfb.appspot.com'
});

const db = admin.firestore();

// Sample user profiles
const sampleProfiles = [
  {
    id: 'user1',
    user_id: 'user1',
    display_name: 'Chaima Ben Farhat',
    email: 'chaima.bf@business.tn',
    phone_number: '+216 27277796',
    bio: 'Software engineer passionate about mobile development',
    avatar_url: null,
    followers_count: 150,
    following_count: 200,
  },
  {
    id: 'user2',
    user_id: 'user2',
    display_name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    phone_number: '+216 98765432',
    bio: 'UI/UX Designer | Product enthusiast',
    avatar_url: null,
    followers_count: 89,
    following_count: 120,
  },
  {
    id: 'user3',
    user_id: 'user3',
    display_name: 'Sara Mohamed',
    email: 'sara.m@example.com',
    phone_number: null,
    bio: 'Foodie & Travel Blogger 🌍✈️',
    avatar_url: null,
    followers_count: 1250,
    following_count: 350,
  },
];

// Sample posts (for future)
const samplePosts = [
  {
    id: 'post1',
    user_id: 'user1',
    author_name: 'Chaima Ben Farhat',
    author_avatar: null,
    content: 'Just finished building an amazing React Native app! 🚀',
    images: [],
    likes_count: 42,
    comments_count: 8,
  },
  {
    id: 'post2',
    user_id: 'user2',
    author_name: 'Ahmed Hassan',
    author_avatar: null,
    content: 'Check out this new UI design I created. What do you think?',
    images: [],
    likes_count: 156,
    comments_count: 23,
  },
];

async function seedProfiles() {
  console.log('🌱 Seeding profiles...');

  const batch = db.batch();

  for (const profile of sampleProfiles) {
    const profileRef = db.collection('profiles').doc(profile.user_id);
    batch.set(profileRef, {
      ...profile,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✅ Created ${sampleProfiles.length} profiles`);
}

async function seedPosts() {
  console.log('🌱 Seeding posts...');

  const batch = db.batch();

  for (const post of samplePosts) {
    const postRef = db.collection('posts').doc(post.id);
    batch.set(postRef, {
      ...post,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✅ Created ${samplePosts.length} posts`);
}

async function seedUserSettings() {
  console.log('🌱 Seeding user settings...');

  const batch = db.batch();

  for (const profile of sampleProfiles) {
    const settingsRef = db.collection('user_settings').doc(profile.user_id);
    batch.set(settingsRef, {
      user_id: profile.user_id,
      notifications_enabled: true,
      email_notifications: true,
      push_notifications: true,
      theme: 'dark',
      language: 'en',
      privacy: {
        profile_visibility: 'public',
        show_email: false,
        show_phone: false,
      },
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✅ Created ${sampleProfiles.length} user settings`);
}

async function clearCollection(collectionName) {
  console.log(`🧹 Clearing ${collectionName} collection...`);

  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(`✅ ${collectionName} collection is already empty`);
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`✅ Cleared ${snapshot.size} documents from ${collectionName}`);
}

async function main() {
  try {
    console.log('🚀 Starting Firestore seeding...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    await clearCollection('profiles');
    await clearCollection('posts');
    await clearCollection('user_settings');

    console.log('');

    // Seed new data
    await seedProfiles();
    await seedPosts();
    await seedUserSettings();

    console.log('\n✨ Seeding complete! Your Firestore database is ready for testing.');
    console.log('\n📊 Summary:');
    console.log(`   - ${sampleProfiles.length} profiles created`);
    console.log(`   - ${samplePosts.length} posts created`);
    console.log(`   - ${sampleProfiles.length} user settings created`);
    console.log('\n🔗 View data: https://console.firebase.google.com/project/reviewhub-91cfb/firestore');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
