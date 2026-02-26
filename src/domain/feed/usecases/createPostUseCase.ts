import { FeedRepository } from '../repositories/feedRepository';
import { PostEntity } from '../entities/postEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class CreatePostUseCase {
  constructor(private readonly feedRepository: FeedRepository) {}

  async execute(content: string, imageUrl?: string): Promise<Either<Failure, PostEntity>> {
    return this.feedRepository.createPost(content, imageUrl);
  }
}
