import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { CreateReviewInput } from '../entities/createReviewInput';
import { UserReviewEntity } from '../entities/userReviewEntity';

export interface ReviewRepository {
  createReview(userId: string, input: CreateReviewInput): Promise<Either<Failure, string>>;
  getUserReviews(userId: string): Promise<Either<Failure, UserReviewEntity[]>>;
  deleteReview(reviewId: string): Promise<Either<Failure, void>>;
  getPendingReviews(): Promise<Either<Failure, UserReviewEntity[]>>;
  getApprovedReviews(): Promise<Either<Failure, UserReviewEntity[]>>;
  getRejectedReviews(): Promise<Either<Failure, UserReviewEntity[]>>;
  approveReview(reviewId: string): Promise<Either<Failure, void>>;
  rejectReview(reviewId: string): Promise<Either<Failure, void>>;
}
