import { WishlistRepository } from '../repositories/wishlistRepository';
import { WishlistItemEntity } from '../entities/wishlistItemEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetWishlistUseCase {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async execute(userId: string): Promise<Either<Failure, WishlistItemEntity[]>> {
    return this.wishlistRepository.getWishlist(userId);
  }
}
