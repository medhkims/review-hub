import { WishlistRepository, WishlistAddInput } from '../repositories/wishlistRepository';
import { WishlistItemEntity } from '../entities/wishlistItemEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class AddToWishlistUseCase {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async execute(
    userId: string,
    input: WishlistAddInput,
  ): Promise<Either<Failure, WishlistItemEntity>> {
    return this.wishlistRepository.addToWishlist(userId, input);
  }
}
