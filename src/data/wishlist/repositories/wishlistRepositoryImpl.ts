import { WishlistRepository, WishlistAddInput } from '@/domain/wishlist/repositories/wishlistRepository';
import { WishlistItemEntity } from '@/domain/wishlist/entities/wishlistItemEntity';
import { WishlistRemoteDataSource } from '../datasources/wishlistRemoteDataSource';
import { WishlistLocalDataSource } from '../datasources/wishlistLocalDataSource';
import { WishlistMapper } from '../mappers/wishlistMapper';
import { NetworkInfo } from '@/core/network/networkInfo';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure, NetworkFailure, CacheFailure } from '@/core/error/failures';
import { ServerException, NetworkException, CacheException } from '@/core/error/exceptions';

export class WishlistRepositoryImpl implements WishlistRepository {
  constructor(
    private readonly remote: WishlistRemoteDataSource,
    private readonly local: WishlistLocalDataSource,
    private readonly network: NetworkInfo,
  ) {}

  async getWishlist(userId: string): Promise<Either<Failure, WishlistItemEntity[]>> {
    const isOnline = await this.network.isConnected();

    try {
      if (isOnline) {
        const models = await this.remote.getWishlist(userId);
        const entities = models.map(WishlistMapper.toEntity);

        await this.local.cacheWishlist(userId, models).catch(() => {
          // Ignore cache errors — do not fail the operation
        });

        return right(entities);
      } else {
        const cachedModels = await this.local.getCachedWishlist(userId);

        if (!cachedModels) {
          return left(new NetworkFailure('No internet connection and no cached wishlist available'));
        }

        return right(cachedModels.map(WishlistMapper.toEntity));
      }
    } catch (error) {
      if (error instanceof ServerException) {
        // Try cache as fallback
        try {
          const cachedModels = await this.local.getCachedWishlist(userId);
          if (cachedModels) {
            return right(cachedModels.map(WishlistMapper.toEntity));
          }
        } catch {
          // Ignore cache read errors
        }
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        try {
          const cachedModels = await this.local.getCachedWishlist(userId);
          if (cachedModels) {
            return right(cachedModels.map(WishlistMapper.toEntity));
          }
        } catch {
          // Ignore cache read errors
        }
        return left(new NetworkFailure(error.message));
      }
      if (error instanceof CacheException) {
        return left(new CacheFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async addToWishlist(
    userId: string,
    input: WishlistAddInput,
  ): Promise<Either<Failure, WishlistItemEntity>> {
    const isOnline = await this.network.isConnected();

    if (!isOnline) {
      return left(new NetworkFailure('Cannot add to wishlist while offline'));
    }

    try {
      const model = await this.remote.addWishlistItem(userId, input);
      const entity = WishlistMapper.toEntity(model);

      await this.local.addCachedItem(userId, model).catch(() => {
        // Ignore cache errors
      });

      return right(entity);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async removeFromWishlist(
    userId: string,
    itemId: string,
  ): Promise<Either<Failure, void>> {
    const isOnline = await this.network.isConnected();

    if (!isOnline) {
      return left(new NetworkFailure('Cannot remove wishlist item while offline'));
    }

    try {
      await this.remote.removeFromWishlist(userId, itemId);

      await this.local.removeCachedItem(userId, itemId).catch(() => {
        // Ignore cache errors
      });

      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }
}
