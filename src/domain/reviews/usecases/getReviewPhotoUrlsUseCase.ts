import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { ReviewRepository } from '../repositories/reviewRepository';

export class GetReviewPhotoUrlsUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  execute(reviewId: string): Promise<Either<Failure, string[]>> {
    return this.reviewRepository.getReviewPhotoUrls(reviewId);
  }
}
