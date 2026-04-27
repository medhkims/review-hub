export type BusinessStatus = 'pending' | 'active' | 'rejected' | 'blocked' | 'suspended';

export interface BusinessOpeningHours {
  [day: string]: { isOpen: boolean; openTime: string; closeTime: string };
}

export interface BusinessEntity {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  subCategory?: string;
  subCategories?: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  rating: number;
  reviewCount: number;
  weeklyReviewCount: number;
  isFeatured: boolean;
  isFavorite: boolean;
  ownerId: string;
  status: BusinessStatus;
  isOwnerVerified: boolean;
  openingHours?: BusinessOpeningHours;
  openingHoursVisible?: boolean;
  platforms?: string[];
  createdAt: Date;
  updatedAt: Date;
}
