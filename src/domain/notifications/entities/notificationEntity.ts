export type NotificationType =
  | 'review'
  | 'like'
  | 'follow'
  | 'system'
  | 'promotion'
  | 'business_approved'
  | 'business_rejected'
  | 'review_approved'
  | 'review_rejected';

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
