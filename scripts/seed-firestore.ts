/**
 * Firestore Seed Script
 *
 * Seeds the Firestore database with initial categories and sample businesses.
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
  Timestamp,
} from 'firebase/firestore';

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

// ── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'restaurants', name: 'Restaurants', icon: 'silverware-fork-knife', sort_order: 1 },
  { id: 'gyms', name: 'Gyms', icon: 'dumbbell', sort_order: 2 },
  { id: 'coffeeshops', name: 'Coffeeshops', icon: 'coffee', sort_order: 3 },
  { id: 'beauty_spa', name: 'Beauty & Spa', icon: 'spa', sort_order: 4 },
  { id: 'automotive', name: 'Automotive', icon: 'car', sort_order: 5 },
  { id: 'electronics', name: 'Electronics', icon: 'laptop', sort_order: 6 },
  { id: 'hotels', name: 'Hotels', icon: 'bed', sort_order: 7 },
  { id: 'entertainment', name: 'Entertainment', icon: 'party-popper', sort_order: 8 },
  { id: 'pharmacy', name: 'Pharmacy', icon: 'pill', sort_order: 9 },
  { id: 'real_estate', name: 'Real Estate', icon: 'home-city', sort_order: 10 },
  { id: 'education', name: 'Education', icon: 'school', sort_order: 11 },
  { id: 'legal', name: 'Legal', icon: 'gavel', sort_order: 12 },
  { id: 'fashion', name: 'Fashion', icon: 'hanger', sort_order: 13 },
];

// ── Sample Businesses ───────────────────────────────────────────────────────

const BUSINESSES = [
  {
    id: 'restaurant_el_ali',
    name: 'Restaurant El Ali',
    description: 'Traditional Tunisian cuisine in the heart of the Medina.',
    category_id: 'restaurants',
    category_name: 'Restaurants',
    location: 'Medina, Tunis',
    cover_image_url: null,
    logo_url: null,
    rating: 4.5,
    review_count: 535,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: { phone: '+216 71 000 001', email: 'info@elali.tn', website: 'https://elali.tn' },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: { '5': 280, '4': 150, '3': 60, '2': 30, '1': 15 },
    category_ratings: { cooking: 4.6, cleanliness: 4.3, service: 4.5 },
  },
  {
    id: 'le_golfe',
    name: 'Le Golfe',
    description: 'Premium seafood restaurant with Mediterranean views.',
    category_id: 'restaurants',
    category_name: 'Restaurants',
    location: 'La Marsa, Tunis',
    cover_image_url: null,
    logo_url: null,
    rating: 4.3,
    review_count: 310,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: { phone: '+216 71 000 002', email: 'contact@legolfe.tn' },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: { '5': 150, '4': 100, '3': 40, '2': 15, '1': 5 },
    category_ratings: { cooking: 4.4, cleanliness: 4.2, service: 4.3 },
  },
  {
    id: 'dar_el_jeld',
    name: 'Dar El Jeld',
    description: 'Fine dining in a historic palace setting.',
    category_id: 'restaurants',
    category_name: 'Restaurants',
    location: 'Medina, Tunis',
    cover_image_url: null,
    logo_url: null,
    rating: 4.7,
    review_count: 620,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: { phone: '+216 71 000 003', email: 'reservations@dareljeld.tn' },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: { '5': 380, '4': 150, '3': 50, '2': 25, '1': 15 },
    category_ratings: { cooking: 4.8, cleanliness: 4.7, service: 4.6 },
  },
  {
    id: 'fit_zone',
    name: 'Fit Zone',
    description: 'Modern gym with state-of-the-art equipment.',
    category_id: 'gyms',
    category_name: 'Gyms',
    location: 'Lac 2, Tunis',
    cover_image_url: null,
    logo_url: null,
    rating: 4.2,
    review_count: 180,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: { phone: '+216 71 000 004' },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: { '5': 80, '4': 60, '3': 25, '2': 10, '1': 5 },
    category_ratings: { equipment: 4.3, cleanliness: 4.1, trainers: 4.2 },
  },
  {
    id: 'cafe_des_nattes',
    name: 'Café des Nattes',
    description: 'Historic coffeeshop in Sidi Bou Said.',
    category_id: 'coffeeshops',
    category_name: 'Coffeeshops',
    location: 'Sidi Bou Said, Tunis',
    cover_image_url: null,
    logo_url: null,
    rating: 4.6,
    review_count: 890,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: { phone: '+216 71 000 005' },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: { '5': 500, '4': 250, '3': 80, '2': 40, '1': 20 },
    category_ratings: { quality: 4.7, ambiance: 4.8, service: 4.4 },
  },
  {
    id: 'hotel_the_residence',
    name: 'The Residence Tunis',
    description: 'Luxury beachfront resort in Gammarth.',
    category_id: 'hotels',
    category_name: 'Hotels',
    location: 'Gammarth, Tunis',
    cover_image_url: null,
    logo_url: null,
    rating: 4.8,
    review_count: 1250,
    is_featured: true,
    is_open: true,
    owner_id: 'system',
    contact: { phone: '+216 71 000 006', email: 'info@theresidence.tn', website: 'https://theresidence.tn' },
    delivery_services: [],
    menu_categories: [],
    rating_distribution: { '5': 800, '4': 300, '3': 100, '2': 30, '1': 20 },
    category_ratings: { rooms: 4.9, cleanliness: 4.8, service: 4.7 },
  },
];

// ── Seed Functions ──────────────────────────────────────────────────────────

async function seedCategories() {
  console.log('Seeding categories...');
  for (const cat of CATEGORIES) {
    const { id, ...data } = cat;
    await setDoc(doc(db, 'categories', id), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    console.log(`  + Category: ${cat.name}`);
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);
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
