import { Timestamp } from 'firebase/firestore';

export interface BusinessModel {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name: string;
  location: string;
  cover_image_url: string | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  owner_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}
