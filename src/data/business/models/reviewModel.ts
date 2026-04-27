import { Timestamp } from 'firebase/firestore';

export interface ReviewModel {
  id: string;
  user_id: string;
  overall_rating: number;
  review_text: string;
  photo_urls?: string[];
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
  dislike_count?: number;
  is_disliked_by_current_user?: boolean;
  // Import metadata
  source?: string;
  google_author_name?: string;
}
