import { Timestamp } from 'firebase/firestore';

export interface CategoryDefaultModel {
  category_id: string;
  profile_image_url: string | null;
  cover_image_url: string | null;
  updated_at: Timestamp;
}
