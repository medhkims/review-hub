import { useCallback, useEffect } from 'react';
import { useFeedStore } from '../store/feedStore';

// TODO: Use container use cases when wired in DI container
import { FeedRemoteDataSourceImpl } from '@/data/feed/datasources/feedRemoteDataSource';
import { FeedLocalDataSourceImpl } from '@/data/feed/datasources/feedLocalDataSource';
import { FeedRepositoryImpl } from '@/data/feed/repositories/feedRepositoryImpl';
import { NetworkInfoImpl } from '@/core/network/networkInfo';
import { GetPostsUseCase } from '@/domain/feed/usecases/getPostsUseCase';
import { LikePostUseCase } from '@/domain/feed/usecases/likePostUseCase';

const remote = new FeedRemoteDataSourceImpl();
const local = new FeedLocalDataSourceImpl();
const network = new NetworkInfoImpl();
const repo = new FeedRepositoryImpl(remote, local, network);
const getPostsUseCase = new GetPostsUseCase(repo);
const likePostUseCase = new LikePostUseCase(repo);

export const useFeed = () => {
  const {
    posts,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    currentPage,
    setPosts,
    appendPosts,
    updatePost,
    setLoading,
    setRefreshing,
    setError,
    setHasMore,
    incrementPage,
  } = useFeedStore();

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getPostsUseCase.execute(1);

    result.fold(
      (failure) => setError(failure.message),
      (data) => {
        setPosts(data);
        setHasMore(data.length >= 20);
      },
    );
    setLoading(false);
  }, [setLoading, setError, setPosts, setHasMore]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const nextPage = currentPage + 1;
    setLoading(true);

    const result = await getPostsUseCase.execute(nextPage);

    result.fold(
      (failure) => setError(failure.message),
      (data) => {
        appendPosts(data);
        setHasMore(data.length >= 20);
        incrementPage();
      },
    );
    setLoading(false);
  }, [hasMore, isLoading, currentPage, setLoading, setError, appendPosts, setHasMore, incrementPage]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    const result = await getPostsUseCase.execute(1);

    result.fold(
      (failure) => setError(failure.message),
      (data) => {
        setPosts(data);
        setHasMore(data.length >= 20);
      },
    );
    setRefreshing(false);
  }, [setRefreshing, setError, setPosts, setHasMore]);

  const toggleLike = useCallback(async (postId: string) => {
    // Find the current post
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    const wasLiked = post.isLiked;
    updatePost(postId, {
      isLiked: !wasLiked,
      likesCount: wasLiked ? post.likesCount - 1 : post.likesCount + 1,
    });

    const result = await likePostUseCase.execute(postId);

    result.fold(
      (_failure) => {
        // Rollback on failure
        updatePost(postId, {
          isLiked: wasLiked,
          likesCount: post.likesCount,
        });
      },
      () => {
        // Success — store is already updated optimistically
      },
    );
  }, [posts, updatePost]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    toggleLike,
  };
};
