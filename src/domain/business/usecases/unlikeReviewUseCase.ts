import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UnlikeReviewUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(reviewId: string): Promise<Either<Failure, void>> {
    return this.businessRepository.unlikeReview(reviewId);
  }
}
