import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class LikeCommentUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(commentId: string): Promise<Either<Failure, void>> {
    return this.businessRepository.likeComment(commentId);
  }
}
