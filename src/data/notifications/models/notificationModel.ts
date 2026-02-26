import { Timestamp } from 'firebase/firestore';

export interface NotificationModel {
  id: string;
  type: string;
  title: string;
  body: string;
  image_url: string | null;
  is_read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  user_id: string;
  created_at: Timestamp;
}
