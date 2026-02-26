import { ReviewRepository } from '@/domain/reviews/repositories/reviewRepository';
import { CreateReviewInput } from '@/domain/reviews/entities/createReviewInput';
import { ReviewRemoteDataSource } from '../datasources/reviewRemoteDataSource';
import { CreateReviewModel } from '../models/reviewModel';
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
}
