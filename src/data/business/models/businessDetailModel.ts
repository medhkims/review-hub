import { Timestamp } from 'firebase/firestore';

export interface DayScheduleModel {
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export type OpeningHoursModel = Partial<Record<string, DayScheduleModel>>;

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
  image_url: string | null;
  items: MenuItemModel[];
}

export interface DeliveryServiceModel {
  id: string;
  name: string;
  abbreviation: string;
  is_active: boolean;
  url: string | null;
  phone: string | null;
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
  phone_verified?: boolean;
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
  sub_categories?: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  logo_url: string | null;
  is_open: boolean;
  is_online?: boolean;
  rating: number;
  review_count: number;
  owner_id: string;
  status?: 'pending' | 'active' | 'rejected' | 'blocked' | 'suspended';
  suspension_count?: number;
  is_verified?: boolean;
  contact: ContactInfoModel;
  category_ratings: CategoryRatingModel[];
  rating_distribution: RatingDistributionModel[];
  menu_categories: MenuCategoryModel[];
  delivery_services: DeliveryServiceModel[];
  opening_hours?: OpeningHoursModel;
  opening_hours_visible?: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
