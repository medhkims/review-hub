import { ReviewRepository } from '../repositories/reviewRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class DeleteReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(reviewId: string): Promise<Either<Failure, void>> {
    return this.reviewRepository.deleteReview(reviewId);
  }
}
