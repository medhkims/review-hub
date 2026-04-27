/**
 * Firestore Migration Script
 *
 * Uses Firebase Admin SDK with a service account key.
 *
 * Setup:
 *   1. Go to Firebase Console > Project Settings > Service Accounts
 *   2. Click "Generate new private key"
 *   3. Save the file as: scripts/serviceAccountKey.json
 *
 * Usage:
 *   Step 1: Export data from current database
 *     node scripts/migrate-firestore.js export
 *
 *   Step 2: Go to Firebase Console, delete old database, create new one in europe-west1
 *
 *   Step 3: Import data into new database
 *     node scripts/migrate-firestore.js import
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const EXPORT_FILE = path.join(__dirname, 'firestore-backup.json');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');

// Check for service account key
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('ERROR: Service account key not found!');
  console.error(`Expected at: ${SERVICE_ACCOUNT_PATH}`);
  console.error('');
  console.error('To get a service account key:');
  console.error('  1. Go to https://console.firebase.google.com/project/reviewhub-91cfb/settings/serviceaccounts/adminsdk');
  console.error('  2. Click "Generate new private key"');
  console.error('  3. Save the downloaded file as: scripts/serviceAccountKey.json');
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ---- EXPORT ----
async function exportData() {
  console.log('Starting Firestore export...');
  console.log(`Project: ${serviceAccount.project_id}\n`);

  const backup = {};
  let totalDocs = 0;

  // Admin SDK can list all collections dynamically
  const collections = await db.listCollections();
  console.log(`Found ${collections.length} top-level collections:\n`);

  for (const col of collections) {
    const colName = col.id;
    console.log(`  Exporting: ${colName}`);

    const snapshot = await col.get();
    if (snapshot.empty) {
      console.log(`    (empty)\n`);
      continue;
    }

    backup[colName] = {};
    let docCount = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      backup[colName][docSnap.id] = serializeDoc(data);
      docCount++;

      // Check for subcollections
      const subCollections = await docSnap.ref.listCollections();
      if (subCollections.length > 0) {
        backup[colName][docSnap.id].__subcollections = {};
        for (const subCol of subCollections) {
          const subSnapshot = await subCol.get();
          if (!subSnapshot.empty) {
            backup[colName][docSnap.id].__subcollections[subCol.id] = {};
            for (const subDoc of subSnapshot.docs) {
              backup[colName][docSnap.id].__subcollections[subCol.id][subDoc.id] =
                serializeDoc(subDoc.data());
            }
            console.log(`    - ${subCol.id}: ${subSnapshot.size} docs`);
          }
        }
        // Clean up if no subcollections had data
        if (Object.keys(backup[colName][docSnap.id].__subcollections).length === 0) {
          delete backup[colName][docSnap.id].__subcollections;
        }
      }
    }

    totalDocs += docCount;
    console.log(`    ${docCount} documents\n`);
  }

  if (totalDocs === 0) {
    console.log('No data found in Firestore!');
    process.exit(1);
  }

  fs.writeFileSync(EXPORT_FILE, JSON.stringify(backup, null, 2), 'utf-8');
  const sizeMB = (fs.statSync(EXPORT_FILE).size / (1024 * 1024)).toFixed(2);
  console.log('=== Export complete! ===');
  console.log(`Total: ${totalDocs} documents`);
  console.log(`Saved to: ${EXPORT_FILE} (${sizeMB} MB)`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Go to Firebase Console > Firestore');
  console.log('  2. Delete the current (default) database');
  console.log('  3. Create a new database with location: europe-west1 (Belgium)');
  console.log('  4. Run: node scripts/migrate-firestore.js import');
  process.exit(0);
}

// ---- IMPORT ----
async function importData() {
  if (!fs.existsSync(EXPORT_FILE)) {
    console.error(`Error: Backup file not found at ${EXPORT_FILE}`);
    console.error('Run "node scripts/migrate-firestore.js export" first.');
    process.exit(1);
  }

  console.log('Starting Firestore import...\n');
  const backup = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf-8'));

  const collectionNames = Object.keys(backup);
  console.log(`Found ${collectionNames.length} collections to import:\n`);

  let totalDocs = 0;
  const BATCH_SIZE = 450; // Firestore limit is 500

  for (const colName of collectionNames) {
    const docs = backup[colName];
    const docIds = Object.keys(docs);
    console.log(`  Importing: ${colName} (${docIds.length} docs)`);

    // Batch write documents
    for (let i = 0; i < docIds.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = docIds.slice(i, i + BATCH_SIZE);

      for (const docId of chunk) {
        const docData = { ...docs[docId] };
        delete docData.__subcollections;

        const deserializedData = deserializeDoc(docData);
        batch.set(db.collection(colName).doc(docId), deserializedData);
      }

      await batch.commit();
      totalDocs += chunk.length;
      console.log(`    Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} docs`);
    }

    // Handle subcollections
    for (const docId of docIds) {
      const subcollections = docs[docId].__subcollections;
      if (!subcollections) continue;

      for (const subColName of Object.keys(subcollections)) {
        const subDocs = subcollections[subColName];
        const subDocIds = Object.keys(subDocs);

        if (subDocIds.length === 0) continue;
        console.log(`    - ${colName}/${docId}/${subColName}: ${subDocIds.length} docs`);

        for (let i = 0; i < subDocIds.length; i += BATCH_SIZE) {
          const batch = db.batch();
          const chunk = subDocIds.slice(i, i + BATCH_SIZE);

          for (const subDocId of chunk) {
            const deserializedData = deserializeDoc(subDocs[subDocId]);
            batch.set(
              db.collection(colName).doc(docId).collection(subColName).doc(subDocId),
              deserializedData,
            );
          }
          await batch.commit();
          totalDocs += chunk.length;
        }
      }
    }
  }

  console.log(`\n=== Import complete! ===`);
  console.log(`Total: ${totalDocs} documents written`);
  console.log('');
  console.log('You can now delete the backup file:');
  console.log(`  del "${EXPORT_FILE}"`);
  process.exit(0);
}

// ---- Serialization helpers ----
function serializeDoc(data) {
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = serializeValue(value);
  }
  return result;
}

function serializeValue(value) {
  if (value === null || value === undefined) return value;

  // Firestore Timestamp
  if (value && typeof value === 'object' && typeof value.toDate === 'function') {
    return { __type: 'Timestamp', __value: value.toDate().toISOString() };
  }

  // GeoPoint
  if (value && typeof value === 'object' && typeof value.latitude === 'number' && typeof value.longitude === 'number' && value.constructor?.name === 'GeoPoint') {
    return { __type: 'GeoPoint', __latitude: value.latitude, __longitude: value.longitude };
  }

  // DocumentReference
  if (value && typeof value === 'object' && value.path && value.firestore) {
    return { __type: 'Reference', __path: value.path };
  }

  // Array
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  // Nested object
  if (typeof value === 'object') {
    return serializeDoc(value);
  }

  return value;
}

function deserializeDoc(data) {
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = deserializeValue(value);
  }
  return result;
}

function deserializeValue(value) {
  if (value === null || value === undefined) return value;

  if (value && typeof value === 'object' && value.__type) {
    const { Timestamp, GeoPoint } = require('firebase-admin/firestore');
    switch (value.__type) {
      case 'Timestamp':
        return Timestamp.fromDate(new Date(value.__value));
      case 'GeoPoint':
        return new GeoPoint(value.__latitude, value.__longitude);
      case 'Reference':
        return db.doc(value.__path);
      default:
        break;
    }
  }

  // Array
  if (Array.isArray(value)) {
    return value.map(deserializeValue);
  }

  // Nested object
  if (typeof value === 'object') {
    return deserializeDoc(value);
  }

  return value;
}

// ---- Main ----
const command = process.argv[2];

if (command === 'export') {
  exportData().catch((err) => {
    console.error('Export failed:', err.message);
    process.exit(1);
  });
} else if (command === 'import') {
  importData().catch((err) => {
    console.error('Import failed:', err.message);
    process.exit(1);
  });
} else {
  console.log('Firestore Migration Tool');
  console.log('========================');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/migrate-firestore.js export   - Export all data to JSON');
  console.log('  node scripts/migrate-firestore.js import   - Import data from JSON');
  console.log('');
  console.log('Steps to migrate to europe-west1:');
  console.log('  1. Download service account key (see setup instructions above)');
  console.log('  2. Run: node scripts/migrate-firestore.js export');
  console.log('  3. Go to Firebase Console > Firestore > Delete database');
  console.log('  4. Create new database with location: europe-west1');
  console.log('  5. Run: node scripts/migrate-firestore.js import');
}
