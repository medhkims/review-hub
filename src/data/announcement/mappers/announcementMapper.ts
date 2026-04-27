import { AnnouncementModel } from '../models/announcementModel';
import { AnnouncementEntity } from '@/domain/announcement/entities/announcementEntity';

export class AnnouncementMapper {
  static toEntity(model: AnnouncementModel): AnnouncementEntity {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      imageUrl: model.image_url ?? null,
      validUntil: model.valid_until?.toDate?.() ?? null,
      createdAt: model.created_at?.toDate?.() ?? new Date(),
    };
  }
}
