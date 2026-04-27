/**
 * Assign Subcategories to Imported OSM Businesses
 *
 * 1. Re-downloads OSM data to get original tags (amenity, shop, cuisine, etc.)
 * 2. Reads existing categories + subcategories from Firestore
 * 3. Uses OSM tags + business name keywords to assign the best subcategory
 * 4. Updates businesses in Firestore
 * 5. Reports which new subcategories should be added
 *
 * Usage:
 *   npx ts-node scripts/assign-subcategories.ts
 *   npx ts-node scripts/assign-subcategories.ts --dry-run     # Preview without updating
 */

import adminPkg from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'serviceAccountKey.json'), 'utf-8'),
);

adminPkg.initializeApp({
  credential: adminPkg.credential.cert(serviceAccount),
});

const db = adminPkg.firestore();

// ── Args ────────────────────────────────────────────────────────────────────

const dryRun = process.argv.includes('--dry-run');

// ── OSM Tag → Subcategory Mapping ──────────────────────────────────────────
// Maps the raw OSM tag value to a subcategory name per app category.

interface SubcatRule {
  /** App category_id this rule applies to */
  categoryId: string;
  /** Subcategory name to assign */
  subcategory: string;
  /** Match if the OSM amenity/shop/tourism/leisure tag equals one of these */
  osmTags?: string[];
  /** Match if cuisine tag contains one of these */
  cuisineTags?: string[];
  /** Match if business name (lowercased) contains one of these keywords */
  nameKeywords?: string[];
}

const SUBCAT_RULES: SubcatRule[] = [
  // ─── Restaurant ───────────────────────────────────────────────────────
  { categoryId: 'restaurant', subcategory: 'Fast Food',        osmTags: ['fast_food'] },
  { categoryId: 'restaurant', subcategory: 'Bakery',           osmTags: ['bakery'] },
  { categoryId: 'restaurant', subcategory: 'Ice Cream',        osmTags: ['ice_cream'] },
  { categoryId: 'restaurant', subcategory: 'Food Court',       osmTags: ['food_court'] },
  { categoryId: 'restaurant', subcategory: 'Pizza',            cuisineTags: ['pizza'], nameKeywords: ['pizza', 'pizzeria'] },
  { categoryId: 'restaurant', subcategory: 'Burger',           cuisineTags: ['burger'], nameKeywords: ['burger', 'burgers'] },
  { categoryId: 'restaurant', subcategory: 'Sushi',            cuisineTags: ['sushi', 'japanese'], nameKeywords: ['sushi', 'japonais'] },
  { categoryId: 'restaurant', subcategory: 'Italian',          cuisineTags: ['italian', 'pasta'], nameKeywords: ['italiano', 'italien', 'pasta', 'trattoria', 'ristorante'] },
  { categoryId: 'restaurant', subcategory: 'Chinese',          cuisineTags: ['chinese'], nameKeywords: ['chinois', 'chinese', 'wok'] },
  { categoryId: 'restaurant', subcategory: 'Turkish',          cuisineTags: ['turkish', 'kebab', 'döner'], nameKeywords: ['kebab', 'kebeb', 'döner', 'doner', 'shawarma', 'chawarma', 'turc'] },
  { categoryId: 'restaurant', subcategory: 'Tunisian',         cuisineTags: ['tunisian', 'maghreb', 'north_african'], nameKeywords: ['tunisien', 'tunisienne', 'couscous', 'brik', 'ojja', 'lablabi'] },
  { categoryId: 'restaurant', subcategory: 'Seafood',          cuisineTags: ['seafood', 'fish'], nameKeywords: ['poisson', 'fruits de mer', 'seafood', 'fish'] },
  { categoryId: 'restaurant', subcategory: 'Grillades',        cuisineTags: ['grill', 'barbecue', 'steak'], nameKeywords: ['grill', 'grillades', 'grillade', 'barbecue', 'bbq', 'steak', 'viande'] },
  { categoryId: 'restaurant', subcategory: 'Sandwiches',       cuisineTags: ['sandwich'], nameKeywords: ['sandwich', 'sandwicherie', 'panini', 'snack'] },
  { categoryId: 'restaurant', subcategory: 'Pâtisserie',       nameKeywords: ['pâtisserie', 'patisserie', 'gâteau', 'gateau', 'cake', 'cakes', 'sweet'] },
  { categoryId: 'restaurant', subcategory: 'Crêperie',         nameKeywords: ['crêpe', 'crepe', 'crêperie', 'creperie', 'pancake'] },
  { categoryId: 'restaurant', subcategory: 'Tacos',            cuisineTags: ['mexican', 'tacos'], nameKeywords: ['tacos', 'taco', 'mexicain'] },
  { categoryId: 'restaurant', subcategory: 'Indian',           cuisineTags: ['indian', 'curry'], nameKeywords: ['indien', 'indian', 'curry', 'tandoori'] },
  { categoryId: 'restaurant', subcategory: 'Lebanese',         cuisineTags: ['lebanese'], nameKeywords: ['libanais', 'lebanese'] },
  { categoryId: 'restaurant', subcategory: 'French',           cuisineTags: ['french'], nameKeywords: ['français', 'francais', 'bistro', 'brasserie'] },

  // ─── Coffee Shop ──────────────────────────────────────────────────────
  { categoryId: 'coffee_shop', subcategory: 'Café',            nameKeywords: ['café', 'cafe', 'coffee', 'قهوة'] },
  { categoryId: 'coffee_shop', subcategory: 'Tea House',       nameKeywords: ['thé', 'tea', 'salon de thé', 'شاي'] },
  { categoryId: 'coffee_shop', subcategory: 'Bubble Tea',      nameKeywords: ['bubble tea', 'boba'] },
  { categoryId: 'coffee_shop', subcategory: 'Juice Bar',       nameKeywords: ['juice', 'jus', 'smoothie', 'عصير'] },
  { categoryId: 'coffee_shop', subcategory: 'Chicha Lounge',   nameKeywords: ['chicha', 'hookah', 'shisha', 'narguile', 'شيشة'] },

  // ─── Gym ──────────────────────────────────────────────────────────────
  { categoryId: 'gym', subcategory: 'Fitness Center',          osmTags: ['fitness_centre'], nameKeywords: ['fitness', 'fit', 'gym'] },
  { categoryId: 'gym', subcategory: 'Sports Center',           osmTags: ['sports_centre'], nameKeywords: ['sport', 'sports'] },
  { categoryId: 'gym', subcategory: 'Yoga Studio',             nameKeywords: ['yoga', 'pilates'] },
  { categoryId: 'gym', subcategory: 'Martial Arts',            nameKeywords: ['karate', 'judo', 'taekwondo', 'boxing', 'boxe', 'mma', 'martial'] },
  { categoryId: 'gym', subcategory: 'Swimming Pool',           nameKeywords: ['piscine', 'swimming', 'pool', 'natation'] },
  { categoryId: 'gym', subcategory: 'Tennis',                  nameKeywords: ['tennis'] },
  { categoryId: 'gym', subcategory: 'Football',                nameKeywords: ['football', 'foot', 'soccer', 'stade'] },

  // ─── Medical ──────────────────────────────────────────────────────────
  { categoryId: 'medical', subcategory: 'Hospital',            osmTags: ['hospital'], nameKeywords: ['hôpital', 'hopital', 'hospital', 'مستشفى'] },
  { categoryId: 'medical', subcategory: 'Clinic',              osmTags: ['clinic'], nameKeywords: ['clinique', 'clinic', 'polyclinique', 'عيادة'] },
  { categoryId: 'medical', subcategory: 'Pharmacy',            osmTags: ['pharmacy'], nameKeywords: ['pharmacie', 'pharmacy', 'صيدلية'] },
  { categoryId: 'medical', subcategory: 'Laboratory',          nameKeywords: ['laboratoire', 'laboratory', 'lab', 'labo', 'analyse'] },

  // ─── Doctor ───────────────────────────────────────────────────────────
  { categoryId: 'doctor', subcategory: 'Dentist',              osmTags: ['dentist'], nameKeywords: ['dentiste', 'dentist', 'dental', 'طبيب أسنان'] },
  { categoryId: 'doctor', subcategory: 'General Practitioner',  osmTags: ['doctors'], nameKeywords: ['médecin', 'medecin', 'doctor', 'طبيب'] },
  { categoryId: 'doctor', subcategory: 'Ophthalmologist',      nameKeywords: ['ophtalmologue', 'ophtalmo', 'oculiste', 'eye', 'yeux'] },
  { categoryId: 'doctor', subcategory: 'Dermatologist',        nameKeywords: ['dermatologue', 'dermato', 'dermatolog', 'peau'] },
  { categoryId: 'doctor', subcategory: 'Pediatrician',         nameKeywords: ['pédiatre', 'pediatre', 'pediatr'] },
  { categoryId: 'doctor', subcategory: 'Gynecologist',         nameKeywords: ['gynécologue', 'gynecologue', 'gyneco'] },
  { categoryId: 'doctor', subcategory: 'Cardiologist',         nameKeywords: ['cardiologue', 'cardiolog'] },
  { categoryId: 'doctor', subcategory: 'Veterinarian',         nameKeywords: ['vétérinaire', 'veterinaire', 'vet'] },

  // ─── Hebergement (Hotel) ──────────────────────────────────────────────
  { categoryId: 'hebergement', subcategory: 'Hotel',           osmTags: ['hotel'], nameKeywords: ['hotel', 'hôtel', 'فندق'] },
  { categoryId: 'hebergement', subcategory: 'Hostel',          osmTags: ['hostel'], nameKeywords: ['hostel', 'auberge'] },
  { categoryId: 'hebergement', subcategory: 'Guest House',     osmTags: ['guest_house'], nameKeywords: ['guest house', 'maison d\'hôtes', 'dar', 'دار'] },
  { categoryId: 'hebergement', subcategory: 'Motel',           osmTags: ['motel'], nameKeywords: ['motel'] },
  { categoryId: 'hebergement', subcategory: 'Resort',          nameKeywords: ['resort', 'village touristique', 'club'] },

  // ─── Education ────────────────────────────────────────────────────────
  { categoryId: 'education', subcategory: 'School',            osmTags: ['school'], nameKeywords: ['école', 'ecole', 'school', 'مدرسة', 'lycée', 'lycee', 'collège', 'college'] },
  { categoryId: 'education', subcategory: 'University',        osmTags: ['university', 'college'], nameKeywords: ['université', 'universite', 'university', 'faculté', 'faculte', 'جامعة'] },
  { categoryId: 'education', subcategory: 'Kindergarten',      osmTags: ['kindergarten'], nameKeywords: ['jardin d\'enfant', 'maternelle', 'kindergarten', 'crèche', 'creche', 'روضة'] },
  { categoryId: 'education', subcategory: 'Training Center',   osmTags: ['training'], nameKeywords: ['formation', 'training', 'centre de formation', 'institut'] },
  { categoryId: 'education', subcategory: 'Language School',   nameKeywords: ['langue', 'language', 'anglais', 'english', 'français'] },
  { categoryId: 'education', subcategory: 'Driving School',    nameKeywords: ['auto-école', 'auto ecole', 'driving', 'permis'] },

  // ─── Shopping ─────────────────────────────────────────────────────────
  { categoryId: 'shopping', subcategory: 'Supermarket',        osmTags: ['supermarket'], nameKeywords: ['supermarché', 'supermarche', 'supermarket', 'carrefour', 'monoprix', 'géant', 'mg'] },
  { categoryId: 'shopping', subcategory: 'Mall',               osmTags: ['mall', 'department_store'], nameKeywords: ['mall', 'centre commercial', 'galerie'] },
  { categoryId: 'shopping', subcategory: 'Clothing',           osmTags: ['clothes', 'shoes'], nameKeywords: ['vêtement', 'vetement', 'clothes', 'mode', 'fashion', 'boutique', 'chaussure'] },
  { categoryId: 'shopping', subcategory: 'Electronics',        osmTags: ['electronics', 'mobile_phone'], nameKeywords: ['electronique', 'electronics', 'phone', 'téléphone', 'telephone', 'samsung', 'apple', 'huawei', 'informatique', 'ordinateur', 'computer'] },
  { categoryId: 'shopping', subcategory: 'Furniture',          osmTags: ['furniture'], nameKeywords: ['meuble', 'furniture', 'mobilier', 'décoration', 'decoration'] },
  { categoryId: 'shopping', subcategory: 'Jewelry',            osmTags: ['jewelry'], nameKeywords: ['bijouterie', 'jewelry', 'bijoux', 'or', 'gold'] },
  { categoryId: 'shopping', subcategory: 'Convenience Store',  osmTags: ['convenience', 'variety_store'], nameKeywords: ['épicerie', 'epicerie', 'convenience', 'alimentation'] },
  { categoryId: 'shopping', subcategory: 'Hardware Store',     osmTags: ['hardware'], nameKeywords: ['quincaillerie', 'hardware', 'bricolage'] },
  { categoryId: 'shopping', subcategory: 'Optics',             osmTags: ['optician'], nameKeywords: ['optique', 'opticien', 'lunettes', 'optical'] },
  { categoryId: 'shopping', subcategory: 'Bookstore',          osmTags: ['books'], nameKeywords: ['librairie', 'bookstore', 'livres', 'papeterie'] },
  { categoryId: 'shopping', subcategory: 'Gift Shop',          osmTags: ['gift'], nameKeywords: ['cadeau', 'gift', 'souvenir'] },

  // ─── Car Services ─────────────────────────────────────────────────────
  { categoryId: 'car_services', subcategory: 'Car Rental',     osmTags: ['car_rental'], nameKeywords: ['location', 'rental', 'rent a car', 'تأجير'] },
  { categoryId: 'car_services', subcategory: 'Car Repair',     osmTags: ['car_repair'], nameKeywords: ['réparation', 'reparation', 'mécanique', 'mecanique', 'garage', 'atelier'] },
  { categoryId: 'car_services', subcategory: 'Car Wash',       osmTags: ['car_wash'], nameKeywords: ['lavage', 'car wash', 'wash'] },
  { categoryId: 'car_services', subcategory: 'Gas Station',    osmTags: ['fuel'], nameKeywords: ['station', 'essence', 'fuel', 'carburant', 'total', 'shell', 'agil'] },
  { categoryId: 'car_services', subcategory: 'Car Dealer',     osmTags: ['car'], nameKeywords: ['concessionnaire', 'dealer', 'automobile', 'voiture'] },

  // ─── Bank ─────────────────────────────────────────────────────────────
  { categoryId: 'bank', subcategory: 'Bank',                   osmTags: ['bank'], nameKeywords: ['banque', 'bank', 'بنك'] },
  { categoryId: 'bank', subcategory: 'ATM',                    osmTags: ['atm'], nameKeywords: ['atm', 'distributeur', 'guichet'] },
  { categoryId: 'bank', subcategory: 'Insurance',              nameKeywords: ['assurance', 'insurance', 'تأمين'] },
  { categoryId: 'bank', subcategory: 'Exchange',               nameKeywords: ['change', 'exchange', 'bureau de change', 'صرف'] },

  // ─── Beauty ───────────────────────────────────────────────────────────
  { categoryId: 'beauty', subcategory: 'Hair Salon',           osmTags: ['hairdresser'], nameKeywords: ['coiffure', 'coiffeur', 'hair', 'salon', 'barber', 'حلاق'] },
  { categoryId: 'beauty', subcategory: 'Beauty Salon',         osmTags: ['beauty'], nameKeywords: ['beauté', 'beaute', 'beauty', 'esthétique', 'esthetique', 'soin', 'spa'] },
  { categoryId: 'beauty', subcategory: 'Nail Salon',           nameKeywords: ['nail', 'ongle', 'manucure', 'manicure'] },
  { categoryId: 'beauty', subcategory: 'Perfumery',            nameKeywords: ['parfum', 'perfume', 'parfumerie'] },
];

// ── Overpass API (reuse from import script) ────────────────────────────────

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function queryOverpass(overpassQL: string): Promise<{ elements: OverpassElement[] }> {
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

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf-8');
          resolve(JSON.parse(body));
        } catch (err) {
          reject(new Error(`Failed to parse Overpass response: ${(err as Error).message}`));
        }
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Overpass timeout')); });
    req.write(postData);
    req.end();
  });
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Assign Subcategories to OSM Businesses      ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Dry run: ${dryRun}`);
  console.log('');

  // ── 1. Load existing categories + subcategories from Firestore ────────
  console.log('1. Loading categories from Firestore...');
  const catSnap = await db.collection('categories').get();
  const existingSubcats: Record<string, Set<string>> = {}; // categoryId → set of subcategory names
  const categoryNames: Record<string, string> = {};

  for (const doc of catSnap.docs) {
    const data = doc.data();
    categoryNames[doc.id] = data.name || doc.id;
    existingSubcats[doc.id] = new Set<string>();
    const subs = data.subcategories || [];
    for (const sub of subs) {
      if (!sub.isDeleted) {
        existingSubcats[doc.id].add(sub.name);
      }
    }
    console.log(`   ${data.name}: ${existingSubcats[doc.id].size} subcategories → [${[...existingSubcats[doc.id]].join(', ')}]`);
  }
  console.log('');

  // ── 2. Re-download OSM data to get original tags ──────────────────────
  console.log('2. Downloading OSM data to get original tags...');
  const overpassQuery = `
[out:json][timeout:300];
area["ISO3166-1"="TN"]->.searchArea;
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

  const osmData = await queryOverpass(overpassQuery);
  const elements = osmData.elements.filter((el) => el.tags?.name);
  console.log(`   Found ${elements.length} elements from OSM`);

  // Build lookup: osm_id → tags
  const osmTagsMap = new Map<string, Record<string, string>>();
  for (const el of elements) {
    const osmId = `${el.type}/${el.id}`;
    osmTagsMap.set(osmId, el.tags || {});
  }
  console.log('');

  // ── 3. Load all OSM businesses from Firestore ─────────────────────────
  console.log('3. Loading OSM businesses from Firestore...');
  const bizSnap = await db.collection('businesses').where('source', '==', 'osm').get();
  console.log(`   Found ${bizSnap.size} OSM businesses in Firestore`);
  console.log('');

  // ── 4. Assign subcategories ───────────────────────────────────────────
  console.log('4. Assigning subcategories...');

  const missingSubcats: Record<string, Set<string>> = {}; // categoryId → subcategories to add
  const stats = {
    assigned: 0,
    assignedOther: 0,
    alreadyHas: 0,
    total: 0,
  };
  const assignmentCounts: Record<string, number> = {}; // "categoryId:subcategory" → count

  let batchCount = 0;
  let batch = db.batch();

  for (const doc of bizSnap.docs) {
    stats.total++;
    const data = doc.data();
    const categoryId = data.category_id;
    const osmId = data.osm_id;
    const name = (data.name || '').toLowerCase();

    // Skip if already has subcategories
    if (data.sub_categories && data.sub_categories.length > 0) {
      stats.alreadyHas++;
      continue;
    }

    // Get the original OSM tags
    const osmTags = osmId ? osmTagsMap.get(osmId) : undefined;
    const osmAmenity = osmTags?.amenity || '';
    const osmShop = osmTags?.shop || '';
    const osmTourism = osmTags?.tourism || '';
    const osmLeisure = osmTags?.leisure || '';
    const osmCuisine = (osmTags?.cuisine || '').toLowerCase();
    const allOsmTags = [osmAmenity, osmShop, osmTourism, osmLeisure].filter(Boolean);

    // Find matching subcategory
    let matched: string | null = null;

    // Try rules for this category
    const categoryRules = SUBCAT_RULES.filter((r) => r.categoryId === categoryId);
    for (const rule of categoryRules) {
      // Check OSM tag match
      if (rule.osmTags && allOsmTags.some((t) => rule.osmTags!.includes(t))) {
        matched = rule.subcategory;
        break;
      }
      // Check cuisine tag match
      if (rule.cuisineTags && rule.cuisineTags.some((c) => osmCuisine.includes(c))) {
        matched = rule.subcategory;
        break;
      }
      // Check name keyword match
      if (rule.nameKeywords && rule.nameKeywords.some((kw) => name.includes(kw.toLowerCase()))) {
        matched = rule.subcategory;
        break;
      }
    }

    // Smart defaults per category instead of generic "Other"
    const CATEGORY_DEFAULTS: Record<string, string> = {
      coffee_shop: 'Café',        // Most unmatched coffee shops are just cafés
      restaurant: 'Other',        // Can't guess cuisine without data
      hebergement: 'Hotel',       // Most unmatched accommodations are hotels
      bank: 'Bank',               // Most unmatched banks are banks
      doctor: 'General Practitioner',
    };
    const subcategory = matched || CATEGORY_DEFAULTS[categoryId] || 'Other';

    // Track assignment
    const key = `${categoryId}:${subcategory}`;
    assignmentCounts[key] = (assignmentCounts[key] || 0) + 1;

    // Check if this subcategory exists in Firestore
    const catSubs = existingSubcats[categoryId];
    if (catSubs && !catSubs.has(subcategory)) {
      if (!missingSubcats[categoryId]) missingSubcats[categoryId] = new Set();
      missingSubcats[categoryId].add(subcategory);
    }

    if (matched) {
      stats.assigned++;
    } else {
      stats.assignedOther++;
    }

    // Update Firestore
    if (!dryRun) {
      batch.update(doc.ref, {
        sub_categories: [subcategory],
        updated_at: adminPkg.firestore.FieldValue.serverTimestamp(),
      });
      batchCount++;

      if (batchCount >= 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (stats.total % 500 === 0) {
      process.stdout.write(`\r  Processed ${stats.total}/${bizSnap.size}...`);
    }
  }

  // Commit remaining
  if (batchCount > 0 && !dryRun) {
    await batch.commit();
  }

  console.log(`\r  Processed ${stats.total}/${bizSnap.size}     `);
  console.log('');

  // ── 5. Auto-add missing subcategories to Firestore categories ──────────
  if (!dryRun && Object.keys(missingSubcats).length > 0) {
    console.log('5. Adding missing subcategories to Firestore categories...');
    for (const [catId, subs] of Object.entries(missingSubcats)) {
      const catRef = db.collection('categories').doc(catId);
      const catDoc = await catRef.get();
      if (!catDoc.exists) {
        console.log(`   ⚠️  Category "${catId}" not found in Firestore, skipping`);
        continue;
      }
      const catData = catDoc.data()!;
      const existingSubs: Array<{ id: string; name: string; categoryId: string; isDeleted: boolean }> = catData.subcategories || [];

      const newSubs = [...subs]
        .filter((subName) => !existingSubs.some((s) => s.name === subName))
        .map((subName) => ({
          id: `${catId}_${subName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          name: subName,
          categoryId: catId,
          isDeleted: false,
        }));

      if (newSubs.length > 0) {
        await catRef.update({
          subcategories: [...existingSubs, ...newSubs],
        });
        console.log(`   ✓ ${categoryNames[catId]}: added ${newSubs.length} subcategories`);
      }
    }
    console.log('');
  }

  // ── 6. Report ─────────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║              Results                         ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Total businesses:        ${stats.total}`);
  console.log(`  Assigned subcategory:    ${stats.assigned}`);
  console.log(`  Assigned "Other":        ${stats.assignedOther}`);
  console.log(`  Already had subcategory: ${stats.alreadyHas}`);
  console.log('');

  // Show assignments per subcategory
  console.log('── Subcategory Distribution ──────────────────────');
  const sortedAssignments = Object.entries(assignmentCounts)
    .sort((a, b) => b[1] - a[1]);
  for (const [key, count] of sortedAssignments) {
    const [catId, subName] = key.split(':');
    const catLabel = categoryNames[catId] || catId;
    const exists = existingSubcats[catId]?.has(subName) ? '✓' : '✗ NEW';
    console.log(`  ${catLabel} → ${subName}: ${count} businesses  [${exists}]`);
  }
  console.log('');

  // Show what needs to be added
  const hasNewSubs = Object.keys(missingSubcats).length > 0;
  if (hasNewSubs) {
    console.log('── Subcategories You Need to Add ─────────────────');
    for (const [catId, subs] of Object.entries(missingSubcats)) {
      const catLabel = categoryNames[catId] || catId;
      console.log(`\n  📂 ${catLabel}:`);
      for (const sub of [...subs].sort()) {
        const count = assignmentCounts[`${catId}:${sub}`] || 0;
        console.log(`     + ${sub} (${count} businesses)`);
      }
    }
  } else {
    console.log('  All assigned subcategories already exist in your app!');
  }

  console.log('');
  if (dryRun) {
    console.log('  ⚠️  DRY RUN — no changes were made. Remove --dry-run to apply.');
  } else {
    console.log('  ✅ All businesses updated!');
  }
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
