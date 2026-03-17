export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;  // "09:00"
  closeTime: string; // "18:00"
}

export type OpeningHours = Record<DayKey, DaySchedule>;

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  currency: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  imageUrl: string | null;
  items: MenuItem[];
}

export interface DeliveryService {
  id: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
  url: string | null;
  phone: string | null;
}

export interface CategoryRating {
  name: string;
  icon: string;
  rating: number;
}

export interface RatingDistribution {
  stars: number;
  percentage: number;
}

export interface ContactInfo {
  phone: string | null;
  phoneVerified: boolean;
  email: string | null;
  website: string | null;
  instagramHandle: string | null;
  facebookName: string | null;
  tiktokHandle: string | null;
}

import type { BusinessStatus } from './businessEntity';

export interface BusinessDetailEntity {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  subCategories?: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  isOpen: boolean;
  isOnline: boolean;
  rating: number;
  reviewCount: number;
  isFavorite: boolean;
  ownerId: string;
  status: BusinessStatus;
  isOwnerVerified: boolean;
  contact: ContactInfo;
  categoryRatings: CategoryRating[];
  ratingDistribution: RatingDistribution[];
  menuCategories: MenuCategory[];
  deliveryServices: DeliveryService[];
  openingHours?: OpeningHours;
  openingHoursVisible?: boolean;
  suspensionCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
