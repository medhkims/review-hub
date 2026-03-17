import { Timestamp, FieldValue } from 'firebase/firestore';

export interface CreateReviewModel {
  business_id: string;
  business_name: string;
  user_id: string;
  ratings: Record<string, number>;
  overall_rating: number;
  review_text: string;
  photo_urls: string[];
  created_at: Timestamp | FieldValue;
  status: 'pending';
}

export interface UserReviewModel {
  id: string;
  business_id: string;
  business_name: string;
  user_id: string;
  ratings: Record<string, number>;
  overall_rating: number;
  review_text: string;
  photo_urls: string[];
  created_at: Timestamp;
  likes_count?: number;
  views_count?: number;
  status?: string;
}
