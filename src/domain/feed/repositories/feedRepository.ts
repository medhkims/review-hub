import { PostEntity } from '../entities/postEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface FeedRepository {
  getPosts(page?: number): Promise<Either<Failure, PostEntity[]>>;
  createPost(content: string, imageUrl?: string): Promise<Either<Failure, PostEntity>>;
  likePost(postId: string): Promise<Either<Failure, void>>;
}
