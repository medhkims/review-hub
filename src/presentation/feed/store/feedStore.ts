import { create } from 'zustand';
import { PostEntity } from '@/domain/feed/entities/postEntity';

interface FeedState {
  posts: PostEntity[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  setPosts: (posts: PostEntity[]) => void;
  appendPosts: (posts: PostEntity[]) => void;
  updatePost: (postId: string, updates: Partial<PostEntity>) => void;
  setLoading: (isLoading: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  incrementPage: () => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  setPosts: (posts) => set({ posts, error: null, currentPage: 1 }),
  appendPosts: (posts) =>
    set((state) => ({
      posts: [...state.posts, ...posts],
      error: null,
    })),
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, ...updates } : p
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  setError: (error) => set({ error, isLoading: false, isRefreshing: false }),
  setHasMore: (hasMore) => set({ hasMore }),
  incrementPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),
  reset: () =>
    set({
      posts: [],
      isLoading: false,
      isRefreshing: false,
      error: null,
      hasMore: true,
      currentPage: 1,
    }),
}));
