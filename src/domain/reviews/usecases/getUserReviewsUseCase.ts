import { ReviewRepository } from '../repositories/reviewRepository';
import { UserReviewEntity } from '../entities/userReviewEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetUserReviewsUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(userId: string): Promise<Either<Failure, UserReviewEntity[]>> {
    return this.reviewRepository.getUserReviews(userId);
  }
}
