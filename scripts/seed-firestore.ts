/**
 * Firestore Seed Script
 *
 * Seeds the Firestore database with the canonical categories (incl. subcategories
 * and rating criteria) and sample businesses.
 *
 * Usage:
 *   npx ts-node scripts/seed-firestore.ts
 *
 * Or via Firebase emulator:
 *   Set FIRESTORE_EMULATOR_HOST=localhost:8080 before running
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { CATEGORIES_DATA } from '../src/core/constants/categoriesData';

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

// ── Sample Businesses ───────────────────────────────────────────────────────

const BUSINESSES = [
  {
    id: 'restaurant_el_ali',
    name: 'Restaurant El Ali',
    description: 'Traditional Tunisian cuisine in the heart of the Medina. Savoury couscous, slow-cooked lamb tagines and house-made brik make this a local favourite for generations.',
    category_id: 'restaurant',
    category_name: 'Restaurant',
    subcategory_id: 'tunisian',
    subcategory_name: 'Tunisian',
    location: 'Medina, Tunis',
    latitude: 36.7992,
    longitude: 10.1685,
    cover_image_url: 'https://picsum.photos/seed/elali-cover/800/400',
    logo_url: 'https://picsum.photos/seed/elali-logo/200/200',
    rating: 4.5,
    review_count: 535,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: {
      phone: '+216 71 000 001',
      email: 'info@elali.tn',
      website: 'https://elali.tn',
      instagram_handle: null,
      facebook_name: 'RestaurantElAli',
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [
      { id: 'starters', name: 'Starters & Brik', items: [] },
      { id: 'soups', name: 'Soups', items: [] },
      { id: 'couscous', name: 'Couscous', items: [] },
      { id: 'tagines', name: 'Tagines', items: [] },
      { id: 'desserts', name: 'Desserts', items: [] },
    ],
    rating_distribution: [
      { stars: 5, percentage: 52 },
      { stars: 4, percentage: 28 },
      { stars: 3, percentage: 11 },
      { stars: 2, percentage: 6 },
      { stars: 1, percentage: 3 },
    ],
    category_ratings: [
      { name: 'Service', icon: 'shield-account', rating: 4.5 },
      { name: 'Food Quality', icon: 'silverware-fork-knife', rating: 4.6 },
      { name: 'Cleanliness', icon: 'broom', rating: 4.3 },
    ],
  },
  {
    id: 'le_golfe',
    name: 'Le Golfe',
    description: 'Premium seafood restaurant with Mediterranean views. Fresh fish, grilled lobster and a fine wine selection make Le Golfe the destination for special occasions by the sea.',
    category_id: 'restaurant',
    category_name: 'Restaurant',
    subcategory_id: 'french',
    subcategory_name: 'French',
    location: 'La Marsa, Tunis',
    latitude: 36.8784,
    longitude: 10.3234,
    cover_image_url: 'https://picsum.photos/seed/legolfe-cover/800/400',
    logo_url: 'https://picsum.photos/seed/legolfe-logo/200/200',
    rating: 4.3,
    review_count: 310,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: {
      phone: '+216 71 000 002',
      email: 'contact@legolfe.tn',
      website: null,
      instagram_handle: 'legolfe_tn',
      facebook_name: null,
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [
      { id: 'starters', name: 'Starters', items: [] },
      { id: 'seafood', name: 'Seafood', items: [] },
      { id: 'grills', name: 'Grills', items: [] },
      { id: 'desserts', name: 'Desserts', items: [] },
      { id: 'wines', name: 'Wines & Beverages', items: [] },
    ],
    rating_distribution: [
      { stars: 5, percentage: 48 },
      { stars: 4, percentage: 32 },
      { stars: 3, percentage: 13 },
      { stars: 2, percentage: 5 },
      { stars: 1, percentage: 2 },
    ],
    category_ratings: [
      { name: 'Service', icon: 'shield-account', rating: 4.3 },
      { name: 'Food Quality', icon: 'silverware-fork-knife', rating: 4.4 },
      { name: 'Cleanliness', icon: 'broom', rating: 4.2 },
    ],
  },
  {
    id: 'dar_el_jeld',
    name: 'Dar El Jeld',
    description: 'Fine dining in a restored 18th-century palace. Dar El Jeld offers an unmatched combination of authentic Tunisian haute cuisine and breathtaking Andalusian courtyard ambiance.',
    category_id: 'restaurant',
    category_name: 'Restaurant',
    subcategory_id: 'tunisian',
    subcategory_name: 'Tunisian',
    location: 'Medina, Tunis',
    latitude: 36.7981,
    longitude: 10.1695,
    cover_image_url: 'https://picsum.photos/seed/dareljeld-cover/800/400',
    logo_url: 'https://picsum.photos/seed/dareljeld-logo/200/200',
    rating: 4.7,
    review_count: 620,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: {
      phone: '+216 71 000 003',
      email: 'reservations@dareljeld.tn',
      website: null,
      instagram_handle: 'dareljeld',
      facebook_name: 'DarElJeld',
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [
      { id: 'starters', name: 'Starters & Salads', items: [] },
      { id: 'soups', name: 'Soups', items: [] },
      { id: 'couscous', name: 'Couscous', items: [] },
      { id: 'tagines', name: 'Tagines', items: [] },
      { id: 'grills', name: 'Grills', items: [] },
      { id: 'desserts', name: 'Desserts', items: [] },
    ],
    rating_distribution: [
      { stars: 5, percentage: 62 },
      { stars: 4, percentage: 24 },
      { stars: 3, percentage: 8 },
      { stars: 2, percentage: 4 },
      { stars: 1, percentage: 2 },
    ],
    category_ratings: [
      { name: 'Service', icon: 'shield-account', rating: 4.6 },
      { name: 'Food Quality', icon: 'silverware-fork-knife', rating: 4.8 },
      { name: 'Cleanliness', icon: 'broom', rating: 4.7 },
    ],
  },
  {
    id: 'fit_zone',
    name: 'Fit Zone',
    description: 'Modern gym with state-of-the-art equipment, professional trainers and a full range of classes including HIIT, yoga, and spin. Open 7 days a week.',
    category_id: 'gym',
    category_name: 'Gym',
    subcategory_id: 'fitness_gym',
    subcategory_name: 'Fitness Gym',
    location: 'Lac 2, Tunis',
    latitude: 36.8390,
    longitude: 10.2306,
    cover_image_url: 'https://picsum.photos/seed/fitzone-cover/800/400',
    logo_url: 'https://picsum.photos/seed/fitzone-logo/200/200',
    rating: 4.2,
    review_count: 180,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: {
      phone: '+216 71 000 004',
      email: 'hello@fitzone.tn',
      website: null,
      instagram_handle: 'fitzone_tn',
      facebook_name: 'FitZoneTunis',
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 44 },
      { stars: 4, percentage: 33 },
      { stars: 3, percentage: 14 },
      { stars: 2, percentage: 6 },
      { stars: 1, percentage: 3 },
    ],
    category_ratings: [
      { name: 'Service', icon: 'shield-account', rating: 4.2 },
      { name: 'Equipment Quality', icon: 'dumbbell', rating: 4.3 },
      { name: 'Cleanliness', icon: 'broom', rating: 4.1 },
    ],
  },
  {
    id: 'cafe_des_nattes',
    name: 'Café des Nattes',
    description: 'The most iconic café in Sidi Bou Said, perched above the village square since the 19th century. Sip mint tea and smoke a chicha while enjoying the timeless blue-and-white view.',
    category_id: 'coffee_shop',
    category_name: 'Coffee Shop',
    subcategory_id: null,
    subcategory_name: null,
    location: 'Sidi Bou Said, Tunis',
    latitude: 36.8695,
    longitude: 10.3416,
    cover_image_url: 'https://picsum.photos/seed/cafedesnattes-cover/800/400',
    logo_url: 'https://picsum.photos/seed/cafedesnattes-logo/200/200',
    rating: 4.6,
    review_count: 890,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: {
      phone: '+216 71 000 005',
      email: null,
      website: null,
      instagram_handle: null,
      facebook_name: 'CafeDesNattes',
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [
      { id: 'hot_drinks', name: 'Hot Drinks', items: [] },
      { id: 'cold_drinks', name: 'Cold Drinks', items: [] },
      { id: 'pastries', name: 'Pastries & Sweets', items: [] },
    ],
    rating_distribution: [
      { stars: 5, percentage: 56 },
      { stars: 4, percentage: 28 },
      { stars: 3, percentage: 9 },
      { stars: 2, percentage: 5 },
      { stars: 1, percentage: 2 },
    ],
    category_ratings: [
      { name: 'Service', icon: 'shield-account', rating: 4.4 },
      { name: 'Product Quality', icon: 'star-check', rating: 4.7 },
      { name: 'Cleanliness', icon: 'broom', rating: 4.6 },
    ],
  },
  {
    id: 'restaurant_dar_zarrouk',
    name: 'Dar Zarrouk',
    description: 'An iconic fine-dining Tunisian restaurant perched on the cliffside of Sidi Bou Said, offering breathtaking sea views and an extensive menu of authentic Tunisian dishes — from smoky brik pastries and spiced merguez to slow-cooked lamb tagine and traditional couscous.',
    category_id: 'restaurant',
    category_name: 'Restaurant',
    subcategory_id: 'tunisian',
    subcategory_name: 'Tunisian',
    location: 'Sidi Bou Said, Tunis',
    latitude: 36.8703,
    longitude: 10.3421,
    cover_image_url: 'https://picsum.photos/seed/darzarrouk-cover/800/400',
    logo_url: 'https://picsum.photos/seed/darzarrouk-logo/200/200',
    rating: 4.6,
    review_count: 748,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: {
      phone: '+216 71 740 591',
      email: 'reservations@darzarrouk.tn',
      website: 'https://darzarrouk.tn',
      instagram_handle: 'darzarrouk',
      facebook_name: 'DarZarrouk',
      tiktok_handle: null,
    },
    delivery_services: [
      { id: 'glovo', name: 'Glovo', abbreviation: 'GLV', is_active: true, url: 'https://glovoapp.com' },
      { id: 'jumia_food', name: 'Jumia Food', abbreviation: 'JMF', is_active: true, url: null },
    ],
    menu_categories: [
      { id: 'starters', name: 'Starters & Brik', items: [] },
      { id: 'soups', name: 'Soups', items: [] },
      { id: 'salads', name: 'Salads', items: [] },
      { id: 'couscous', name: 'Couscous', items: [] },
      { id: 'tagines', name: 'Tagines', items: [] },
      { id: 'grills', name: 'Grills & Mechoui', items: [] },
      { id: 'seafood', name: 'Seafood', items: [] },
      { id: 'desserts', name: 'Desserts', items: [] },
      { id: 'beverages', name: 'Beverages', items: [] },
    ],
    rating_distribution: [
      { stars: 5, percentage: 56 },
      { stars: 4, percentage: 28 },
      { stars: 3, percentage: 10 },
      { stars: 2, percentage: 4 },
      { stars: 1, percentage: 2 },
    ],
    category_ratings: [
      { name: 'Service', icon: 'shield-account', rating: 4.5 },
      { name: 'Food Quality', icon: 'silverware-fork-knife', rating: 4.7 },
      { name: 'Cleanliness', icon: 'broom', rating: 4.6 },
    ],
  },
  {
    id: 'hotel_the_residence',
    name: 'The Residence Tunis',
    description: 'Luxury beachfront resort in Gammarth offering world-class spa, four restaurants, a private beach and panoramic views of the Mediterranean. A five-star retreat steps from the capital.',
    category_id: 'hebergement',
    category_name: 'Hebergement',
    subcategory_id: 'hotel',
    subcategory_name: 'Hotel',
    location: 'Gammarth, Tunis',
    latitude: 36.9118,
    longitude: 10.2923,
    cover_image_url: 'https://picsum.photos/seed/theresidence-cover/800/400',
    logo_url: 'https://picsum.photos/seed/theresidence-logo/200/200',
    rating: 4.8,
    review_count: 1250,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: {
      phone: '+216 71 000 006',
      email: 'info@theresidence.tn',
      website: 'https://theresidence.tn',
      instagram_handle: 'theresidencetunis',
      facebook_name: 'TheResidenceTunis',
      tiktok_handle: null,
    },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: [
      { stars: 5, percentage: 64 },
      { stars: 4, percentage: 24 },
      { stars: 3, percentage: 8 },
      { stars: 2, percentage: 2 },
      { stars: 1, percentage: 2 },
    ],
    category_ratings: [
      { name: 'Service', icon: 'shield-account', rating: 4.7 },
      { name: 'Location', icon: 'map-marker', rating: 4.9 },
      { name: 'Cleanliness', icon: 'broom', rating: 4.8 },
    ],
  },
];

// ── Seed Functions ──────────────────────────────────────────────────────────

async function seedCategories() {
  console.log('Seeding categories...');
  for (const cat of CATEGORIES_DATA) {
    const { id, subcategories, ratingCriteria, ...rest } = cat;

    // Write category document
    await setDoc(doc(db, 'categories', id), {
      ...rest,
      subcategories: subcategories.map((s) => ({ id: s.id, name: s.name, category_id: id })),
      rating_criteria: ratingCriteria.map((r) => ({ key: r.key, label: r.label, icon: r.icon })),
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Write each subcategory as its own document for easy querying
    for (const sub of subcategories) {
      await setDoc(doc(db, 'categories', id, 'subcategories', sub.id), {
        name: sub.name,
        category_id: id,
        created_at: serverTimestamp(),
      });
    }

    console.log(`  + Category: ${cat.name} (${subcategories.length} subcategories, ${ratingCriteria.length} criteria)`);
  }
  console.log(`Seeded ${CATEGORIES_DATA.length} categories.`);
}

async function seedBusinesses() {
  console.log('Seeding businesses...');
  for (const biz of BUSINESSES) {
    const { id, ...data } = biz;
    await setDoc(doc(db, 'businesses', id), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    console.log(`  + Business: ${biz.name}`);
  }
  console.log(`Seeded ${BUSINESSES.length} businesses.`);
}

async function main() {
  console.log('=== Firestore Seed Script ===');
  console.log(`Project: ${firebaseConfig.projectId}`);
  console.log('');

  try {
    await seedCategories();
    console.log('');
    await seedBusinesses();
    console.log('');
    console.log('Seed complete!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
