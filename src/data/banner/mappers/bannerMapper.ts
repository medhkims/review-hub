import { BannerModel } from '../models/bannerModel';
import { BannerEntity } from '@/domain/banner/entities/bannerEntity';

export class BannerMapper {
  static toEntity(model: BannerModel): BannerEntity {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      content: model.content ?? '',
      imageUrl: model.image_url,
      isActive: model.is_active,
      isClickable: model.is_clickable ?? true,
      sortOrder: model.sort_order,
      createdAt: model.created_at?.toDate() ?? new Date(),
      updatedAt: model.updated_at?.toDate() ?? new Date(),
    };
  }
}
