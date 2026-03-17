import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { UserReviewEntity } from '@/domain/reviews/entities/userReviewEntity';
import { container } from '@/core/di/container';

export type ReviewTab = 'posted' | 'pending' | 'removed' | 'declined';

interface MyReviewsState {
  reviews: UserReviewEntity[];
  isLoading: boolean;
  error: string | null;
}

export const useMyReviews = () => {
  const { user } = useAuthStore();
  const [state, setState] = useState<MyReviewsState>({
    reviews: [],
    isLoading: false,
    error: null,
  });
  const [activeTab, setActiveTab] = useState<ReviewTab>('posted');

  const fetchReviews = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const result = await container.getUserReviewsUseCase.execute(user.id);

    result.fold(
      (failure) => setState({ reviews: [], isLoading: false, error: failure.message }),
      (reviews) => setState({ reviews, isLoading: false, error: null }),
    );
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [fetchReviews]),
  );

  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    const result = await container.deleteReviewUseCase.execute(reviewId);
    return result.fold(
      () => false,
      () => {
        // Soft-delete: update status locally so it moves to the Removed tab
        setState((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === reviewId ? { ...r, status: 'removed' as const } : r,
          ),
        }));
        return true;
      },
    );
  }, []);

  const filteredReviews = state.reviews.filter((r) => r.status === activeTab);

  const stats = {
    reviews: filteredReviews.length,
    likes: filteredReviews.reduce((sum, r) => sum + r.likesCount, 0),
    seen: filteredReviews.reduce((sum, r) => sum + r.viewsCount, 0),
  };

  const tabCounts = {
    posted: state.reviews.filter((r) => r.status === 'posted').length,
    pending: state.reviews.filter((r) => r.status === 'pending').length,
    removed: state.reviews.filter((r) => r.status === 'removed').length,
    declined: state.reviews.filter((r) => r.status === 'declined').length,
  };

  return {
    reviews: filteredReviews,
    isLoading: state.isLoading,
    error: state.error,
    stats,
    tabCounts,
    activeTab,
    setActiveTab,
    refetch: fetchReviews,
    deleteReview,
  };
};
