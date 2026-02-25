import { WishlistItemModel } from '../models/wishlistItemModel';
import { WishlistItemEntity } from '@/domain/wishlist/entities/wishlistItemEntity';

export class WishlistMapper {
  static toEntity(model: WishlistItemModel): WishlistItemEntity {
    return {
      id: model.id,
      userId: model.user_id,
      placeId: model.place_id,
      placeName: model.place_name,
      placeImageUrl: model.place_image_url,
      rating: model.rating,
      reviewCount: model.review_count,
      location: model.location,
      addedAt: model.added_at.toDate(),
    };
  }
}
