import { BusinessRepository } from '@/domain/business/repositories/businessRepository';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { BusinessDetailEntity } from '@/domain/business/entities/businessDetailEntity';
import { ReviewEntity } from '@/domain/business/entities/reviewEntity';
import { RegisterBusinessParams } from '@/domain/business/repositories/businessRepository';
import { BusinessRemoteDataSource } from '../datasources/businessRemoteDataSource';
import { BusinessLocalDataSource } from '../datasources/businessLocalDataSource';
import { BusinessMapper } from '../mappers/businessMapper';
import { BusinessDetailMapper } from '../mappers/businessDetailMapper';
import { ReviewMapper } from '../mappers/reviewMapper';
import { NetworkInfo } from '@/core/network/networkInfo';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure, NetworkFailure } from '@/core/error/failures';
import { ServerException, NetworkException } from '@/core/error/exceptions';
import { auth } from '@/core/firebase/firebaseConfig';

export class BusinessRepositoryImpl implements BusinessRepository {
  constructor(
    private readonly remote: BusinessRemoteDataSource,
    private readonly local: BusinessLocalDataSource,
    private readonly network: NetworkInfo,
  ) {}

  async getFeaturedBusinesses(): Promise<Either<Failure, BusinessEntity[]>> {
    const isOnline = await this.network.isConnected();

    try {
      if (isOnline) {
        const models = await this.remote.getFeaturedBusinesses();
        const userId = auth.currentUser?.uid;
        const favoriteIds = userId ? await this.remote.getUserFavoriteIds(userId) : [];
        const entities = models.map((m) => BusinessMapper.toEntity(m, favoriteIds.includes(m.id)));
        await this.local.cacheBusinesses('featured', models).catch(() => {});
        return right(entities);
      } else {
        const cached = await this.local.getCachedBusinesses('featured');
        if (!cached) {
          return left(new NetworkFailure('No internet connection and no cached data available'));
        }
        const entities = cached.map((m) => BusinessMapper.toEntity(m, false));
        return right(entities);
      }
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        const cached = await this.local.getCachedBusinesses('featured').catch(() => null);
        if (cached) {
          return right(cached.map((m) => BusinessMapper.toEntity(m, false)));
        }
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async getBusinessesByCategory(categoryId: string): Promise<Either<Failure, BusinessEntity[]>> {
    const isOnline = await this.network.isConnected();
    const cacheKey = `category_${categoryId}`;

    try {
      if (isOnline) {
        const models = await this.remote.getBusinessesByCategory(categoryId);
        const userId = auth.currentUser?.uid;
        const favoriteIds = userId ? await this.remote.getUserFavoriteIds(userId) : [];
        const entities = models.map((m) => BusinessMapper.toEntity(m, favoriteIds.includes(m.id)));
        await this.local.cacheBusinesses(cacheKey, models).catch(() => {});
        return right(entities);
      } else {
        const cached = await this.local.getCachedBusinesses(cacheKey);
        if (!cached) {
          return left(new NetworkFailure('No internet connection and no cached data available'));
        }
        return right(cached.map((m) => BusinessMapper.toEntity(m, false)));
      }
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        const cached = await this.local.getCachedBusinesses(cacheKey).catch(() => null);
        if (cached) {
          return right(cached.map((m) => BusinessMapper.toEntity(m, false)));
        }
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async searchBusinesses(queryStr: string): Promise<Either<Failure, BusinessEntity[]>> {
    try {
      const models = await this.remote.searchBusinesses(queryStr);
      const userId = auth.currentUser?.uid;
      const favoriteIds = userId ? await this.remote.getUserFavoriteIds(userId) : [];
      return right(models.map((m) => BusinessMapper.toEntity(m, favoriteIds.includes(m.id))));
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Search failed'));
    }
  }

  async toggleFavorite(businessId: string, userId: string): Promise<Either<Failure, boolean>> {
    try {
      const currentlyFav = await this.remote.isFavorite(businessId, userId);
      if (currentlyFav) {
        await this.remote.removeFavorite(businessId, userId);
        return right(false);
      } else {
        await this.remote.addFavorite(businessId, userId);
        return right(true);
      }
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to toggle favorite'));
    }
  }

  async getBusinessDetail(businessId: string): Promise<Either<Failure, BusinessDetailEntity>> {
    try {
      const model = await this.remote.getBusinessDetail(businessId);
      const userId = auth.currentUser?.uid;
      const isFavorite = userId ? await this.remote.isFavorite(businessId, userId) : false;
      const entity = BusinessDetailMapper.toEntity(model, isFavorite);
      return right(entity);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to fetch business detail'));
    }
  }

  async getBusinessReviews(businessId: string): Promise<Either<Failure, ReviewEntity[]>> {
    try {
      const models = await this.remote.getBusinessReviews(businessId);
      const entities = models.map((m) => ReviewMapper.toEntity(m));
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to fetch reviews'));
    }
  }

  async getBusinessByOwnerId(userId: string): Promise<Either<Failure, BusinessDetailEntity | null>> {
    try {
      const model = await this.remote.getBusinessByOwnerId(userId);
      if (!model) {
        return right(null);
      }
      const entity = BusinessDetailMapper.toEntity(model, false);
      return right(entity);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to fetch business by owner'));
    }
  }

  async registerBusiness(params: RegisterBusinessParams): Promise<Either<Failure, string>> {
    try {
      const businessId = await this.remote.registerBusiness(params);
      return right(businessId);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to register business'));
    }
  }

  async updateBusiness(businessId: string, data: Record<string, unknown>): Promise<Either<Failure, void>> {
    try {
      await this.remote.updateBusiness(businessId, data);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to update business'));
    }
  }
}
