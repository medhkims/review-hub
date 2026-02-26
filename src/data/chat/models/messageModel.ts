import { Timestamp } from 'firebase/firestore';

export interface MessageModel {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: Timestamp;
  is_pending: boolean;
}
