import { Timestamp } from 'firebase/firestore';

export interface DisputeModel {
  id: string;
  review_id: string;
  business_id: string;
  business_name: string;
  review_author_id: string;
  review_author_name: string;
  review_text: string;
  review_rating: number;
  disputed_by_id: string;
  disputed_by_name: string;
  disputed_by_email: string;
  reason: string;
  explanation: string;
  evidence_urls: string[];
  status: string;
  admin_notes: string | null;
  created_at: Timestamp;
  resolved_at: Timestamp | null;
  resolved_by_id: string | null;
  reviewer_notified_at: Timestamp | null;
  reviewer_response: string | null;
}
