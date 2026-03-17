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
      subCategory: model.sub_category,
      subCategories: model.sub_categories,
      location: model.location,
      coverImageUrl: model.cover_image_url,
      logoUrl: model.logo_url ?? null,
      rating: model.rating,
      reviewCount: model.review_count,
      isFeatured: model.is_featured,
      isFavorite,
      ownerId: model.owner_id,
      status: model.status ?? 'active',
      isOwnerVerified: model.is_verified === true || (model.is_verified === undefined && !!model.owner_id),
      openingHours: model.opening_hours
        ? Object.fromEntries(
            Object.entries(model.opening_hours).map(([day, d]) => [
              day,
              { isOpen: d.is_open, openTime: d.open_time, closeTime: d.close_time },
            ]),
          )
        : undefined,
      openingHoursVisible: model.opening_hours_visible,
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
      logo_url: entity.logoUrl,
      rating: entity.rating,
      review_count: entity.reviewCount,
      is_featured: entity.isFeatured,
      owner_id: entity.ownerId,
    };
  }
}
