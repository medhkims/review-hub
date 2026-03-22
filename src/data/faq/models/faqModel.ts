import { Timestamp } from 'firebase/firestore';

export interface FaqModel {
  id: string;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
