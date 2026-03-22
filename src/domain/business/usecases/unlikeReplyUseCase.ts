import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UnlikeReplyUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(replyId: string): Promise<Either<Failure, void>> {
    return this.businessRepository.unlikeReply(replyId);
  }
}
