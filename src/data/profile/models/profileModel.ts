import { Timestamp } from 'firebase/firestore';

export interface ProfileModel {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  phone_number: string | null;
  bio: string;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  role: string;
  updated_at: Timestamp;
}
