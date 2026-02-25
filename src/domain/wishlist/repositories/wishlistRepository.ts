import { WishlistItemEntity } from '../entities/wishlistItemEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface WishlistAddInput {
  placeId: string;
  placeName: string;
  placeImageUrl: string | null;
  rating: number;
  reviewCount: number;
  location: string;
}

export interface WishlistRepository {
  getWishlist(userId: string): Promise<Either<Failure, WishlistItemEntity[]>>;
  addToWishlist(userId: string, input: WishlistAddInput): Promise<Either<Failure, WishlistItemEntity>>;
  removeFromWishlist(userId: string, itemId: string): Promise<Either<Failure, void>>;
}
