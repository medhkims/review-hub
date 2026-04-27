/**
 * Remove influencer documents that have NO social media links at all.
 * Keeps any influencer that has at least one of:
 *   contact.instagram_handle, contact.facebook_name, contact.tiktok_handle, contact.website
 */
const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function run() {
  console.log('=== Removing influencers with NO social media links ===\n');

  const snap = await db.collection('businesses').where('category_id', '==', 'influencer').get();
  console.log(`Total influencer docs fetched: ${snap.size}`);

  const toDelete = [];
  const toKeep = [];

  snap.forEach(doc => {
    const d = doc.data();
    const c = d.contact || {};
    const hasSocial =
      (c.instagram_handle && c.instagram_handle !== null) ||
      (c.facebook_name   && c.facebook_name   !== null) ||
      (c.tiktok_handle   && c.tiktok_handle   !== null) ||
      (c.website         && c.website         !== null);

    if (hasSocial) {
      toKeep.push(d.name || doc.id);
    } else {
      toDelete.push({ id: doc.id, name: d.name || doc.id });
    }
  });

  console.log(`\nWith social links (KEEP): ${toKeep.length}`);
  console.log(`Without any social link (DELETE): ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log('\nNothing to delete.');
    return;
  }

  // Batch delete (Firestore limit: 500 per batch)
  console.log('\nDeleting...');
  const BATCH_SIZE = 400;
  let deleted = 0;

  for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
    const chunk = toDelete.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    chunk.forEach(item => {
      batch.delete(db.collection('businesses').doc(item.id));
    });
    await batch.commit();
    deleted += chunk.length;
    console.log(`  Deleted ${deleted}/${toDelete.length}...`);
  }

  console.log(`\nDone! Deleted: ${toDelete.length}, Remaining: ${toKeep.length}`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
