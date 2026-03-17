import { Timestamp } from 'firebase/firestore';

export interface BannerModel {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  is_active: boolean;
  is_clickable: boolean;
  sort_order: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}
