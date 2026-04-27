/**
 * Delete All Imported Businesses & Reviews
 *
 * Removes all businesses and reviews that were imported (from OSM or Outscraper).
 * Use --all to delete ALL businesses and reviews (including user-created ones).
 *
 * Usage:
 *   npx ts-node scripts/delete-imported.ts --all                  # Delete EVERYTHING
 *   npx ts-node scripts/delete-imported.ts --source osm           # Only delete OSM imports
 *   npx ts-node scripts/delete-imported.ts --source outscraper    # Only delete Outscraper imports
 *   npx ts-node scripts/delete-imported.ts --dry-run              # Preview without deleting
 */

import adminPkg from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'serviceAccountKey.json'), 'utf-8'));

adminPkg.initializeApp({
  credential: adminPkg.credential.cert(serviceAccount),
});

const db = adminPkg.firestore();

function parseArgs(): { source?: string; dryRun: boolean; all: boolean } {
  const args = process.argv.slice(2);
  let source: string | undefined;
  let dryRun = false;
  let all = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--source':
        source = args[++i];
        break;
      case '--dry-run':
        dryRun = true;
        break;
      case '--all':
        all = true;
        break;
    }
  }

  return { source, dryRun, all };
}

async function deleteCollection(collectionName: string, filterFn?: (doc: adminPkg.firestore.QueryDocumentSnapshot) => boolean, dryRun: boolean = false): Promise<number> {
  const snap = await db.collection(collectionName).get();
  const docsToDelete = filterFn ? snap.docs.filter(filterFn) : snap.docs;

  if (dryRun) return docsToDelete.length;

  // Delete in batches of 400
  let deleted = 0;
  for (let i = 0; i < docsToDelete.length; i += 400) {
    const batch = db.batch();
    const chunk = docsToDelete.slice(i, i + 400);
    for (const d of chunk) {
      batch.delete(d.ref);
    }
    await batch.commit();
    deleted += chunk.length;
    process.stdout.write(`\r  Deleted ${deleted}/${docsToDelete.length} from ${collectionName}`);
  }
  if (docsToDelete.length > 0) console.log('');
  return docsToDelete.length;
}

async function main() {
  const opts = parseArgs();

  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Delete Businesses & Reviews            ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  Mode:    ${opts.all ? 'DELETE ALL' : opts.source ? `source=${opts.source}` : 'ALL imported'}`);
  console.log(`  Dry run: ${opts.dryRun}`);
  console.log('');

  let filterBusiness: ((doc: adminPkg.firestore.QueryDocumentSnapshot) => boolean) | undefined;
  let filterReview: ((doc: adminPkg.firestore.QueryDocumentSnapshot) => boolean) | undefined;

  if (!opts.all) {
    if (opts.source) {
      filterBusiness = (d) => d.data().source === opts.source;
      filterReview = (d) => {
        const src = d.data().source;
        return opts.source === 'outscraper' ? src === 'google_import' : src === opts.source;
      };
    } else {
      filterBusiness = (d) => d.data().is_imported === true;
      filterReview = (d) => ['google_import', 'osm'].includes(d.data().source);
    }
  }

  console.log('1. Deleting businesses...');
  const bizCount = await deleteCollection('businesses', filterBusiness, opts.dryRun);

  console.log('2. Deleting reviews...');
  const revCount = await deleteCollection('reviews', filterReview, opts.dryRun);

  console.log('3. Deleting business claims...');
  const claimCount = await deleteCollection('business_claims', undefined, opts.dryRun);

  console.log('');
  if (opts.dryRun) {
    console.log('DRY RUN — would delete:');
  } else {
    console.log('Deleted:');
  }
  console.log(`  ${bizCount} businesses`);
  console.log(`  ${revCount} reviews`);
  console.log(`  ${claimCount} claims`);
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
