import { Timestamp } from 'firebase/firestore';

export interface DealModel {
  id: string;
  business_id: string;
  business_name: string;
  business_logo_url: string | null;
  business_cover_url: string | null;
  title: string;
  description: string;
  discount_percent: number | null;
  valid_until: Timestamp;
  is_active: boolean;
  created_at: Timestamp;
  menu_category_name: string;
  original_price: number;
  currency: string;
  max_discount_percent: number;
  deal_count: number;
}
