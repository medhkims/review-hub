import { Timestamp } from 'firebase/firestore';

export interface WeeklyPickModel {
  id: string;
  business_id: string;
  business_name: string;
  business_logo_url: string | null;
  business_cover_url: string | null;
  business_rating: number;
  business_review_count: number;
  category_name: string;
  pick_reason: string;
  week_start_date: Timestamp;
  created_at: Timestamp;
}
