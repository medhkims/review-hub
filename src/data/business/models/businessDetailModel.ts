import { Timestamp } from 'firebase/firestore';

export interface MenuItemModel {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  price: number;
  currency: string;
}

export interface MenuCategoryModel {
  id: string;
  name: string;
  items: MenuItemModel[];
}

export interface DeliveryServiceModel {
  id: string;
  name: string;
  abbreviation: string;
  is_active: boolean;
  url: string | null;
}

export interface CategoryRatingModel {
  name: string;
  icon: string;
  rating: number;
}

export interface RatingDistributionModel {
  stars: number;
  percentage: number;
}

export interface ContactInfoModel {
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram_handle: string | null;
  facebook_name: string | null;
  tiktok_handle: string | null;
}

export interface BusinessDetailModel {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  logo_url: string | null;
  is_open: boolean;
  rating: number;
  review_count: number;
  owner_id: string;
  contact: ContactInfoModel;
  category_ratings: CategoryRatingModel[];
  rating_distribution: RatingDistributionModel[];
  menu_categories: MenuCategoryModel[];
  delivery_services: DeliveryServiceModel[];
  created_at: Timestamp;
  updated_at: Timestamp;
}
