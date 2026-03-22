import { Timestamp } from 'firebase/firestore';

export interface CommentModel {
  id: string;
  review_id: string;
  user_id: string;
  text: string;
  created_at: Timestamp;
  reply_count?: number;
  like_count?: number;
  // Enriched
  author_name?: string;
  author_avatar_url?: string | null;
  is_liked_by_current_user?: boolean;
}

export interface ReplyModel {
  id: string;
  comment_id: string;
  review_id: string;
  user_id: string;
  text: string;
  created_at: Timestamp;
  like_count?: number;
  replying_to_name?: string;
  // Enriched
  author_name?: string;
  author_avatar_url?: string | null;
  is_liked_by_current_user?: boolean;
}
