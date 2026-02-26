import { FeedRepository } from '@/domain/feed/repositories/feedRepository';
import { PostEntity } from '@/domain/feed/entities/postEntity';
import { FeedRemoteDataSource } from '../datasources/feedRemoteDataSource';
import { FeedLocalDataSource } from '../datasources/feedLocalDataSource';
import { PostMapper } from '../mappers/postMapper';
import { NetworkInfo } from '@/core/network/networkInfo';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure, NetworkFailure } from '@/core/error/failures';
import { ServerException, NetworkException } from '@/core/error/exceptions';
import { auth } from '@/core/firebase/firebaseConfig';
import { Timestamp } from 'firebase/firestore';

const PAGE_SIZE = 20;

export class FeedRepositoryImpl implements FeedRepository {
  private lastDocTimestamp: Timestamp | undefined;

  constructor(
    private readonly remote: FeedRemoteDataSource,
    private readonly local: FeedLocalDataSource,
    private readonly network: NetworkInfo,
  ) {}

  async getPosts(page?: number): Promise<Either<Failure, PostEntity[]>> {
    const currentPage = page ?? 1;

    try {
      if (currentPage === 1) {
        this.lastDocTimestamp = undefined;
      }

      const models = await this.remote.getPosts(currentPage, PAGE_SIZE, this.lastDocTimestamp);

      if (models.length > 0) {
        this.lastDocTimestamp = models[models.length - 1].created_at;
      }

      const userId = auth.currentUser?.uid;
      const postIds = models.map((m) => m.id);
      const likedIds = userId && postIds.length > 0
        ? await this.remote.getLikedPostIds(userId, postIds)
        : new Set<string>();

      const entities = models.map((m) =>
        PostMapper.toEntity(m, likedIds.has(m.id))
      );

      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async createPost(content: string, imageUrl?: string): Promise<Either<Failure, PostEntity>> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return left(new ServerFailure('User must be authenticated to create a post'));
      }

      const model = await this.remote.createPost(
        currentUser.uid,
        currentUser.displayName || 'Anonymous',
        currentUser.photoURL || null,
        content,
        imageUrl,
      );

      const entity = PostMapper.toEntity(model, false);
      return right(entity);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to create post'));
    }
  }

  async likePost(postId: string): Promise<Either<Failure, void>> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return left(new ServerFailure('User must be authenticated to like a post'));
      }

      const isLiked = await this.remote.isPostLikedByUser(postId, currentUser.uid);

      if (isLiked) {
        await this.remote.unlikePost(postId, currentUser.uid);
      } else {
        await this.remote.likePost(postId, currentUser.uid);
      }

      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to toggle like'));
    }
  }
}
