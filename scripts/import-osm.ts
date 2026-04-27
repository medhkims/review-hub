/**
 * OpenStreetMap → Firestore Import Script
 *
 * Downloads ALL businesses in Tunisia from OpenStreetMap (free, via Overpass API)
 * and imports them into Firestore using Firebase Admin SDK.
 *
 * Usage:
 *   npx ts-node scripts/import-osm.ts
 *
 * Options:
 *   --dry-run           Preview what would be imported without writing
 *   --batch-size <n>    Firestore batch size (default: 400, max 500)
 *   --resume            Skip businesses already in Firestore
 *   --city <name>       Only import a specific city (e.g. --city Tunis)
 */

import adminPkg from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'serviceAccountKey.json'), 'utf-8'));

adminPkg.initializeApp({
  credential: adminPkg.credential.cert(serviceAccount),
});

const db = adminPkg.firestore();

// ── Category Mapping ─────────────────────────────────────────────────────────

const OSM_CATEGORY_MAP: Record<string, { id: string; name: string }> = {
  // Restaurant
  restaurant: { id: 'restaurant', name: 'Restaurant' },
  fast_food: { id: 'restaurant', name: 'Restaurant' },
  food_court: { id: 'restaurant', name: 'Restaurant' },
  ice_cream: { id: 'restaurant', name: 'Restaurant' },
  bakery: { id: 'restaurant', name: 'Restaurant' },

  // Coffee Shop
  cafe: { id: 'coffee_shop', name: 'Coffee Shop' },

  // Gym
  gym: { id: 'gym', name: 'Gym' },
  fitness_centre: { id: 'gym', name: 'Gym' },
  sports_centre: { id: 'gym', name: 'Gym' },

  // Medical
  hospital: { id: 'medical', name: 'Medical' },
  clinic: { id: 'medical', name: 'Medical' },
  pharmacy: { id: 'medical', name: 'Medical' },
  doctors: { id: 'doctor', name: 'Doctor' },
  dentist: { id: 'doctor', name: 'Doctor' },

  // Hotel / Hebergement
  hotel: { id: 'hebergement', name: 'Hebergement' },
  hostel: { id: 'hebergement', name: 'Hebergement' },
  guest_house: { id: 'hebergement', name: 'Hebergement' },
  motel: { id: 'hebergement', name: 'Hebergement' },

  // Education
  school: { id: 'education', name: 'Education' },
  university: { id: 'education', name: 'Education' },
  kindergarten: { id: 'education', name: 'Education' },
  college: { id: 'education', name: 'Education' },
  training: { id: 'education', name: 'Education' },

  // Shopping
  supermarket: { id: 'shopping', name: 'Shopping' },
  mall: { id: 'shopping', name: 'Shopping' },
  clothes: { id: 'shopping', name: 'Shopping' },
  shoes: { id: 'shopping', name: 'Shopping' },
  electronics: { id: 'shopping', name: 'Shopping' },
  furniture: { id: 'shopping', name: 'Shopping' },
  jewelry: { id: 'shopping', name: 'Shopping' },
  convenience: { id: 'shopping', name: 'Shopping' },
  department_store: { id: 'shopping', name: 'Shopping' },
  hardware: { id: 'shopping', name: 'Shopping' },
  mobile_phone: { id: 'shopping', name: 'Shopping' },
  optician: { id: 'shopping', name: 'Shopping' },
  books: { id: 'shopping', name: 'Shopping' },
  gift: { id: 'shopping', name: 'Shopping' },
  variety_store: { id: 'shopping', name: 'Shopping' },

  // Car Rental
  car_rental: { id: 'car_services', name: 'Car Services' },

  // Bank
  bank: { id: 'bank', name: 'Bank' },
  atm: { id: 'bank', name: 'Bank' },

  // Beauty
  hairdresser: { id: 'beauty', name: 'Beauty' },
  beauty: { id: 'beauty', name: 'Beauty' },

  // Car services
  car_repair: { id: 'car_services', name: 'Car Services' },
  car_wash: { id: 'car_services', name: 'Car Services' },
  fuel: { id: 'car_services', name: 'Car Services' },
  car: { id: 'car_services', name: 'Car Services' },
};

// ── Overpass API ─────────────────────────────────────────────────────────────

function buildOverpassQuery(city?: string): string {
  const area = city
    ? `area["name"="${city}"]["admin_level"~"^[4-8]$"]->.searchArea;`
    : `area["ISO3166-1"="TN"]->.searchArea;`;

  return `
[out:json][timeout:300];
${area}
(
  node["amenity"~"restaurant|fast_food|cafe|bakery|ice_cream|food_court|bar|pub|pharmacy|hospital|clinic|doctors|dentist|bank|atm|school|university|kindergarten|college|fuel|car_wash|car_rental"](area.searchArea);
  node["shop"~"supermarket|mall|clothes|shoes|electronics|furniture|jewelry|convenience|department_store|hardware|mobile_phone|optician|hairdresser|beauty|books|gift|variety_store|car_repair|car"](area.searchArea);
  node["tourism"~"hotel|hostel|guest_house|motel"](area.searchArea);
  node["leisure"~"fitness_centre|sports_centre"](area.searchArea);
  way["amenity"~"restaurant|fast_food|cafe|bakery|ice_cream|food_court|bar|pub|pharmacy|hospital|clinic|doctors|dentist|bank|atm|school|university|kindergarten|college|fuel|car_wash|car_rental"](area.searchArea);
  way["shop"~"supermarket|mall|clothes|shoes|electronics|furniture|jewelry|convenience|department_store|hardware|mobile_phone|optician|hairdresser|beauty|books|gift|variety_store|car_repair|car"](area.searchArea);
  way["tourism"~"hotel|hostel|guest_house|motel"](area.searchArea);
  way["leisure"~"fitness_centre|sports_centre"](area.searchArea);
);
out center body;
`;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function queryOverpass(overpassQL: string): Promise<OverpassResponse> {
  return new Promise((resolve, reject) => {
    const postData = `data=${encodeURIComponent(overpassQL)}`;

    const options = {
      hostname: 'overpass-api.de',
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 600000,
    };

    console.log('  Sending request to Overpass API (this may take a few minutes)...');

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf-8');
          const json = JSON.parse(body) as OverpassResponse;
          resolve(json);
        } catch (err) {
          reject(new Error(`Failed to parse Overpass response: ${(err as Error).message}`));
        }
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Overpass API request timed out'));
    });
    req.write(postData);
    req.end();
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseArgs(): {
  dryRun: boolean;
  batchSize: number;
  resume: boolean;
  city?: string;
} {
  const args = process.argv.slice(2);
  let dryRun = false;
  let batchSize = 400;
  let resume = false;
  let city: string | undefined;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
        dryRun = true;
        break;
      case '--batch-size':
        batchSize = Math.min(500, parseInt(args[++i], 10) || 400);
        break;
      case '--resume':
        resume = true;
        break;
      case '--city':
        city = args[++i];
        break;
    }
  }

  return { dryRun, batchSize, resume, city };
}

function mapOsmCategory(tags: Record<string, string>): { id: string; name: string } {
  if (tags.amenity && OSM_CATEGORY_MAP[tags.amenity]) return OSM_CATEGORY_MAP[tags.amenity];
  if (tags.shop && OSM_CATEGORY_MAP[tags.shop]) return OSM_CATEGORY_MAP[tags.shop];
  if (tags.tourism && OSM_CATEGORY_MAP[tags.tourism]) return OSM_CATEGORY_MAP[tags.tourism];
  if (tags.leisure && OSM_CATEGORY_MAP[tags.leisure]) return OSM_CATEGORY_MAP[tags.leisure];
  return { id: 'other', name: 'Other' };
}

function parseOsmOpeningHours(
  osmHours: string | undefined,
): Record<string, { is_open: boolean; open_time: string; close_time: string }> | null {
  if (!osmHours) return null;

  const dayMap: Record<string, string> = {
    Mo: 'monday', Tu: 'tuesday', We: 'wednesday', Th: 'thursday',
    Fr: 'friday', Sa: 'saturday', Su: 'sunday',
  };

  const result: Record<string, { is_open: boolean; open_time: string; close_time: string }> = {};
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  for (const d of allDays) {
    result[d] = { is_open: false, open_time: '09:00', close_time: '18:00' };
  }

  if (osmHours === '24/7') {
    for (const d of allDays) {
      result[d] = { is_open: true, open_time: '00:00', close_time: '23:59' };
    }
    return result;
  }

  const parts = osmHours.split(';').map((s) => s.trim());
  const orderedKeys = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  for (const part of parts) {
    const match = part.match(/^([A-Za-z, -]+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
    if (!match) continue;

    const dayRange = match[1];
    const openTime = match[2];
    const closeTime = match[3];

    const segments = dayRange.split(',').map((s) => s.trim());
    for (const seg of segments) {
      const rangeMatch = seg.match(/^([A-Za-z]{2})\s*-\s*([A-Za-z]{2})$/);
      if (rangeMatch) {
        const startIdx = orderedKeys.indexOf(rangeMatch[1]);
        const endIdx = orderedKeys.indexOf(rangeMatch[2]);
        if (startIdx >= 0 && endIdx >= 0) {
          for (let i = startIdx; i <= endIdx; i++) {
            if (dayMap[orderedKeys[i]]) {
              result[dayMap[orderedKeys[i]]] = { is_open: true, open_time: openTime, close_time: closeTime };
            }
          }
        }
      } else if (dayMap[seg]) {
        result[dayMap[seg]] = { is_open: true, open_time: openTime, close_time: closeTime };
      }
    }
  }

  return Object.values(result).some((d) => d.is_open) ? result : null;
}

function buildLocation(tags: Record<string, string>): string {
  const parts = [
    tags['addr:street'],
    tags['addr:housenumber'],
    tags['addr:city'] || tags['addr:suburb'],
    tags['addr:state'],
  ].filter(Boolean);
  return parts.join(', ') || tags['addr:full'] || '';
}

function generateOsmBusinessId(element: OverpassElement): string {
  return `osm_${element.type}_${element.id}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  OpenStreetMap → Firestore Import Tool   ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  Dry run:      ${opts.dryRun}`);
  console.log(`  Batch size:   ${opts.batchSize}`);
  console.log(`  Resume:       ${opts.resume}`);
  console.log(`  City filter:  ${opts.city || 'All Tunisia'}`);
  console.log('');

  // ── 1. Download from Overpass API ──────────────────────────────────────────
  console.log('1. Downloading businesses from OpenStreetMap...');
  const overpassQuery = buildOverpassQuery(opts.city);
  const response = await queryOverpass(overpassQuery);

  const elements = response.elements.filter((el) => el.tags && el.tags.name);
  console.log(`   Found ${elements.length} businesses with names`);
  console.log('');

  // ── 2. Check for existing (resume mode) ────────────────────────────────────
  const existingIds = new Set<string>();

  if (opts.resume) {
    console.log('2. Checking for existing businesses (resume mode)...');
    const snap = await db.collection('businesses').where('source', '==', 'osm').get();
    snap.forEach((d) => existingIds.add(d.id));
    console.log(`   Found ${existingIds.size} already imported`);
    console.log('');
  }

  // ── 3. Import to Firestore ─────────────────────────────────────────────────
  console.log(`${opts.resume ? '3' : '2'}. Importing to Firestore...`);
  console.log('');

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  let batchCount = 0;
  let batch = db.batch();

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const tags = el.tags!;
    const businessId = generateOsmBusinessId(el);

    const pct = Math.round(((i + 1) / elements.length) * 100);
    process.stdout.write(`\r  [${pct}%] ${i + 1}/${elements.length}: ${(tags.name || '').slice(0, 40).padEnd(40)} `);

    if (opts.resume && existingIds.has(businessId)) {
      skipped++;
      continue;
    }

    if (!tags.name || tags.name.trim() === '') {
      skipped++;
      continue;
    }

    try {
      const category = mapOsmCategory(tags);
      const lat = el.lat || el.center?.lat || null;
      const lon = el.lon || el.center?.lon || null;
      const location = buildLocation(tags);
      const openingHours = parseOsmOpeningHours(tags.opening_hours);

      const businessDoc = {
        name: tags.name.trim(),
        description: tags.description || '',
        category_id: category.id,
        category_name: category.name,
        sub_categories: [],
        location,
        latitude: lat,
        longitude: lon,
        cover_image_url: null,
        logo_url: null,
        gallery_images: [],
        is_open: true,
        is_online: false,
        rating: 0,
        review_count: 0,
        is_featured: false,
        status: 'active',
        is_verified: false,
        owner_id: 'imported',
        contact: {
          phone: tags.phone || tags['contact:phone'] || null,
          phone_verified: false,
          email: tags.email || tags['contact:email'] || null,
          website: tags.website || tags['contact:website'] || null,
          instagram_handle: tags['contact:instagram'] || null,
          facebook_name: tags['contact:facebook'] || null,
          tiktok_handle: null,
        },
        category_ratings: [],
        rating_distribution: [
          { stars: 5, percentage: 0 },
          { stars: 4, percentage: 0 },
          { stars: 3, percentage: 0 },
          { stars: 2, percentage: 0 },
          { stars: 1, percentage: 0 },
        ],
        menu_categories: [],
        delivery_services: [],
        opening_hours: openingHours,
        opening_hours_visible: !!openingHours,
        source: 'osm',
        osm_id: `${el.type}/${el.id}`,
        is_claimed: false,
        is_imported: true,
        imported_at: adminPkg.firestore.FieldValue.serverTimestamp(),
        created_at: adminPkg.firestore.FieldValue.serverTimestamp(),
        updated_at: adminPkg.firestore.FieldValue.serverTimestamp(),
      };

      if (opts.dryRun) {
        if (i < 3) {
          console.log('\n\n  Sample document:');
          console.log(JSON.stringify(businessDoc, null, 2));
        }
        imported++;
        continue;
      }

      batch.set(db.collection('businesses').doc(businessId), businessDoc);
      batchCount++;

      if (batchCount >= opts.batchSize) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }

      imported++;
    } catch (err) {
      errors++;
      console.warn(`\n  Error: ${(err as Error).message}`);
    }
  }

  if (batchCount > 0 && !opts.dryRun) {
    await batch.commit();
  }

  console.log('\n\n');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║           Import Complete!               ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  Imported:  ${imported} businesses`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Errors:    ${errors}`);
  console.log(`  ${opts.dryRun ? 'DRY RUN — nothing written' : ''}`);
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
