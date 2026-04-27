import { Timestamp } from 'firebase/firestore';

export interface BookingRequestModel {
  id: string;
  business_id: string;
  business_name: string;
  user_id: string;
  user_name: string;
  date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  note: string;
  created_at: Timestamp;
}
