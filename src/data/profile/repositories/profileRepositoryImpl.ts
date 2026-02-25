import { ProfileRepository, UploadProgressCallback } from '@/domain/profile/repositories/profileRepository';
import { ProfileEntity } from '@/domain/profile/entities/profileEntity';
import { ProfileRemoteDataSource } from '../datasources/profileRemoteDataSource';
import { ProfileLocalDataSource } from '../datasources/profileLocalDataSource';
import { AvatarRemoteDataSource } from '../datasources/avatarRemoteDataSource';
import { ProfileMapper } from '../mappers/profileMapper';
import { NetworkInfo } from '@/core/network/networkInfo';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure, NetworkFailure, CacheFailure, AuthFailure } from '@/core/error/failures';
import { ServerException, NetworkException, CacheException, AuthException } from '@/core/error/exceptions';

export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(
    private readonly remote: ProfileRemoteDataSource,
    private readonly local: ProfileLocalDataSource,
    private readonly avatar: AvatarRemoteDataSource,
    private readonly network: NetworkInfo,
  ) {}

  async getProfile(userId: string): Promise<Either<Failure, ProfileEntity>> {
    const isOnline = await this.network.isConnected();

    try {
      if (isOnline) {
        // Try to fetch from remote
        const model = await this.remote.getProfile(userId);
        const entity = ProfileMapper.toEntity(model);

        // Cache the result
        await this.local.cacheProfile(userId, model).catch(() => {
          // Ignore cache errors - don't fail the operation
        });

        return right(entity);
      } else {
        // Try to get from cache when offline
        const cachedModel = await this.local.getCachedProfile(userId);

        if (!cachedModel) {
          return left(new NetworkFailure('No internet connection and no cached data available'));
        }

        const entity = ProfileMapper.toEntity(cachedModel);
        return right(entity);
      }
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        // Try cache as fallback
        try {
          const cachedModel = await this.local.getCachedProfile(userId);
          if (cachedModel) {
            const entity = ProfileMapper.toEntity(cachedModel);
            return right(entity);
          }
        } catch (cacheError) {
          // Ignore cache errors
        }
        return left(new NetworkFailure(error.message));
      }
      if (error instanceof CacheException) {
        return left(new CacheFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async updateProfile(userId: string, updates: Partial<ProfileEntity>): Promise<Either<Failure, ProfileEntity>> {
    const isOnline = await this.network.isConnected();

    if (!isOnline) {
      return left(new NetworkFailure('Cannot update profile while offline'));
    }

    try {
      const modelUpdates = ProfileMapper.partialToModel(updates);
      const updatedModel = await this.remote.updateProfile(userId, modelUpdates);
      const entity = ProfileMapper.toEntity(updatedModel);

      // Update cache
      await this.local.cacheProfile(userId, updatedModel).catch(() => {
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

  async updateEmail(userId: string, newEmail: string): Promise<Either<Failure, void>> {
    const isOnline = await this.network.isConnected();

    if (!isOnline) {
      return left(new NetworkFailure('Cannot update email while offline'));
    }

    try {
      await this.remote.updateEmail(userId, newEmail);

      // Clear cache to force refresh
      await this.local.clearCache(userId).catch(() => {
        // Ignore cache errors
      });

      return right(undefined);
    } catch (error) {
      if (error instanceof AuthException) {
        return left(new AuthFailure(error.message));
      }
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async uploadAvatar(
    userId: string,
    imageUri: string,
    mimeType?: string,
    onProgress?: UploadProgressCallback,
  ): Promise<Either<Failure, string>> {
    const isOnline = await this.network.isConnected();

    if (!isOnline) {
      return left(new NetworkFailure('Cannot upload avatar while offline'));
    }

    try {
      // Upload to Firebase Storage
      const downloadURL = await this.avatar.uploadAvatar(userId, imageUri, mimeType, onProgress);

      // Update the profile with the new avatar URL
      await this.remote.updateProfile(userId, { avatar_url: downloadURL });

      // Invalidate cache so next fetch gets the new avatar
      await this.local.clearCache(userId).catch(() => {});

      return right(downloadURL);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('Failed to upload avatar'));
    }
  }
}
