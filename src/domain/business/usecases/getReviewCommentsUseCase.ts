import { BusinessRepository } from '../repositories/businessRepository';
import { CommentEntity } from '../entities/commentEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetReviewCommentsUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(reviewId: string): Promise<Either<Failure, CommentEntity[]>> {
    return this.businessRepository.getReviewComments(reviewId);
  }
}
