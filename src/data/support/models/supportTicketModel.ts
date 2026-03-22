import { Timestamp } from 'firebase/firestore';

export interface SupportTicketModel {
  id: string;
  subject: string;
  message: string;
  category: string;
  user_id: string;
  user_email: string;
  user_name: string;
  status: string; // 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: Timestamp;
  updated_at?: Timestamp;
  admin_reply?: string;
}
