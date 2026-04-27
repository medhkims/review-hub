/**
 * Inspect subcategories stored in Firestore for each category.
 * Run with: node scripts/inspect-subcategories.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function inspect() {
  const snapshot = await db.collection('categories').get();
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const subs = data.subcategories ?? [];
    console.log(`\n=== ${docSnap.id} (${subs.length} subs) ===`);
    subs.forEach((s, i) => console.log(`  [${i}] id="${s.id}" name="${s.name}"`));
  }
}

inspect().catch((err) => { console.error(err); process.exit(1); });
