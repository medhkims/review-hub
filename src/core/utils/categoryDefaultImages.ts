/**
 * Default cover and logo images for each business category.
 *
 * HOW TO ADD IMAGES:
 * 1. Place your image at: assets/images/categories/{categoryId}_cover.jpg
 *    and:                  assets/images/categories/{categoryId}_logo.jpg
 * 2. Uncomment the matching require() line below.
 *
 * Until a category's image is added, the app shows an icon fallback — no crash.
 */

import { ImageSourcePropType } from 'react-native';

// ── Cover images ────────────────────────────────────────────────────────────
const COVER_DEFAULTS: Partial<Record<string, ImageSourcePropType>> = {
  restaurant:       require('../../../assets/images/categories/restaurant_cover.jpg'),
  gym:              require('../../../assets/images/categories/gym_cover.jpg'),
  coffee_shop:      require('../../../assets/images/categories/coffee_shop_cover.jpg'),
  medical:          require('../../../assets/images/categories/medical_cover.jpg'),
  doctor:           require('../../../assets/images/categories/doctor_cover.jpg'),
  hebergement:      require('../../../assets/images/categories/hebergement_cover.jpg'),
  education:        require('../../../assets/images/categories/education_cover.jpg'),
  shopping:         require('../../../assets/images/categories/shopping_cover.jpg'),
  car_rental:       require('../../../assets/images/categories/car_rental_cover.jpg'),
  bank:             require('../../../assets/images/categories/bank_cover.jpg'),
  job_freelancer:   require('../../../assets/images/categories/job_freelancer_cover.jpg'),
  delivery_company: require('../../../assets/images/categories/delivery_company_cover.jpg'),
  other:            require('../../../assets/images/categories/other_cover.jpg'),
};

// ── Logo / profile images ───────────────────────────────────────────────────
const LOGO_DEFAULTS: Partial<Record<string, ImageSourcePropType>> = {
  restaurant:       require('../../../assets/images/categories/restaurant_logo.jpg'),
  gym:              require('../../../assets/images/categories/gym_logo.jpg'),
  coffee_shop:      require('../../../assets/images/categories/coffee_shop_logo.jpg'),
  medical:          require('../../../assets/images/categories/medical_logo.jpg'),
  doctor:           require('../../../assets/images/categories/doctor_logo.jpg'),
  hebergement:      require('../../../assets/images/categories/hebergement_logo.jpg'),
  education:        require('../../../assets/images/categories/education_logo.jpg'),
  shopping:         require('../../../assets/images/categories/shopping_logo.jpg'),
  car_rental:       require('../../../assets/images/categories/car_rental_logo.jpg'),
  bank:             require('../../../assets/images/categories/bank_logo.jpg'),
  job_freelancer:   require('../../../assets/images/categories/job_freelancer_logo.jpg'),
  delivery_company: require('../../../assets/images/categories/delivery_company_logo.jpg'),
  other:            require('../../../assets/images/categories/other_logo.jpg'),
};

/** Returns the default cover image for a category, or null if not yet provided. */
export function getCategoryDefaultCover(categoryId: string): ImageSourcePropType | null {
  return COVER_DEFAULTS[categoryId] ?? null;
}

/** Returns the default logo image for a category, or null if not yet provided. */
export function getCategoryDefaultLogo(categoryId: string): ImageSourcePropType | null {
  return LOGO_DEFAULTS[categoryId] ?? null;
}
