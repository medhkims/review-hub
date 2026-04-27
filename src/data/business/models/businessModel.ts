import { Timestamp } from 'firebase/firestore';

export interface BusinessModel {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name: string;
  sub_category?: string;
  sub_categories?: string[];
  location: string;
  cover_image_url: string | null;
  logo_url: string | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  owner_id: string;
  status?: 'pending' | 'active' | 'rejected' | 'blocked';
  /** True when the business owner has claimed / registered the account */
  is_verified?: boolean;
  // Premium subscription
  is_premium?: boolean;
  premium_expires_at?: Timestamp | null;
  // Engagement counters
  visit_count?: number;
  search_count?: number;
  // Trending / weekly review tracking
  weekly_review_count?: number;
  // Geo coordinates
  latitude?: number | null;
  longitude?: number | null;
  // Opening hours
  opening_hours?: Record<string, { is_open: boolean; open_time: string; close_time: string }>;
  opening_hours_visible?: boolean;
  // Denormalized from contact info — which social platforms the business is on
  platforms?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
}
