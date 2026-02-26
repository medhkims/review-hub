import { ReviewRepository } from '../repositories/reviewRepository';
import { CreateReviewInput } from '../entities/createReviewInput';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class CreateReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(userId: string, input: CreateReviewInput): Promise<Either<Failure, string>> {
    return this.reviewRepository.createReview(userId, input);
  }
}
