import { BusinessDetailModel } from '../models/businessDetailModel';
import { BusinessDetailEntity, DayKey, OpeningHours, DaySchedule } from '@/domain/business/entities/businessDetailEntity';

const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DEFAULT_DAY: DaySchedule = { isOpen: false, openTime: '09:00', closeTime: '18:00' };

export class BusinessDetailMapper {
  static toEntity(model: BusinessDetailModel, isFavorite: boolean = false): BusinessDetailEntity {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      categoryId: model.category_id,
      categoryName: model.category_name,
      subCategories: Array.isArray(model.sub_categories) ? model.sub_categories : [],
      location: model.location,
      latitude: model.latitude,
      longitude: model.longitude,
      coverImageUrl: model.cover_image_url,
      logoUrl: model.logo_url,
      isOpen: model.is_open,
      isOnline: model.is_online ?? false,
      rating: model.rating,
      reviewCount: model.review_count,
      isFavorite,
      ownerId: model.owner_id,
      contact: {
        phone: model.contact?.phone ?? null,
        phoneVerified: model.contact?.phone_verified === true,
        email: model.contact?.email ?? null,
        website: model.contact?.website ?? null,
        instagramHandle: model.contact?.instagram_handle ?? null,
        facebookName: model.contact?.facebook_name ?? null,
        tiktokHandle: model.contact?.tiktok_handle ?? null,
      },
      categoryRatings: Array.isArray(model.category_ratings)
        ? model.category_ratings.map((cr) => ({
            name: cr.name,
            icon: cr.icon,
            rating: cr.rating,
          }))
        : [],
      ratingDistribution: Array.isArray(model.rating_distribution)
        ? model.rating_distribution.map((rd) => ({
            stars: rd.stars,
            percentage: rd.percentage,
          }))
        : [],
      menuCategories: Array.isArray(model.menu_categories)
        ? model.menu_categories
            .filter((mc) => typeof mc === 'object' && mc !== null)
            .map((mc) => ({
              id: mc.id,
              name: mc.name,
              imageUrl: mc.image_url ?? null,
              items: Array.isArray(mc.items)
                ? mc.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    imageUrl: item.image_url,
                    price: item.price,
                    currency: item.currency,
                  }))
                : [],
            }))
        : [],
      deliveryServices: Array.isArray(model.delivery_services)
        ? model.delivery_services
            .filter((ds) => typeof ds === 'object' && ds !== null)
            .map((ds) => ({
              id: ds.id,
              name: ds.name,
              abbreviation: ds.abbreviation,
              isActive: ds.is_active,
              url: ds.url,
              phone: ds.phone ?? null,
            }))
        : [],
      openingHours: model.opening_hours
        ? Object.fromEntries(
            DAY_KEYS.map((day) => {
              const d = model.opening_hours![day];
              return [day, d ? { isOpen: d.is_open, openTime: d.open_time, closeTime: d.close_time } : DEFAULT_DAY];
            }),
          ) as OpeningHours
        : undefined,
      openingHoursVisible: model.opening_hours_visible,
      suspensionCount: model.suspension_count ?? 0,
      status: model.status ?? 'active',
      isOwnerVerified: model.is_verified === true || (model.is_verified === undefined && !!model.owner_id),
      createdAt: model.created_at?.toDate?.() ?? new Date(),
      updatedAt: model.updated_at?.toDate?.() ?? new Date(),
    };
  }
}
