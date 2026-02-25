import { useCallback, useEffect, useRef } from 'react';
import { useBusinessDetailStore } from '../store/businessDetailStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { container } from '@/core/di/container';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';
import { AnalyticsEvents, AnalyticsParams } from '@/core/analytics/analyticsKeys';

export const useBusinessDetail = (businessId: string) => {
  const {
    business,
    reviews,
    isLoading,
    error,
    reviewsError,
    setBusiness,
    setReviews,
    setLoading,
    setError,
    setReviewsError,
    setFavorite,
    reset,
  } = useBusinessDetailStore();

  const { user } = useAuthStore();
  const isMountedRef = useRef(true);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await container.getBusinessDetailUseCase.execute(businessId);
    if (!isMountedRef.current) return;

    result.fold(
      (failure) => setError(failure.message),
      (detail) => {
        setBusiness(detail);
        AnalyticsHelper.sendEvent(AnalyticsEvents.VIEW_BUSINESS, {
          [AnalyticsParams.BUSINESS_ID]: businessId,
          [AnalyticsParams.BUSINESS_NAME]: detail.name,
        });
      },
    );

    const reviewsResult = await container.getBusinessReviewsUseCase.execute(businessId);
    if (!isMountedRef.current) return;

    reviewsResult.fold(
      (failure) => setReviewsError(failure.message),
      (data) => setReviews(data),
    );

    setLoading(false);
  }, [businessId, setBusiness, setReviews, setLoading, setError, setReviewsError]);

  const toggleFavorite = useCallback(async () => {
    if (!user || !business) return;
    const newState = !business.isFavorite;
    setFavorite(newState);

    const result = await container.toggleFavoriteUseCase.execute(business.id, user.id);
    result.fold(
      () => setFavorite(!newState),
      (isFav) => {
        setFavorite(isFav);
        AnalyticsHelper.sendEvent(AnalyticsEvents.TOGGLE_FAVORITE, {
          [AnalyticsParams.BUSINESS_ID]: business.id,
          [AnalyticsParams.IS_FAVORITE]: isFav,
        });
      },
    );
  }, [user, business, setFavorite]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchDetail();
    return () => {
      isMountedRef.current = false;
      reset();
    };
  }, [businessId]);

  return {
    business,
    reviews,
    isLoading,
    error,
    reviewsError,
    toggleFavorite,
    refresh: fetchDetail,
  };
};
