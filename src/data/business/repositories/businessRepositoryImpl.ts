import { BusinessRepository } from '@/domain/business/repositories/businessRepository';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { BusinessDetailEntity } from '@/domain/business/entities/businessDetailEntity';
import { ReviewEntity } from '@/domain/business/entities/reviewEntity';
import { CommentEntity, ReplyEntity } from '@/domain/business/entities/commentEntity';
import { ActiveCategoryInfoEntity } from '@/domain/business/entities/activeCategoryInfoEntity';
import { RegisterBusinessParams, SubmitBusinessParams, DuplicateCheckResult } from '@/domain/business/repositories/businessRepository';
import { BusinessRemoteDataSource } from '../datasources/businessRemoteDataSource';
import { BusinessLocalDataSource } from '../datasources/businessLocalDataSource';
import { BusinessMapper } from '../mappers/businessMapper';
import { BusinessDetailMapper } from '../mappers/businessDetailMapper';
import { ReviewMapper } from '../mappers/reviewMapper';
import { CommentMapper } from '../mappers/commentMapper';
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

  async getNewBusinesses(): Promise<Either<Failure, BusinessEntity[]>> {
    const isOnline = await this.network.isConnected();

    try {
      if (isOnline) {
        const models = await this.remote.getNewBusinesses();
        const userId = auth.currentUser?.uid;
        const favoriteIds = userId ? await this.remote.getUserFavoriteIds(userId) : [];
        const entities = models.map((m) => BusinessMapper.toEntity(m, favoriteIds.includes(m.id)));
        await this.local.cacheBusinesses('new', models).catch(() => {});
        return right(entities);
      } else {
        const cached = await this.local.getCachedBusinesses('new');
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
        const cached = await this.local.getCachedBusinesses('new').catch(() => null);
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

  async searchBusinesses(queryStr: string, categoryId?: string | null): Promise<Either<Failure, BusinessEntity[]>> {
    try {
      const models = await this.remote.searchBusinesses(queryStr, categoryId);
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

  async getBusinessDetail(businessId: string, skipTracking?: boolean): Promise<Either<Failure, BusinessDetailEntity>> {
    try {
      const model = await this.remote.getBusinessDetail(businessId, skipTracking);
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

  async getActiveCategoryInfo(): Promise<Either<Failure, ActiveCategoryInfoEntity>> {
    try {
      const info = await this.remote.getActiveCategoryInfo();
      return right(info);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to fetch active category info'));
    }
  }

  async fuzzySearchBusiness(
    queryStr: string,
    categoryId?: string | null,
  ): Promise<Either<Failure, BusinessEntity | null>> {
    try {
      const model = await this.remote.fuzzySearchBusiness(queryStr, categoryId);
      if (!model) return right(null);
      const entity = BusinessMapper.toEntity(model, false);
      return right(entity);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Fuzzy search failed'));
    }
  }

  async submitBusiness(params: SubmitBusinessParams): Promise<Either<Failure, string>> {
    try {
      const id = await this.remote.submitBusiness(params);
      return right(id);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to submit business'));
    }
  }

  async checkBusinessDuplicate(
    name: string,
    categoryId: string,
  ): Promise<Either<Failure, DuplicateCheckResult>> {
    try {
      const result = await this.remote.checkBusinessDuplicate(name, categoryId);
      return right(result);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Duplicate check failed'));
    }
  }

  async uploadBusinessImage(businessId: string, imageUri: string, type: 'cover' | 'logo' | 'menu'): Promise<Either<Failure, string>> {
    try {
      const downloadUrl = await this.remote.uploadBusinessImage(businessId, imageUri, type);
      return right(downloadUrl);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to upload image'));
    }
  }

  async getPendingBusinesses(): Promise<Either<Failure, BusinessDetailEntity[]>> {
    try {
      const models = await this.remote.getPendingBusinesses();
      const entities = models.map((m) => BusinessDetailMapper.toEntity(m, false));
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to fetch pending businesses'));
    }
  }

  async getApprovedBusinesses(): Promise<Either<Failure, BusinessDetailEntity[]>> {
    try {
      const models = await this.remote.getApprovedBusinesses();
      const entities = models.map((m) => BusinessDetailMapper.toEntity(m, false));
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch approved businesses'));
    }
  }

  async getRejectedBusinesses(): Promise<Either<Failure, BusinessDetailEntity[]>> {
    try {
      const models = await this.remote.getRejectedBusinesses();
      const entities = models.map((m) => BusinessDetailMapper.toEntity(m, false));
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch rejected businesses'));
    }
  }

  async acceptBusiness(businessId: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.acceptBusiness(businessId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to accept business'));
    }
  }

  async rejectBusiness(businessId: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.rejectBusiness(businessId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to reject business'));
    }
  }

  async suspendBusiness(businessId: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.suspendBusiness(businessId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to suspend business'));
    }
  }

  async reApproveBusiness(businessId: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.reApproveBusiness(businessId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to re-approve business'));
    }
  }

  async getSuspendedBusinesses(): Promise<Either<Failure, BusinessDetailEntity[]>> {
    try {
      const models = await this.remote.getSuspendedBusinesses();
      const entities = models.map((m) => BusinessDetailMapper.toEntity(m, false));
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch suspended businesses'));
    }
  }

  async incrementSearchCount(businessId: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.incrementSearchCount(businessId);
      return right(undefined);
    } catch {
      return right(undefined);
    }
  }

  async incrementGlobalSearchCount(): Promise<Either<Failure, void>> {
    try {
      await this.remote.incrementGlobalSearchCount();
      return right(undefined);
    } catch {
      return right(undefined);
    }
  }

  async reportBusiness(params: import('@/domain/business/repositories/businessRepository').ReportBusinessParams): Promise<Either<Failure, void>> {
    try {
      await this.remote.reportBusiness(params.businessId, params.businessName, params.reason, params.reportedByUserId, params.reporterDisplayName);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to submit report'));
    }
  }

  async likeReview(reviewId: string): Promise<Either<Failure, void>> {
    const userId = auth.currentUser?.uid;
    if (!userId) return left(new ServerFailure('Not authenticated'));
    try {
      await this.remote.likeReview(reviewId, userId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to like review'));
    }
  }

  async unlikeReview(reviewId: string): Promise<Either<Failure, void>> {
    const userId = auth.currentUser?.uid;
    if (!userId) return left(new ServerFailure('Not authenticated'));
    try {
      await this.remote.unlikeReview(reviewId, userId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to unlike review'));
    }
  }

  async incrementReviewView(reviewId: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.incrementReviewView(reviewId);
      return right(undefined);
    } catch {
      return right(undefined);
    }
  }

  async getReviewComments(reviewId: string): Promise<Either<Failure, CommentEntity[]>> {
    try {
      const models = await this.remote.getReviewComments(reviewId) as (import('../models/commentModel').CommentModel & { _replies?: import('../models/commentModel').ReplyModel[] })[];
      const entities = models.map((m) => {
        const replyEntities = (m._replies ?? []).map((r) => CommentMapper.replyToEntity(r));
        return CommentMapper.toEntity(m, replyEntities);
      });
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch comments'));
    }
  }

  async addReviewComment(reviewId: string, text: string): Promise<Either<Failure, CommentEntity>> {
    const userId = auth.currentUser?.uid;
    if (!userId) return left(new ServerFailure('Not authenticated'));
    try {
      const model = await this.remote.addReviewComment(reviewId, userId, text);
      return right(CommentMapper.toEntity(model));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to add comment'));
    }
  }

  async addCommentReply(commentId: string, reviewId: string, text: string): Promise<Either<Failure, ReplyEntity>> {
    const userId = auth.currentUser?.uid;
    if (!userId) return left(new ServerFailure('Not authenticated'));
    try {
      const model = await this.remote.addCommentReply(commentId, reviewId, userId, text);
      return right(CommentMapper.replyToEntity(model));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to add reply'));
    }
  }
}
