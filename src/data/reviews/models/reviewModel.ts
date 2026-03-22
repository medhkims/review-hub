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
  like_count?: number;
  view_count?: number;
  comment_count?: number;
  is_liked_by_current_user?: boolean;
  status?: string;
}
