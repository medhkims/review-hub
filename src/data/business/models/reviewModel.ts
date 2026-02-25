import { Timestamp } from 'firebase/firestore';

export interface ReviewModel {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  rating: number;
  text: string;
  created_at: Timestamp;
}
