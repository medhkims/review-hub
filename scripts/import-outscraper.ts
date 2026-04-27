/**
 * Outscraper → Firestore Import Script
 *
 * Imports businesses and reviews from an Outscraper JSON export into Firestore.
 * Downloads photos from Google URLs and uploads them to Firebase Storage
 * so links never expire.
 *
 * Usage:
 *   npx ts-node scripts/import-outscraper.ts --file data/outscraper-export.json
 *
 * Options:
 *   --file <path>       Path to Outscraper JSON file (required)
 *   --dry-run           Preview what would be imported without writing to Firestore
 *   --skip-photos       Skip photo download/upload (faster, but URLs may expire)
 *   --batch-size <n>    Firestore batch size (default: 400, max 500)
 *   --photo-concurrency <n>  Parallel photo downloads (default: 5)
 *   --resume            Skip businesses that already exist in Firestore (by google_place_id)
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import * as fs from 'fs';
import * as path from 'path';
import https from 'https';
import http from 'http';

// ── Firebase Config ──────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyC2P11O4HM--Gu8XaCV3lRgg-hqZ7qvV8g',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'reviewhub-91cfb.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'reviewhub-91cfb',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'reviewhub-91cfb.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '713435343120',
  appId: process.env.FIREBASE_APP_ID || '1:713435343120:web:054ce9a892746b748cdd95',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ── Category Mapping ─────────────────────────────────────────────────────────
// Maps Google Maps category types to your app's category IDs.
// Outscraper gives categories like "Restaurant", "Gym", "Hospital", etc.

const CATEGORY_MAP: Record<string, { id: string; name: string }> = {
  // Restaurant
  'restaurant': { id: 'restaurant', name: 'Restaurant' },
  'food': { id: 'restaurant', name: 'Restaurant' },
  'meal_delivery': { id: 'restaurant', name: 'Restaurant' },
  'meal_takeaway': { id: 'restaurant', name: 'Restaurant' },
  'bakery': { id: 'restaurant', name: 'Restaurant' },
  'fast food restaurant': { id: 'restaurant', name: 'Restaurant' },
  'pizza restaurant': { id: 'restaurant', name: 'Restaurant' },
  'seafood restaurant': { id: 'restaurant', name: 'Restaurant' },
  'tunisian restaurant': { id: 'restaurant', name: 'Restaurant' },
  'italian restaurant': { id: 'restaurant', name: 'Restaurant' },
  'french restaurant': { id: 'restaurant', name: 'Restaurant' },
  'lebanese restaurant': { id: 'restaurant', name: 'Restaurant' },
  'syrian restaurant': { id: 'restaurant', name: 'Restaurant' },
  'indian restaurant': { id: 'restaurant', name: 'Restaurant' },
  'mexican restaurant': { id: 'restaurant', name: 'Restaurant' },
  'sushi restaurant': { id: 'restaurant', name: 'Restaurant' },
  'chinese restaurant': { id: 'restaurant', name: 'Restaurant' },
  'turkish restaurant': { id: 'restaurant', name: 'Restaurant' },
  'barbecue restaurant': { id: 'restaurant', name: 'Restaurant' },
  'sandwich shop': { id: 'restaurant', name: 'Restaurant' },

  // Coffee Shop
  'cafe': { id: 'coffee_shop', name: 'Coffee Shop' },
  'coffee shop': { id: 'coffee_shop', name: 'Coffee Shop' },
  'coffee': { id: 'coffee_shop', name: 'Coffee Shop' },
  'tea house': { id: 'coffee_shop', name: 'Coffee Shop' },

  // Gym
  'gym': { id: 'gym', name: 'Gym' },
  'fitness center': { id: 'gym', name: 'Gym' },
  'sports club': { id: 'gym', name: 'Gym' },

  // Medical
  'hospital': { id: 'medical', name: 'Medical' },
  'clinic': { id: 'medical', name: 'Medical' },
  'pharmacy': { id: 'medical', name: 'Medical' },
  'medical center': { id: 'medical', name: 'Medical' },
  'health': { id: 'medical', name: 'Medical' },

  // Doctor
  'doctor': { id: 'doctor', name: 'Doctor' },
  'dentist': { id: 'doctor', name: 'Doctor' },
  'physiotherapist': { id: 'doctor', name: 'Doctor' },

  // Hebergement
  'hotel': { id: 'hebergement', name: 'Hebergement' },
  'lodging': { id: 'hebergement', name: 'Hebergement' },
  'guest house': { id: 'hebergement', name: 'Hebergement' },
  'resort': { id: 'hebergement', name: 'Hebergement' },
  'motel': { id: 'hebergement', name: 'Hebergement' },

  // Education
  'school': { id: 'education', name: 'Education' },
  'university': { id: 'education', name: 'Education' },
  'training center': { id: 'education', name: 'Education' },
  'kindergarten': { id: 'education', name: 'Education' },

  // Shopping
  'store': { id: 'shopping', name: 'Shopping' },
  'shopping_mall': { id: 'shopping', name: 'Shopping' },
  'clothing_store': { id: 'shopping', name: 'Shopping' },
  'electronics_store': { id: 'shopping', name: 'Shopping' },
  'furniture_store': { id: 'shopping', name: 'Shopping' },
  'jewelry_store': { id: 'shopping', name: 'Shopping' },
  'shoe_store': { id: 'shopping', name: 'Shopping' },
  'supermarket': { id: 'shopping', name: 'Shopping' },
  'convenience_store': { id: 'shopping', name: 'Shopping' },

  // Car Services
  'car_rental': { id: 'car_services', name: 'Car Services' },
  'car rental': { id: 'car_services', name: 'Car Services' },

  // Bank
  'bank': { id: 'bank', name: 'Bank' },
  'atm': { id: 'bank', name: 'Bank' },
  'finance': { id: 'bank', name: 'Bank' },

  // Beauty
  'beauty_salon': { id: 'beauty', name: 'Beauty' },
  'hair_care': { id: 'beauty', name: 'Beauty' },
  'spa': { id: 'beauty', name: 'Beauty' },
  'barber shop': { id: 'beauty', name: 'Beauty' },
  'nail salon': { id: 'beauty', name: 'Beauty' },

  // Car services
  'car_repair': { id: 'car_services', name: 'Car Services' },
  'car_wash': { id: 'car_services', name: 'Car Services' },
  'car_dealer': { id: 'car_services', name: 'Car Services' },
  'gas_station': { id: 'car_services', name: 'Car Services' },
};

// ── Outscraper Types ─────────────────────────────────────────────────────────

interface OutscraperBusiness {
  name: string;
  place_id?: string;
  google_id?: string;
  full_address?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  type?: string;
  types?: string;
  phone?: string;
  site?: string;
  rating?: number;
  reviews?: number;
  reviews_data?: OutscraperReview[];
  photo?: string;
  photos_sample?: string[];
  working_hours?: Record<string, string>;
  description?: string;
  price_level?: string;
  // Some exports use these alternative field names
  query?: string;
  subtypes?: string;
}

interface OutscraperReview {
  author_title?: string;
  author_id?: string;
  author_image?: string;
  review_text?: string;
  review_rating?: number;
  review_datetime_utc?: string;
  review_likes?: number;
  review_id?: string;
  owner_answer?: string;
  owner_answer_timestamp_datetime_utc?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseArgs(): {
  file: string;
  dryRun: boolean;
  skipPhotos: boolean;
  batchSize: number;
  photoConcurrency: number;
  resume: boolean;
} {
  const args = process.argv.slice(2);
  let file = '';
  let dryRun = false;
  let skipPhotos = false;
  let batchSize = 400;
  let photoConcurrency = 5;
  let resume = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
        file = args[++i];
        break;
      case '--dry-run':
        dryRun = true;
        break;
      case '--skip-photos':
        skipPhotos = true;
        break;
      case '--batch-size':
        batchSize = Math.min(500, parseInt(args[++i], 10) || 400);
        break;
      case '--photo-concurrency':
        photoConcurrency = parseInt(args[++i], 10) || 5;
        break;
      case '--resume':
        resume = true;
        break;
    }
  }

  if (!file) {
    console.error('Usage: npx ts-node scripts/import-outscraper.ts --file <path-to-json>');
    process.exit(1);
  }

  return { file, dryRun, skipPhotos, batchSize, photoConcurrency, resume };
}

/**
 * Download a file from a URL and return the Buffer.
 */
function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, { timeout: 30000 }, (response) => {
      // Follow redirects
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

/**
 * Upload a photo buffer to Firebase Storage and return the permanent download URL.
 */
async function uploadPhotoToStorage(
  buffer: Buffer,
  businessId: string,
  photoIndex: number,
): Promise<string> {
  const storagePath = `businesses/${businessId}/photos/photo_${photoIndex}.jpg`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, buffer, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

/**
 * Download photos and upload to Firebase Storage.
 * Returns array of permanent Firebase Storage URLs.
 */
async function processPhotos(
  photoUrls: string[],
  businessId: string,
  concurrency: number,
): Promise<string[]> {
  const results: string[] = [];
  // Process in batches of `concurrency`
  for (let i = 0; i < photoUrls.length; i += concurrency) {
    const batch = photoUrls.slice(i, i + concurrency);
    const uploaded = await Promise.allSettled(
      batch.map(async (url, idx) => {
        try {
          const buffer = await downloadFile(url);
          return uploadPhotoToStorage(buffer, businessId, i + idx);
        } catch (err) {
          console.warn(`  ⚠ Failed to download photo ${i + idx}: ${(err as Error).message}`);
          return null;
        }
      }),
    );
    for (const result of uploaded) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    }
  }
  return results;
}

/**
 * Map a Google category string to our app's category.
 */
function mapCategory(googleCategory: string | undefined, types: string | undefined): { id: string; name: string } {
  const defaultCategory = { id: 'other', name: 'Other' };

  // Try the main category first
  if (googleCategory) {
    const normalized = googleCategory.toLowerCase().trim();
    if (CATEGORY_MAP[normalized]) return CATEGORY_MAP[normalized];

    // Try partial matching
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }
  }

  // Try the types field
  if (types) {
    const typeList = types.split(',').map((t) => t.trim().toLowerCase());
    for (const t of typeList) {
      if (CATEGORY_MAP[t]) return CATEGORY_MAP[t];
    }
  }

  return defaultCategory;
}

/**
 * Parse Outscraper's working_hours into our OpeningHours format.
 * Outscraper format: { "Monday": "9AM-10PM", "Tuesday": "9AM-10PM", ... }
 */
function parseOpeningHours(
  workingHours: Record<string, string> | undefined,
): Record<string, { is_open: boolean; open_time: string; close_time: string }> | undefined {
  if (!workingHours || Object.keys(workingHours).length === 0) return undefined;

  const dayMap: Record<string, string> = {
    Monday: 'monday',
    Tuesday: 'tuesday',
    Wednesday: 'wednesday',
    Thursday: 'thursday',
    Friday: 'friday',
    Saturday: 'saturday',
    Sunday: 'sunday',
  };

  const result: Record<string, { is_open: boolean; open_time: string; close_time: string }> = {};

  for (const [day, hours] of Object.entries(workingHours)) {
    const dayKey = dayMap[day];
    if (!dayKey) continue;

    if (!hours || hours.toLowerCase() === 'closed') {
      result[dayKey] = { is_open: false, open_time: '09:00', close_time: '18:00' };
      continue;
    }

    if (hours.toLowerCase().includes('open 24 hours') || hours.toLowerCase() === '24 hours') {
      result[dayKey] = { is_open: true, open_time: '00:00', close_time: '23:59' };
      continue;
    }

    // Parse "9AM-10PM" or "09:00-22:00" format
    const match = hours.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–]\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i);
    if (match) {
      result[dayKey] = {
        is_open: true,
        open_time: convertTo24h(match[1].trim()),
        close_time: convertTo24h(match[2].trim()),
      };
    } else {
      result[dayKey] = { is_open: true, open_time: '09:00', close_time: '18:00' };
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function convertTo24h(time: string): string {
  // Already in 24h format like "09:00"
  if (/^\d{1,2}:\d{2}$/.test(time) && !time.match(/[AP]M/i)) {
    return time.padStart(5, '0');
  }

  const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return '09:00';

  let hour = parseInt(match[1], 10);
  const minute = match[2] || '00';
  const period = match[3].toUpperCase();

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, '0')}:${minute}`;
}

/**
 * Generate a URL-safe document ID from a business name + place_id.
 */
function generateBusinessId(business: OutscraperBusiness): string {
  const placeId = business.place_id || business.google_id;
  if (placeId) {
    // Use a shortened hash of the place_id for a clean document ID
    return `goog_${placeId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;
  }
  // Fallback: slugify the name
  const slug = (business.name || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);
  return `imported_${slug}_${Date.now().toString(36)}`;
}

// ── Main Import Logic ────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Outscraper → Firestore Import Tool     ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  File:              ${opts.file}`);
  console.log(`  Dry run:           ${opts.dryRun}`);
  console.log(`  Skip photos:       ${opts.skipPhotos}`);
  console.log(`  Batch size:        ${opts.batchSize}`);
  console.log(`  Photo concurrency: ${opts.photoConcurrency}`);
  console.log(`  Resume mode:       ${opts.resume}`);
  console.log('');

  // ── 1. Read the JSON file ──────────────────────────────────────────────────
  const filePath = path.resolve(opts.file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let businesses: OutscraperBusiness[];

  try {
    const parsed = JSON.parse(raw);
    // Outscraper can export as array or as { data: [...] }
    businesses = Array.isArray(parsed) ? parsed : parsed.data || parsed.results || [];
  } catch {
    console.error('Failed to parse JSON file. Make sure it is valid JSON.');
    process.exit(1);
  }

  console.log(`📦 Loaded ${businesses.length} businesses from file`);
  console.log('');

  // ── 2. Check for existing businesses (resume mode) ─────────────────────────
  const existingPlaceIds = new Set<string>();

  if (opts.resume) {
    console.log('🔍 Checking for existing businesses (resume mode)...');
    const snap = await getDocs(
      query(collection(db, 'businesses'), where('source', '==', 'outscraper')),
    );
    snap.forEach((d) => {
      const data = d.data();
      if (data.google_place_id) existingPlaceIds.add(data.google_place_id);
    });
    console.log(`  Found ${existingPlaceIds.size} already imported businesses`);
    console.log('');
  }

  // ── 3. Process each business ───────────────────────────────────────────────
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  let reviewsImported = 0;

  const totalBusinesses = businesses.length;

  for (let i = 0; i < totalBusinesses; i++) {
    const biz = businesses[i];
    const placeId = biz.place_id || biz.google_id || '';

    // Progress
    const pct = Math.round(((i + 1) / totalBusinesses) * 100);
    process.stdout.write(`\r[${pct}%] Processing ${i + 1}/${totalBusinesses}: ${(biz.name || 'Unknown').slice(0, 40).padEnd(40)} `);

    // Skip if already imported
    if (opts.resume && placeId && existingPlaceIds.has(placeId)) {
      skipped++;
      continue;
    }

    // Skip businesses without a name
    if (!biz.name || biz.name.trim() === '') {
      skipped++;
      continue;
    }

    try {
      const businessId = generateBusinessId(biz);
      const category = mapCategory(biz.category || biz.type, biz.types || biz.subtypes);
      const location = [biz.street, biz.city, biz.state]
        .filter(Boolean)
        .join(', ') || biz.full_address || '';

      // ── Process photos ───────────────────────────────────────────────────
      let coverImageUrl: string | null = null;
      let galleryImages: string[] = [];

      if (!opts.skipPhotos && !opts.dryRun) {
        const photoUrls: string[] = [];
        if (biz.photo) photoUrls.push(biz.photo);
        if (biz.photos_sample) photoUrls.push(...biz.photos_sample);

        // Deduplicate and limit to 5 photos
        const uniquePhotos = [...new Set(photoUrls)].slice(0, 5);

        if (uniquePhotos.length > 0) {
          const uploadedUrls = await processPhotos(uniquePhotos, businessId, opts.photoConcurrency);
          if (uploadedUrls.length > 0) {
            coverImageUrl = uploadedUrls[0];
            galleryImages = uploadedUrls;
          }
        }
      } else if (opts.skipPhotos) {
        // Store Google URLs directly (may expire)
        if (biz.photo) coverImageUrl = biz.photo;
        if (biz.photos_sample) galleryImages = biz.photos_sample.slice(0, 5);
      }

      // ── Build the Firestore document ─────────────────────────────────────
      const openingHours = parseOpeningHours(biz.working_hours);

      const businessDoc = {
        name: biz.name.trim(),
        description: biz.description || '',
        category_id: category.id,
        category_name: category.name,
        sub_categories: [],
        location,
        latitude: biz.latitude || null,
        longitude: biz.longitude || null,
        cover_image_url: coverImageUrl,
        logo_url: null,
        gallery_images: galleryImages,
        is_open: true,
        is_online: false,
        rating: biz.rating || 0,
        review_count: biz.reviews || 0,
        is_featured: false,
        status: 'active',
        is_verified: false,
        owner_id: 'imported',
        contact: {
          phone: biz.phone || null,
          phone_verified: false,
          email: null,
          website: biz.site || null,
          instagram_handle: null,
          facebook_name: null,
          tiktok_handle: null,
        },
        category_ratings: [],
        rating_distribution: buildRatingDistribution(biz.rating || 0),
        menu_categories: [],
        delivery_services: [],
        opening_hours: openingHours || null,
        opening_hours_visible: !!openingHours,
        // Import metadata & safeguards
        source: 'outscraper',
        google_place_id: placeId || null,
        is_claimed: false,         // No real owner yet — shows "Claim this business" button
        is_imported: true,         // Distinguishes imported vs user-created businesses
        imported_at: serverTimestamp(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      if (opts.dryRun) {
        if (i < 3) {
          console.log('\n\n📄 Sample business document:');
          console.log(JSON.stringify(businessDoc, null, 2));
        }
        imported++;
        continue;
      }

      // ── Write business to Firestore ──────────────────────────────────────
      await setDoc(doc(db, 'businesses', businessId), businessDoc);

      // ── Import reviews ───────────────────────────────────────────────────
      if (biz.reviews_data && biz.reviews_data.length > 0) {
        const batch = writeBatch(db);
        let batchCount = 0;

        for (const review of biz.reviews_data.slice(0, 5)) {
          if (!review.review_text && !review.review_rating) continue;

          const reviewId = review.review_id
            || `imported_${businessId}_${(review.author_id || Date.now().toString(36)).slice(0, 10)}`;

          const reviewDoc = {
            business_id: businessId,
            business_name: biz.name.trim(),
            user_id: `google_${(review.author_id || 'anonymous').replace(/[^a-zA-Z0-9]/g, '')}`,
            overall_rating: review.review_rating || 0,
            review_text: review.review_text || '',
            photo_urls: [],
            ratings: {},
            status: 'posted',
            like_count: review.review_likes || 0,
            view_count: 0,
            comment_count: 0,
            source: 'google_import',
            google_author_name: review.author_title || 'Google User',
            google_author_image: review.author_image || null,
            created_at: review.review_datetime_utc
              ? Timestamp.fromDate(new Date(review.review_datetime_utc))
              : serverTimestamp(),
            imported_at: serverTimestamp(),
          };

          batch.set(doc(db, 'reviews', reviewId), reviewDoc);
          batchCount++;
          reviewsImported++;
        }

        if (batchCount > 0) {
          await batch.commit();
        }
      }

      imported++;
    } catch (err) {
      errors++;
      console.warn(`\n  ❌ Error importing "${biz.name}": ${(err as Error).message}`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n\n');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║           Import Complete!               ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  ✅ Imported:  ${imported} businesses`);
  console.log(`  ⏭  Skipped:   ${skipped} (duplicates or invalid)`);
  console.log(`  ❌ Errors:    ${errors}`);
  console.log(`  📝 Reviews:   ${reviewsImported}`);
  console.log(`  ${opts.dryRun ? '⚠️  DRY RUN — nothing was written to Firestore' : ''}`);
  console.log('');
}

/**
 * Build an approximate rating distribution from an average rating.
 * (Outscraper doesn't give per-star breakdown, so we estimate.)
 */
function buildRatingDistribution(avgRating: number): Array<{ stars: number; percentage: number }> {
  if (avgRating === 0) {
    return [
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ];
  }

  // Approximate distribution based on average rating
  // Higher avg → more weight on 5-star
  const r = Math.min(5, Math.max(1, avgRating));
  const p5 = Math.round(Math.max(0, (r - 3) * 25));
  const p4 = Math.round(Math.max(0, 30 - Math.abs(r - 4) * 15));
  const p3 = Math.round(Math.max(0, 20 - Math.abs(r - 3) * 10));
  const p2 = Math.round(Math.max(0, 15 - (r - 2) * 8));
  const remaining = Math.max(0, 100 - p5 - p4 - p3 - p2);

  return [
    { stars: 5, percentage: p5 },
    { stars: 4, percentage: p4 },
    { stars: 3, percentage: p3 },
    { stars: 2, percentage: p2 },
    { stars: 1, percentage: remaining },
  ];
}

// ── Run ──────────────────────────────────────────────────────────────────────
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
