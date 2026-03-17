import { ReviewRepository } from '@/domain/reviews/repositories/reviewRepository';
import { CreateReviewInput } from '@/domain/reviews/entities/createReviewInput';
import { UserReviewEntity, ReviewStatus } from '@/domain/reviews/entities/userReviewEntity';
import { ReviewRemoteDataSource } from '../datasources/reviewRemoteDataSource';
import { CreateReviewModel, UserReviewModel } from '../models/reviewModel';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';
import { serverTimestamp } from 'firebase/firestore';


export class ReviewRepositoryImpl implements ReviewRepository {
  constructor(
    private readonly remote: ReviewRemoteDataSource,
  ) {}

  async createReview(userId: string, input: CreateReviewInput): Promise<Either<Failure, string>> {
    try {
      const model: CreateReviewModel = {
        business_id: input.businessId,
        business_name: input.businessName,
        user_id: userId,
        ratings: input.ratings,
        overall_rating: input.overallRating,
        review_text: input.reviewText,
        photo_urls: input.photoUrls,
        created_at: serverTimestamp(),
        status: 'pending',
      };

      const reviewId = await this.remote.createReview(model);
      return right(reviewId);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to create review'));
    }
  }

  async getUserReviews(userId: string): Promise<Either<Failure, UserReviewEntity[]>> {
    try {
      const models = await this.remote.getUserReviews(userId);
      const entities = models.map((m: UserReviewModel): UserReviewEntity => ({
        id: m.id,
        userId: m.user_id,
        businessId: m.business_id,
        businessName: m.business_name,
        overallRating: m.overall_rating,
        reviewText: m.review_text,
        photoUrls: m.photo_urls ?? [],
        createdAt: m.created_at?.toDate() ?? new Date(),
        likesCount: m.likes_count ?? 0,
        viewsCount: m.views_count ?? 0,
        status: (m.status as ReviewStatus | undefined) ?? 'pending',
      }));
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to fetch reviews'));
    }
  }

  async deleteReview(reviewId: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.deleteReview(reviewId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to delete review'));
    }
  }

  async getPendingReviews(): Promise<Either<Failure, UserReviewEntity[]>> {
    try {
      const models = await this.remote.getPendingReviews();
      const entities = models.map((m: UserReviewModel): UserReviewEntity => ({
        id: m.id,
        userId: m.user_id,
        businessId: m.business_id,
        businessName: m.business_name,
        overallRating: m.overall_rating,
        reviewText: m.review_text,
        photoUrls: m.photo_urls ?? [],
        createdAt: m.created_at?.toDate() ?? new Date(),
        likesCount: m.likes_count ?? 0,
        viewsCount: m.views_count ?? 0,
        status: (m.status as ReviewStatus | undefined) ?? 'pending',
      }));
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch pending reviews'));
    }
  }

  async getApprovedReviews(): Promise<Either<Failure, UserReviewEntity[]>> {
    try {
      const models = await this.remote.getApprovedReviews();
      const entities = models.map((m: UserReviewModel): UserReviewEntity => ({
        id: m.id,
        userId: m.user_id,
        businessId: m.business_id,
        businessName: m.business_name,
        overallRating: m.overall_rating,
        reviewText: m.review_text,
        photoUrls: m.photo_urls ?? [],
        createdAt: m.created_at?.toDate() ?? new Date(),
        likesCount: m.likes_count ?? 0,
        viewsCount: m.views_count ?? 0,
        status: (m.status as ReviewStatus | undefined) ?? 'posted',
      }));
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch approved reviews'));
    }
  }

  async getRejectedReviews(): Promise<Either<Failure, UserReviewEntity[]>> {
    try {
      const models = await this.remote.getRejectedReviews();
      const entities = models.map((m: UserReviewModel): UserReviewEntity => ({
        id: m.id,
        userId: m.user_id,
        businessId: m.business_id,
        businessName: m.business_name,
        overallRating: m.overall_rating,
        reviewText: m.review_text,
        photoUrls: m.photo_urls ?? [],
        createdAt: m.created_at?.toDate() ?? new Date(),
        likesCount: m.likes_count ?? 0,
        viewsCount: m.views_count ?? 0,
        status: (m.status as ReviewStatus | undefined) ?? 'removed',
      }));
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch rejected reviews'));
    }
  }

  async approveReview(reviewId: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.approveReview(reviewId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to approve review'));
    }
  }

  async rejectReview(reviewId: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.rejectReview(reviewId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to reject review'));
    }
  }
}
