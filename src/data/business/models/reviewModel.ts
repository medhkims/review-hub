import { Timestamp } from 'firebase/firestore';

export interface ReviewModel {
  id: string;
  user_id: string;
  overall_rating: number;
  review_text: string;
  created_at: Timestamp;
  status?: string;
  like_count?: number;
  view_count?: number;
  comment_count?: number;
  // Enriched after profile fetch
  author_name?: string;
  author_avatar_url?: string | null;
  // Enriched after like-status check
  is_liked_by_current_user?: boolean;
}
