/**
 * Fix duplicate subcategories in Firestore.
 *
 * Each category has two sets of subcategories with different IDs but the same
 * name (e.g. "medical_hospital" + "hospital" both named "Hospital").
 * This script deduplicates by normalised name, keeping the SHORTER / canonical
 * id (the one WITHOUT a category prefix) which matches the bundled data.
 *
 * Run with:  node scripts/fix-duplicate-subcategories.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

/**
 * Among entries with the same normalised name, pick the "best" one to keep.
 * Preference order:
 *  1. ID that does NOT start with "<categoryId>_"  (canonical / bundled id)
 *  2. Shortest id
 *  3. First seen
 */
function pickBest(entries, categoryId) {
  const withoutPrefix = entries.filter((e) => !e.id.startsWith(categoryId + '_'));
  if (withoutPrefix.length > 0) {
    return withoutPrefix.reduce((a, b) => (a.id.length <= b.id.length ? a : b));
  }
  return entries.reduce((a, b) => (a.id.length <= b.id.length ? a : b));
}

async function fixDuplicates() {
  const snapshot = await db.collection('categories').get();
  if (snapshot.empty) { console.log('No categories found.'); return; }

  const batch = db.batch();
  let fixedCount = 0;

  for (const docSnap of snapshot.docs) {
    const categoryId = docSnap.id;
    const data = docSnap.data();
    const subs = data.subcategories ?? [];

    // Group by normalised name
    const byName = {};
    for (const s of subs) {
      const key = (s.name ?? '').toLowerCase().trim();
      if (!key) continue;
      if (!byName[key]) byName[key] = [];
      byName[key].push(s);
    }

    // Build deduplicated list: for each name-group keep the best entry
    const deduped = [];
    const kept = new Set();
    for (const s of subs) {
      const key = (s.name ?? '').toLowerCase().trim();
      if (!key || kept.has(key)) continue;
      kept.add(key);
      const group = byName[key];
      deduped.push(group.length === 1 ? group[0] : pickBest(group, categoryId));
    }

    if (deduped.length < subs.length) {
      const removed = subs.filter((s) => !deduped.includes(s)).map((s) => `"${s.id}" (${s.name})`);
      console.log(`[${categoryId}] ${subs.length} → ${deduped.length} subs  |  removed: ${removed.join(', ')}`);
      batch.update(docSnap.ref, { subcategories: deduped });
      fixedCount++;
    }
  }

  if (fixedCount === 0) {
    console.log('No duplicates found — nothing to fix.');
    return;
  }

  await batch.commit();
  console.log(`\nDone. Fixed ${fixedCount} categor${fixedCount === 1 ? 'y' : 'ies'}.`);
}

fixDuplicates().catch((err) => { console.error('Error:', err); process.exit(1); });
