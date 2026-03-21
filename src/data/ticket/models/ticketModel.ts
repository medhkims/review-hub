import { Timestamp } from 'firebase/firestore';

export interface TicketModel {
  id: string;
  business_id: string;
  business_name: string;
  reason: string;
  reported_by: string;
  reporter_name: string;
  status: string; // 'pending' | 'in_progress' | 'resolved' | 'closed'
  created_at: Timestamp;
  updated_at?: Timestamp;
  assigned_to_id?: string;
  assigned_to_name?: string;
  assigned_to_role?: string; // 'admin' | 'moderator'
}
