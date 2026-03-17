/**
 * One-time migration: normalize restaurant/food category names to "Restaurant"
 *
 * Setup:
 *   1. Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Save the downloaded file as:  scripts/serviceAccountKey.json
 *   3. Run:  node scripts/fix-categories.mjs
 */
import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

const NORMALIZE_TO = 'Restaurant';
const VARIANTS = new Set(['restaurant', 'food', 'Food']);  // exclude NORMALIZE_TO itself

const snap = await db.collection('businesses').get();

const batch = db.batch();
let count = 0;

for (const d of snap.docs) {
  const catName = d.data().category_name;
  if (VARIANTS.has(catName)) {
    batch.update(d.ref, { category_name: NORMALIZE_TO });
    console.log(`  → "${d.data().name}" : "${catName}" → "${NORMALIZE_TO}"`);
    count++;
  }
}

if (count === 0) {
  console.log('Nothing to update — all categories already normalized.');
} else {
  await batch.commit();
  console.log(`\nDone. Updated ${count} document(s).`);
}

process.exit(0);
