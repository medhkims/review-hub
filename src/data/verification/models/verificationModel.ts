import { Timestamp } from 'firebase/firestore';

export interface VerificationModel {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  full_name: string;
  phone_number: string;
  id_card_url: string;
  cin_number: string | null;
  status: string; // 'pending' | 'approved' | 'rejected'
  submitted_at: Timestamp;
  reviewed_at: Timestamp | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}
