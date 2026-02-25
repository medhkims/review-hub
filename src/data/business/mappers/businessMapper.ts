import { BusinessModel } from '../models/businessModel';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';

export class BusinessMapper {
  static toEntity(model: BusinessModel, isFavorite: boolean = false): BusinessEntity {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      categoryId: model.category_id,
      categoryName: model.category_name,
      location: model.location,
      coverImageUrl: model.cover_image_url,
      rating: model.rating,
      reviewCount: model.review_count,
      isFeatured: model.is_featured,
      isFavorite,
      ownerId: model.owner_id,
      createdAt: model.created_at.toDate(),
      updatedAt: model.updated_at.toDate(),
    };
  }

  static toModel(entity: BusinessEntity): Omit<BusinessModel, 'created_at' | 'updated_at'> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      category_id: entity.categoryId,
      category_name: entity.categoryName,
      location: entity.location,
      cover_image_url: entity.coverImageUrl,
      rating: entity.rating,
      review_count: entity.reviewCount,
      is_featured: entity.isFeatured,
      owner_id: entity.ownerId,
    };
  }
}
