import { FeedRepository } from '../repositories/feedRepository';
import { PostEntity } from '../entities/postEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetPostsUseCase {
  constructor(private readonly feedRepository: FeedRepository) {}

  async execute(page?: number): Promise<Either<Failure, PostEntity[]>> {
    return this.feedRepository.getPosts(page);
  }
}
