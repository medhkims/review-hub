export type NotificationType = 'review' | 'like' | 'follow' | 'system' | 'promotion';

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
