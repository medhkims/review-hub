import { Timestamp } from 'firebase/firestore';

export interface AnnouncementModel {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  valid_until: Timestamp | null;
  created_at: Timestamp;
}
