import { useCallback, useEffect } from 'react';
import { useBusinessDetailStore } from '../store/businessDetailStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { container } from '@/core/di/container';

export const useBusinessDetail = (businessId: string) => {
  const {
    business,
    reviews,
    isLoading,
    error,
    setBusiness,
    setReviews,
    setLoading,
    setError,
    setFavorite,
    reset,
  } = useBusinessDetailStore();

  const { user } = useAuthStore();

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await container.getBusinessDetailUseCase.execute(businessId);
    result.fold(
      (failure) => setError(failure.message),
      (detail) => setBusiness(detail),
    );

    const reviewsResult = await container.getBusinessReviewsUseCase.execute(businessId);
    reviewsResult.fold(
      () => {},
      (data) => setReviews(data),
    );

    setLoading(false);
  }, [businessId, setBusiness, setReviews, setLoading, setError]);

  const toggleFavorite = useCallback(async () => {
    if (!user || !business) return;
    const newState = !business.isFavorite;
    setFavorite(newState);

    const result = await container.toggleFavoriteUseCase.execute(business.id, user.id);
    result.fold(
      () => setFavorite(!newState),
      (isFav) => setFavorite(isFav),
    );
  }, [user, business, setFavorite]);

  useEffect(() => {
    fetchDetail();
    return () => reset();
  }, [businessId]);

  return {
    business,
    reviews,
    isLoading,
    error,
    toggleFavorite,
    refresh: fetchDetail,
  };
};
