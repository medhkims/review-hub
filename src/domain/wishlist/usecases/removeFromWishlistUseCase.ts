import { WishlistRepository } from '../repositories/wishlistRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class RemoveFromWishlistUseCase {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async execute(userId: string, itemId: string): Promise<Either<Failure, void>> {
    return this.wishlistRepository.removeFromWishlist(userId, itemId);
  }
}
