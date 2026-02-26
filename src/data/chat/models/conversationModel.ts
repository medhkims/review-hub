import { Timestamp } from 'firebase/firestore';

export interface ConversationModel {
  id: string;
  participant_ids: string[];
  last_message: string;
  last_message_at: Timestamp;
  unread_count: number;
}
