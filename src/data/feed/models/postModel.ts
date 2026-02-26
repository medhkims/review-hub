import { Timestamp } from 'firebase/firestore';

export interface PostModel {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: Timestamp;
}
