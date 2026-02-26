import { NotificationModel } from '../models/notificationModel';
import { NotificationEntity, NotificationType } from '@/domain/notifications/entities/notificationEntity';

export class NotificationMapper {
  static toEntity(model: NotificationModel): NotificationEntity {
    return {
      id: model.id,
      type: model.type as NotificationType,
      title: model.title,
      body: model.body,
      imageUrl: model.image_url,
      isRead: model.is_read,
      referenceId: model.reference_id,
      referenceType: model.reference_type,
      createdAt: model.created_at.toDate(),
    };
  }
}
