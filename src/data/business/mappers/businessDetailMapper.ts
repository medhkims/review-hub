import { BusinessDetailModel } from '../models/businessDetailModel';
import { BusinessDetailEntity } from '@/domain/business/entities/businessDetailEntity';

export class BusinessDetailMapper {
  static toEntity(model: BusinessDetailModel, isFavorite: boolean = false): BusinessDetailEntity {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      categoryId: model.category_id,
      categoryName: model.category_name,
      location: model.location,
      latitude: model.latitude,
      longitude: model.longitude,
      coverImageUrl: model.cover_image_url,
      logoUrl: model.logo_url,
      isOpen: model.is_open,
      rating: model.rating,
      reviewCount: model.review_count,
      isFavorite,
      ownerId: model.owner_id,
      contact: {
        phone: model.contact?.phone ?? null,
        email: model.contact?.email ?? null,
        website: model.contact?.website ?? null,
        instagramHandle: model.contact?.instagram_handle ?? null,
        facebookName: model.contact?.facebook_name ?? null,
        tiktokHandle: model.contact?.tiktok_handle ?? null,
      },
      categoryRatings: (model.category_ratings ?? []).map((cr) => ({
        name: cr.name,
        icon: cr.icon,
        rating: cr.rating,
      })),
      ratingDistribution: (model.rating_distribution ?? []).map((rd) => ({
        stars: rd.stars,
        percentage: rd.percentage,
      })),
      menuCategories: (model.menu_categories ?? []).map((mc) => ({
        id: mc.id,
        name: mc.name,
        items: mc.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.image_url,
          price: item.price,
          currency: item.currency,
        })),
      })),
      deliveryServices: (model.delivery_services ?? []).map((ds) => ({
        id: ds.id,
        name: ds.name,
        abbreviation: ds.abbreviation,
        isActive: ds.is_active,
        url: ds.url,
      })),
      createdAt: model.created_at.toDate(),
      updatedAt: model.updated_at.toDate(),
    };
  }
}
