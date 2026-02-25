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
  items: MenuItem[];
}

export interface DeliveryService {
  id: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
  url: string | null;
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
  email: string | null;
  website: string | null;
  instagramHandle: string | null;
  facebookName: string | null;
  tiktokHandle: string | null;
}

export interface BusinessDetailEntity {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  isFavorite: boolean;
  ownerId: string;
  contact: ContactInfo;
  categoryRatings: CategoryRating[];
  ratingDistribution: RatingDistribution[];
  menuCategories: MenuCategory[];
  deliveryServices: DeliveryService[];
  createdAt: Date;
  updatedAt: Date;
}
