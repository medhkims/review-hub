import { FeedRepository } from '../repositories/feedRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class LikePostUseCase {
  constructor(private readonly feedRepository: FeedRepository) {}

  async execute(postId: string): Promise<Either<Failure, void>> {
    return this.feedRepository.likePost(postId);
  }
}
