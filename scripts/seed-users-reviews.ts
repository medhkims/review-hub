/**
 * Seed 100 Users + 10,000 Reviews
 *
 * Creates 100 fake user documents in Firestore and generates
 * 100 random reviews per user spread across all seeded businesses.
 *
 * Prerequisites: Firestore rules must allow unauthenticated writes
 * (deploy temporary open rules before running, restore after).
 *
 * Usage:
 *   npx ts-node scripts/seed-users-reviews.ts
 */

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  writeBatch,
  Timestamp,
  getDoc,
  updateDoc,
  serverTimestamp,
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyC2P11O4HM--Gu8XaCV3lRgg-hqZ7qvV8g',
  authDomain: 'reviewhub-91cfb.firebaseapp.com',
  projectId: 'reviewhub-91cfb',
  storageBucket: 'reviewhub-91cfb.firebasestorage.app',
  messagingSenderId: '713435343120',
  appId: '1:713435343120:web:054ce9a892746b748cdd95',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Category → Rating Criteria map ──────────────────────────────────────────
const CATEGORY_CRITERIA_DEF: Record<string, { key: string; label: string; icon: string }[]> = {
  restaurant:       [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'food_quality', label: 'Food Quality', icon: 'silverware-fork-knife' }, { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' }],
  gym:              [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'equipment_quality', label: 'Equipment Quality', icon: 'dumbbell' }, { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' }],
  coffee_shop:      [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'product_quality', label: 'Product Quality', icon: 'star-check' }, { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' }],
  medical:          [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'waiting_time', label: 'Waiting Time', icon: 'clock-outline' }],
  doctor:           [{ key: 'communication', label: 'Communication', icon: 'message-text' }, { key: 'professionalism', label: 'Professionalism', icon: 'certificate' }, { key: 'punctuality', label: 'Punctuality', icon: 'clock-check' }],
  hebergement:      [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'location', label: 'Location', icon: 'map-marker' }, { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' }],
  education:        [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'education_quality', label: 'Education Quality', icon: 'book-open-variant' }],
  shopping:         [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'product_quality', label: 'Product Quality', icon: 'star-check' }],
  car_services:     [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'vehicle_condition', label: 'Vehicle Condition', icon: 'car-cog' }, { key: 'pricing_transparency', label: 'Pricing Transparency', icon: 'tag' }],
  beauty:           [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' }, { key: 'result_quality', label: 'Result Quality', icon: 'star-check' }],
  bank:             [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'speed', label: 'Speed', icon: 'lightning-bolt' }, { key: 'transparency', label: 'Transparency', icon: 'eye' }],
  job_freelancer:   [{ key: 'punctuality', label: 'Punctuality', icon: 'clock-check' }, { key: 'competence', label: 'Competence', icon: 'brain' }, { key: 'professionalism', label: 'Professionalism', icon: 'certificate' }],
  tradesman:        [{ key: 'punctuality', label: 'Punctuality', icon: 'clock-check' }, { key: 'competence', label: 'Competence', icon: 'brain' }, { key: 'professionalism', label: 'Professionalism', icon: 'certificate' }],
  delivery_company: [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'promptness', label: 'Promptness', icon: 'clock-fast' }],
  other:            [{ key: 'service', label: 'Service', icon: 'shield-account' }, { key: 'quality', label: 'Quality', icon: 'star-check' }],
};
const CATEGORY_CRITERIA: Record<string, string[]> = {};
for (const [catId, criteria] of Object.entries(CATEGORY_CRITERIA_DEF)) {
  CATEGORY_CRITERIA[catId] = (criteria as any[]).map((c: any) => c.key);
}

// ── Business definitions ────────────────────────────────────────────────────
const BUSINESSES = [
  { id: 'restaurant_el_ali', name: 'Restaurant El Ali', category_id: 'restaurant' },
  { id: 'le_golfe', name: 'Le Golfe', category_id: 'restaurant' },
  { id: 'dar_el_jeld', name: 'Dar El Jeld', category_id: 'restaurant' },
  { id: 'fit_zone', name: 'Fit Zone', category_id: 'gym' },
  { id: 'cafe_des_nattes', name: 'Cafe des Nattes', category_id: 'coffee_shop' },
  { id: 'restaurant_dar_zarrouk', name: 'Dar Zarrouk', category_id: 'restaurant' },
  { id: 'hotel_the_residence', name: 'The Residence Tunis', category_id: 'hebergement' },
  { id: 'delivery_first_delivery', name: 'First Delivery', category_id: 'delivery_company' },
  { id: 'delivery_adex', name: 'Adex', category_id: 'delivery_company' },
  { id: 'delivery_navex', name: 'Navex Delivery', category_id: 'delivery_company' },
  { id: 'delivery_best_delivery', name: 'Best Delivery', category_id: 'delivery_company' },
  { id: 'delivery_mylerz', name: 'Mylerz', category_id: 'delivery_company' },
  { id: 'delivery_droppex', name: 'Droppex', category_id: 'delivery_company' },
  { id: 'delivery_jetpack', name: 'Jetpack', category_id: 'delivery_company' },
  { id: 'delivery_bestway', name: 'Bestway', category_id: 'delivery_company' },
  { id: 'delivery_tunisia_express', name: 'Tunisia Express', category_id: 'delivery_company' },
  { id: 'delivery_aramex', name: 'Aramex Tunisia', category_id: 'delivery_company' },
  { id: 'delivery_fedex', name: 'FedEx Tunisia', category_id: 'delivery_company' },
  { id: 'delivery_dhl', name: 'DHL Express Tunisia', category_id: 'delivery_company' },
  { id: 'delivery_ups', name: 'UPS Tunisia', category_id: 'delivery_company' },
  { id: 'delivery_chronopost', name: 'Chronopost Tunisia', category_id: 'delivery_company' },
  { id: 'delivery_colissimo', name: 'Colissimo Tunisia', category_id: 'delivery_company' },
];

// ── Names ───────────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Mohamed', 'Ahmed', 'Ali', 'Youssef', 'Omar', 'Khaled', 'Amine', 'Bilel',
  'Hamza', 'Sami', 'Rami', 'Nabil', 'Tarek', 'Mehdi', 'Firas', 'Sofiane',
  'Walid', 'Hichem', 'Slim', 'Karim', 'Fatma', 'Mariem', 'Ines', 'Sara',
  'Amira', 'Hana', 'Rania', 'Nour', 'Yasmine', 'Salma', 'Rim', 'Asma',
  'Sarra', 'Manel', 'Syrine', 'Eya', 'Chaima', 'Dorra', 'Lina', 'Maha',
];
const LAST_NAMES = [
  'Ben Ali', 'Trabelsi', 'Bouazizi', 'Gharbi', 'Mansouri', 'Jebali',
  'Khelifi', 'Hammami', 'Chouchane', 'Saidi', 'Mejri', 'Riahi',
  'Oueslati', 'Toumi', 'Dridi', 'Ayari', 'Ferchichi', 'Chaabane',
  'Bouzid', 'Maaloul', 'Jaziri', 'Khemiri', 'Sassi', 'Belhaj',
  'Guesmi', 'Mbarki', 'Rekik', 'Sliti', 'Haddad', 'Nefzi',
];

// ── Review text templates ───────────────────────────────────────────────────
const POSITIVE_REVIEWS = [
  'Excellent experience! Highly recommended.',
  'Amazing service, will definitely come back.',
  'Very satisfied with the quality. Top notch!',
  'One of the best in Tunisia. Great job!',
  'Fantastic! Exceeded all my expectations.',
  'Professional and friendly. A great experience overall.',
  'Superb quality and great value for money.',
  'Really impressed with the level of service.',
  'Outstanding! I recommend this to everyone.',
  'Very clean, organized, and welcoming. Loved it.',
  'Best experience I have had in a long time.',
  'Great atmosphere and wonderful staff.',
  'Could not be happier with the service.',
  'Premium quality. You get what you pay for.',
  'Everything was perfect from start to finish.',
];
const NEUTRAL_REVIEWS = [
  'It was okay. Nothing special but not bad either.',
  'Average experience. Some things could be improved.',
  'Decent but I expected a bit more for the price.',
  'Good overall but there is room for improvement.',
  'Not bad. The service was a bit slow though.',
  'It was fine. Would consider coming back.',
  'Satisfactory. Met basic expectations.',
  'Mixed feelings. Some things were great, others not so much.',
  'Reasonable quality for the price point.',
  'Acceptable but would not go out of my way to recommend it.',
];
const NEGATIVE_REVIEWS = [
  'Disappointing experience. Expected much better.',
  'Not great. The service needs serious improvement.',
  'Below average. I probably will not return.',
  'Poor quality for the price. Very disappointed.',
  'Had a bad experience. Staff was not helpful.',
  'Would not recommend. Too many issues.',
  'Needs a lot of improvement in all areas.',
  'Terrible customer service. Very frustrating.',
  'Not worth the money at all.',
  'Very underwhelming. Expected so much more.',
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRating(): number {
  const r = Math.random() * 100;
  if (r < 30) return 5;
  if (r < 60) return 4;
  if (r < 80) return 3;
  if (r < 92) return 2;
  return 1;
}

function reviewTextForRating(overall: number): string {
  if (overall >= 4) return pick(POSITIVE_REVIEWS);
  if (overall >= 3) return pick(NEUTRAL_REVIEWS);
  return pick(NEGATIVE_REVIEWS);
}

function randomTimestamp(): any {
  const now = Date.now();
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
  return Timestamp.fromDate(new Date(oneYearAgo + Math.random() * (now - oneYearAgo)));
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const NUM_USERS = 100;
  const REVIEWS_PER_USER = 127;
  const BATCH_SIZE = 400;

  console.log('=== Seed Users & Reviews ===');
  console.log(`Users: ${NUM_USERS} | Reviews/user: ${REVIEWS_PER_USER} | Total: ${NUM_USERS * REVIEWS_PER_USER}`);
  console.log('');

  // ── Step 1: Build user ID list (already exist from previous seed) ──────────
  console.log('Step 1: Using existing users...');
  const userIds: string[] = [];
  for (let i = 0; i < NUM_USERS; i++) {
    userIds.push(`seed_user_${String(i + 1).padStart(3, '0')}`);
  }
  console.log(`  ${NUM_USERS} user IDs ready`);
  console.log('');

  // ── Step 2: Create reviews ────────────────────────────────────────────────
  console.log('Step 2: Creating reviews...');

  const bizAgg: Record<string, {
    totalRating: number; count: number;
    starCounts: Record<number, number>;
    criteriaSum: Record<string, number>;
  }> = {};
  for (const biz of BUSINESSES) {
    bizAgg[biz.id] = { totalRating: 0, count: 0, starCounts: {1:0,2:0,3:0,4:0,5:0}, criteriaSum: {} };
    for (const key of (CATEGORY_CRITERIA[biz.category_id] || ['service'])) {
      bizAgg[biz.id].criteriaSum[key] = 0;
    }
  }

  let total = 0;
  let batch = writeBatch(db); let bc = 0;

  for (const uid of userIds) {
    for (let r = 0; r < REVIEWS_PER_USER; r++) {
      const biz = pick(BUSINESSES);
      const criteria = CATEGORY_CRITERIA[biz.category_id] || ['service'];

      const ratings: Record<string, number> = {};
      let sum = 0;
      for (const key of criteria) { const v = randomRating(); ratings[key] = v; sum += v; }
      const overall = parseFloat((sum / criteria.length).toFixed(1));
      const star = Math.min(5, Math.max(1, Math.round(overall)));

      const agg = bizAgg[biz.id];
      agg.totalRating += overall; agg.count++; agg.starCounts[star]++;
      for (const key of criteria) { agg.criteriaSum[key] += ratings[key]; }

      batch.set(doc(collection(db, 'reviews')), {
        business_id: biz.id, business_name: biz.name, user_id: uid,
        ratings, overall_rating: overall,
        review_text: reviewTextForRating(overall),
        photo_urls: [], created_at: randomTimestamp(), status: 'posted',
        like_count: rand(0, 25), view_count: rand(5, 200), comment_count: rand(0, 8),
      });

      bc++; total++;
      if (bc >= BATCH_SIZE) {
        await batch.commit();
        console.log(`  ${total} reviews committed`);
        batch = writeBatch(db); bc = 0;
      }
    }
  }
  if (bc > 0) { await batch.commit(); }
  console.log(`  Done: ${total} reviews`);
  console.log('');

  // ── Step 3: Update business aggregation ───────────────────────────────────
  console.log('Step 3: Updating business stats...');
  for (const biz of BUSINESSES) {
    const agg = bizAgg[biz.id];
    if (agg.count === 0) continue;

    const avg = parseFloat((agg.totalRating / agg.count).toFixed(1));
    const dist = [5,4,3,2,1].map(s => ({
      stars: s,
      percentage: parseFloat(((agg.starCounts[s] / agg.count) * 100).toFixed(1)),
    }));
    const critDef = (CATEGORY_CRITERIA_DEF[biz.category_id] || CATEGORY_CRITERIA_DEF['other']) as any[];
    const catRatings = critDef.map((c: any) => ({
      name: c.label, icon: c.icon,
      rating: parseFloat(((agg.criteriaSum[c.key] || 0) / agg.count).toFixed(1)),
    }));

    const ref = doc(db, 'businesses', biz.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, {
        rating: avg, review_count: agg.count,
        rating_distribution: dist, category_ratings: catRatings,
        updated_at: serverTimestamp(),
      });
      console.log(`  ${biz.name}: ${avg} stars (${agg.count} reviews)`);
    } else {
      console.log(`  SKIP: ${biz.name} not found`);
    }
  }

  console.log('');
  console.log('=== DONE! ===');
}

main().then(() => process.exit(0)).catch((e: any) => { console.error('FAILED:', e); process.exit(1); });
