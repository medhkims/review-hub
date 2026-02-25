import { Timestamp } from 'firebase/firestore';

export interface WishlistItemModel {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  place_image_url: string | null;
  rating: number;
  review_count: number;
  location: string;
  added_at: Timestamp;
}
