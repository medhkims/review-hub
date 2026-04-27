/**
 * Patch existing influencer docs to add missing contact fields:
 * youtube_channel, kick_handle, twitch_handle (set to null if not present)
 */
const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function run() {
  console.log('=== Patching influencer contact schema ===\n');

  const snap = await db.collection('businesses').where('category_id', '==', 'influencer').get();
  console.log(`Total influencer docs: ${snap.size}`);

  let patched = 0, already = 0;
  const BATCH_SIZE = 400;
  const updates = [];

  snap.forEach(doc => {
    const c = doc.data().contact || {};
    const needsPatch =
      !('youtube_channel' in c) ||
      !('kick_handle'     in c) ||
      !('twitch_handle'   in c);

    if (needsPatch) {
      updates.push({ ref: doc.ref, contact: {
        ...c,
        youtube_channel: c.youtube_channel ?? null,
        kick_handle:     c.kick_handle     ?? null,
        twitch_handle:   c.twitch_handle   ?? null,
      }});
    } else {
      already++;
    }
  });

  console.log(`Needs patch: ${updates.length}, Already up-to-date: ${already}`);

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const chunk = updates.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    chunk.forEach(({ ref, contact }) => batch.update(ref, { contact }));
    await batch.commit();
    patched += chunk.length;
    console.log(`  Patched ${patched}/${updates.length}...`);
  }

  console.log(`\nDone! Patched: ${patched}`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
