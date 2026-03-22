import { BusinessRepository } from '../repositories/businessRepository';
import { ReplyEntity } from '../entities/commentEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class AddCommentReplyUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(commentId: string, reviewId: string, text: string, replyingToName?: string): Promise<Either<Failure, ReplyEntity>> {
    return this.businessRepository.addCommentReply(commentId, reviewId, text, replyingToName);
  }
}
