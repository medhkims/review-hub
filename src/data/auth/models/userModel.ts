import { Timestamp } from 'firebase/firestore';

export interface UserModel {
  uid: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: Timestamp;
}
