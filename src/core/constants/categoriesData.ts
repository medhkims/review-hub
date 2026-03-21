/**
 * Canonical category / subcategory / rating-criteria definitions.
 *
 * This is the single source of truth for the three-level hierarchy:
 *   Category → Subcategory → Rating Criteria
 *
 * Used by:
 *  - The Firestore seed script  (scripts/seed-firestore.ts)
 *  - WriteReviewScreen          (dynamic rating criteria per category)
 *  - Company sign-up step 1     (category + subcategory pickers)
 */

export interface RatingCriterionDef {
  key: string;
  label: string;
  icon: string;
}

export interface SubcategoryDef {
  id: string;
  name: string;
}

export interface CategoryDef {
  id: string;
  name: string;
  /** Material Community Icons name */
  icon: string;
  sortOrder: number;
  subcategories: SubcategoryDef[];
  ratingCriteria: RatingCriterionDef[];
}

export const CATEGORIES_DATA: CategoryDef[] = [
  // ── 1. Restaurant ──────────────────────────────────────────────────────────
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: 'silverware-fork-knife',
    sortOrder: 1,
    subcategories: [
      { id: 'tunisian', name: 'Tunisian' },
      { id: 'french', name: 'French' },
      { id: 'italian', name: 'Italian' },
      { id: 'mexican', name: 'Mexican' },
      { id: 'indian', name: 'Indian' },
      { id: 'syrian', name: 'Syrian' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'service', label: 'Service', icon: 'shield-account' },
      { key: 'food_quality', label: 'Food Quality', icon: 'silverware-fork-knife' },
      { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' },
    ],
  },

  // ── 2. Gym ─────────────────────────────────────────────────────────────────
  {
    id: 'gym',
    name: 'Gym',
    icon: 'dumbbell',
    sortOrder: 2,
    subcategories: [
      { id: 'fitness_gym', name: 'Fitness Gym' },
      { id: 'women_only_gym', name: 'Women Only Gym' },
      { id: 'personal_training', name: 'Personal Training' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'service', label: 'Service', icon: 'shield-account' },
      { key: 'equipment_quality', label: 'Equipment Quality', icon: 'dumbbell' },
      { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' },
    ],
  },

  // ── 3. Coffee Shop ─────────────────────────────────────────────────────────
  {
    id: 'coffee_shop',
    name: 'Coffee Shop',
    icon: 'coffee',
    sortOrder: 3,
    subcategories: [],
    ratingCriteria: [
      { key: 'service', label: 'Service', icon: 'shield-account' },
      { key: 'product_quality', label: 'Product Quality', icon: 'star-check' },
      { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' },
    ],
  },

  // ── 4. Medical ─────────────────────────────────────────────────────────────
  {
    id: 'medical',
    name: 'Medical',
    icon: 'hospital-box',
    sortOrder: 4,
    subcategories: [
      { id: 'hospital', name: 'Hospital' },
      { id: 'clinic', name: 'Clinic' },
      { id: 'pharmacy', name: 'Pharmacy' },
      { id: 'parapharmacy', name: 'Parapharmacy' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'service', label: 'Service', icon: 'shield-account' },
      { key: 'waiting_time', label: 'Waiting Time', icon: 'clock-outline' },
    ],
  },

  // ── 5. Doctor ──────────────────────────────────────────────────────────────
  {
    id: 'doctor',
    name: 'Doctor',
    icon: 'doctor',
    sortOrder: 5,
    subcategories: [
      { id: 'internal_medicine', name: 'Internal Medicine' },
      { id: 'family_medicine', name: 'Family Medicine' },
      { id: 'pediatrics', name: 'Pediatrics' },
      { id: 'general_surgery', name: 'General Surgery' },
      { id: 'obstetrics_gynecology', name: 'Obstetrics and Gynecology' },
      { id: 'psychiatry', name: 'Psychiatry' },
      { id: 'neurology', name: 'Neurology' },
      { id: 'orthopedics', name: 'Orthopedics' },
      { id: 'dermatology', name: 'Dermatology' },
      { id: 'anesthesiology', name: 'Anesthesiology' },
      { id: 'cardiology', name: 'Cardiology' },
      { id: 'ophthalmology', name: 'Ophthalmology' },
      { id: 'otolaryngology', name: 'Otolaryngology (ENT)' },
      { id: 'urology', name: 'Urology' },
      { id: 'radiology', name: 'Radiology' },
      { id: 'oncology', name: 'Oncology' },
      { id: 'endocrinology', name: 'Endocrinology' },
      { id: 'gastroenterology', name: 'Gastroenterology' },
      { id: 'pulmonology', name: 'Pulmonology' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'communication', label: 'Communication', icon: 'message-text' },
      { key: 'professionalism', label: 'Professionalism', icon: 'certificate' },
      { key: 'punctuality', label: 'Punctuality', icon: 'clock-check' },
    ],
  },

  // ── 6. Hebergement ─────────────────────────────────────────────────────────
  {
    id: 'hebergement',
    name: 'Hebergement',
    icon: 'bed',
    sortOrder: 6,
    subcategories: [
      { id: 'hotel', name: 'Hotel' },
      { id: 'house', name: 'House' },
      { id: 'guest_house', name: 'Guest House' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'service', label: 'Service', icon: 'shield-account' },
      { key: 'location', label: 'Location', icon: 'map-marker' },
      { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' },
    ],
  },

  // ── 7. Education ───────────────────────────────────────────────────────────
  {
    id: 'education',
    name: 'Education',
    icon: 'school',
    sortOrder: 7,
    subcategories: [
      { id: 'kindergarten', name: 'Kindergarten' },
      { id: 'school', name: 'School' },
      { id: 'middle_school', name: 'Middle School' },
      { id: 'high_school', name: 'High School' },
      { id: 'university', name: 'University' },
      { id: 'training_center', name: 'Training Center' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'service', label: 'Service', icon: 'shield-account' },
      { key: 'education_quality', label: 'Education Quality', icon: 'book-open-variant' },
    ],
  },

  // ── 8. Shopping ────────────────────────────────────────────────────────────
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'shopping',
    sortOrder: 8,
    subcategories: [
      { id: 'accessories', name: 'Accessories' },
      { id: 'clothing', name: 'Clothing' },
      { id: 'decoration', name: 'Decoration' },
      { id: 'furniture', name: 'Furniture' },
      { id: 'cars', name: 'Cars' },
      { id: 'jewelry', name: 'Jewelry' },
      { id: 'electronics', name: 'Electronics' },
      { id: 'mall', name: 'Mall' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'service', label: 'Service', icon: 'shield-account' },
      { key: 'product_quality', label: 'Product Quality', icon: 'star-check' },
    ],
  },

  // ── 9. Car Rental ──────────────────────────────────────────────────────────
  {
    id: 'car_rental',
    name: 'Car Rental',
    icon: 'car-key',
    sortOrder: 9,
    subcategories: [],
    ratingCriteria: [
      { key: 'service', label: 'Service', icon: 'shield-account' },
      { key: 'vehicle_condition', label: 'Vehicle Condition', icon: 'car-cog' },
      { key: 'pricing_transparency', label: 'Pricing Transparency', icon: 'tag' },
    ],
  },

  // ── 10. Bank ───────────────────────────────────────────────────────────────
  {
    id: 'bank',
    name: 'Bank',
    icon: 'bank',
    sortOrder: 10,
    subcategories: [],
    ratingCriteria: [
      { key: 'service', label: 'Service', icon: 'shield-account' },
      { key: 'speed', label: 'Speed', icon: 'lightning-bolt' },
      { key: 'transparency', label: 'Transparency', icon: 'eye' },
    ],
  },

  // ── 11. Job / Freelancer ───────────────────────────────────────────────────
  {
    id: 'job_freelancer',
    name: 'Job / Freelancer',
    icon: 'briefcase-account',
    sortOrder: 11,
    subcategories: [
      { id: 'developer', name: 'Developer' },
      { id: 'social_media_manager', name: 'Social Media Manager' },
      { id: 'mechanic', name: 'Mechanic' },
      { id: 'engineer', name: 'Engineer' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'punctuality', label: 'Punctuality', icon: 'clock-check' },
      { key: 'competence', label: 'Competence', icon: 'brain' },
      { key: 'professionalism', label: 'Professionalism', icon: 'certificate' },
    ],
  },

  // ── 12. Tradesman ──────────────────────────────────────────────────────────
  {
    id: 'tradesman',
    name: 'Tradesman',
    icon: 'hammer-wrench',
    sortOrder: 12,
    subcategories: [
      { id: 'plumber', name: 'Plumber' },
      { id: 'electrician', name: 'Electrician' },
      { id: 'carpenter', name: 'Carpenter' },
      { id: 'painter', name: 'Painter' },
      { id: 'bricklayer', name: 'Bricklayer' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'punctuality', label: 'Punctuality', icon: 'clock-check' },
      { key: 'competence', label: 'Competence', icon: 'brain' },
      { key: 'professionalism', label: 'Professionalism', icon: 'certificate' },
    ],
  },

  // ── 13. Delivery Company ───────────────────────────────────────────────────
  {
    id: 'delivery_company',
    name: 'Delivery Company',
    icon: 'truck-delivery',
    sortOrder: 13,
    subcategories: [
      { id: 'food_delivery', name: 'Food Delivery' },
      { id: 'parcel_delivery', name: 'Parcel Delivery' },
      { id: 'international_shipping', name: 'International Shipping' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'service', label: 'Service', icon: 'shield-account' },
      { key: 'promptness', label: 'Promptness', icon: 'timer' },
    ],
  },

  // ── 14. Influencer ─────────────────────────────────────────────────────────
  {
    id: 'influencer',
    name: 'Influencer',
    icon: 'account-star',
    sortOrder: 14,
    subcategories: [
      { id: 'fashion_beauty', name: 'Fashion & Beauty' },
      { id: 'food_lifestyle', name: 'Food & Lifestyle' },
      { id: 'tech_gaming', name: 'Tech & Gaming' },
      { id: 'fitness_health', name: 'Fitness & Health' },
      { id: 'travel', name: 'Travel' },
      { id: 'comedy_entertainment', name: 'Comedy & Entertainment' },
      { id: 'education', name: 'Education & Tips' },
      { id: 'business_finance', name: 'Business & Finance' },
      { id: 'other', name: 'Other' },
    ],
    ratingCriteria: [
      { key: 'content_quality', label: 'Content Quality', icon: 'video-check' },
      { key: 'authenticity', label: 'Authenticity', icon: 'shield-check' },
      { key: 'engagement', label: 'Engagement', icon: 'heart-multiple' },
    ],
  },

  // ── 15. Other ──────────────────────────────────────────────────────────────
  // Businesses in this category receive a single general 1–5 star rating
  // instead of per-criterion sub-ratings.
  {
    id: 'other',
    name: 'Other',
    icon: 'dots-horizontal-circle-outline',
    sortOrder: 15,
    subcategories: [],
    ratingCriteria: [], // intentionally empty → triggers general rating mode
  },
];

/** Lookup helper — O(1) by category id */
export const CATEGORY_MAP: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES_DATA.map((c) => [c.id, c]),
);
