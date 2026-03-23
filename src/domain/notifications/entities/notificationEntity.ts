export type NotificationType =
  | 'review'
  | 'like'
  | 'follow'
  | 'system'
  | 'promotion'
  | 'business_approved'
  | 'business_rejected'
  | 'review_approved'
  | 'review_rejected'
  | 'verification_approved'
  | 'verification_rejected'
  | 'review_comment'
  | 'comment_reply'
  | 'comment_like'
  | 'reply_like'
  | 'comment_dislike'
  | 'reply_dislike'
  | 'review_like'
  | 'review_dislike'
  | 'support_reply';

export interface NotificationEntity {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl: string | null;
  isRead: boolean;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: Date;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: string | null;
  imageUrl?: string | null;
}
