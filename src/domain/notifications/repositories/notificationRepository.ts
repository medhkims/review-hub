import { NotificationEntity } from '../entities/notificationEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface NotificationRepository {
  getNotifications(userId: string): Promise<Either<Failure, NotificationEntity[]>>;
  markAsRead(notificationId: string): Promise<Either<Failure, void>>;
  markAllAsRead(userId: string): Promise<Either<Failure, void>>;
  getUnreadCount(userId: string): Promise<Either<Failure, number>>;
}
