import { CategoryDefaultModel } from '../models/categoryDefaultModel';
import { CategoryDefaultEntity } from '@/domain/categoryDefaults/entities/categoryDefaultEntity';

export class CategoryDefaultMapper {
  static toEntity(model: CategoryDefaultModel): CategoryDefaultEntity {
    return {
      categoryId: model.category_id,
      profileImageUrl: model.profile_image_url,
      coverImageUrl: model.cover_image_url,
      updatedAt: model.updated_at?.toDate?.() ?? new Date(),
    };
  }
}
