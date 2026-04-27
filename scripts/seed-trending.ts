/**
 * One-off script: pick 8 random businesses and set weekly_review_count = 1
 * so they appear in the Trending Now section.
 *
 * Usage:
 *   npx ts-node scripts/seed-trending.ts
 *
 * Requires: firebase-admin (uses Application Default Credentials via gcloud)
 */

import * as admin from 'firebase-admin';

admin.initializeApp({ projectId: 'reviewhub-91cfb' });
const db = admin.firestore();

async function seedTrending() {
  console.log('Fetching all businesses...');
  const snapshot = await db.collection('businesses').get();
  const allIds = snapshot.docs.map((d) => d.id);
  console.log(`Found ${allIds.length} businesses.`);

  if (allIds.length === 0) {
    console.log('No businesses found. Nothing to do.');
    return;
  }

  // Shuffle and pick up to 8
  const shuffled = allIds.sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, Math.min(8, allIds.length));

  console.log(`Setting weekly_review_count = 1 for ${picked.length} businesses...`);

  const batch = db.batch();
  for (const id of picked) {
    batch.update(db.collection('businesses').doc(id), { weekly_review_count: 1 });
  }
  await batch.commit();

  console.log('Done! Trending businesses:');
  for (let i = 0; i < picked.length; i++) {
    const name = snapshot.docs.find((d) => d.id === picked[i])?.data()?.name ?? picked[i];
    console.log(`  ${i + 1}. ${name}`);
  }
}

seedTrending().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
