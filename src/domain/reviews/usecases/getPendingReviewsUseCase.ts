import { ReviewRepository } from '../repositories/reviewRepository';
import { UserReviewEntity } from '../entities/userReviewEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetPendingReviewsUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  execute(): Promise<Either<Failure, UserReviewEntity[]>> {
    return this.reviewRepository.getPendingReviews();
  }
}
