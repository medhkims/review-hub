import { Timestamp } from 'firebase/firestore';

export interface CommentModel {
  id: string;
  review_id: string;
  user_id: string;
  text: string;
  created_at: Timestamp;
  reply_count?: number;
  // Enriched
  author_name?: string;
  author_avatar_url?: string | null;
}

export interface ReplyModel {
  id: string;
  comment_id: string;
  review_id: string;
  user_id: string;
  text: string;
  created_at: Timestamp;
  // Enriched
  author_name?: string;
  author_avatar_url?: string | null;
}
