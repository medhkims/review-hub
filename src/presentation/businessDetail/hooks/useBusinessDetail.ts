import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useBusinessDetailStore } from '../store/businessDetailStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useWishlistStore } from '@/presentation/wishlist/store/wishlistStore';
import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { useHomeStore } from '@/presentation/home/store/homeStore';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { container } from '@/core/di/container';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';
import { AnalyticsEvents, AnalyticsParams } from '@/core/analytics/analyticsKeys';

export const useBusinessDetail = (businessId: string) => {
  const {
    business,
    reviews,
    announcements,
    isLoading,
    error,
    reviewsError,
    setBusiness,
    setReviews,
    setAnnouncements,
    setLoading,
    setError,
    setReviewsError,
    setFavorite,
    reset,
  } = useBusinessDetailStore();

  const { user } = useAuthStore();
  const { role } = useRoleStore();
  const { isWishlisted, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlistStore();
  const addRecentlyViewed = useHomeStore((s) => s.addRecentlyViewed);
  const isMountedRef = useRef(true);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await container.getBusinessDetailUseCase.execute(businessId, role === 'admin');
    if (!isMountedRef.current) return;

    result.fold(
      (failure) => setError(failure.message),
      (detail) => {
        setBusiness(detail);
        addRecentlyViewed({
          id: detail.id,
          name: detail.name,
          description: detail.description,
          categoryId: detail.categoryId,
          categoryName: detail.categoryName,
          subCategories: detail.subCategories,
          location: detail.location,
          latitude: detail.latitude,
          longitude: detail.longitude,
          coverImageUrl: detail.coverImageUrl,
          logoUrl: detail.logoUrl,
          rating: detail.rating,
          reviewCount: detail.reviewCount,
          weeklyReviewCount: 0,
          isFeatured: false,
          isFavorite: detail.isFavorite,
          ownerId: detail.ownerId,
          status: detail.status,
          isOwnerVerified: detail.isOwnerVerified,
          openingHours: detail.openingHours as BusinessEntity['openingHours'],
          openingHoursVisible: detail.openingHoursVisible,
          createdAt: detail.createdAt,
          updatedAt: detail.updatedAt,
        });
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

    // Fetch announcements
    const announcementsResult = await container.getAnnouncementsUseCase.execute(businessId);
    if (!isMountedRef.current) return;
    announcementsResult.fold(
      () => {}, // silently ignore announcement errors
      (data) => setAnnouncements(data),
    );

    setLoading(false);
  }, [businessId, role, setBusiness, setReviews, setAnnouncements, setLoading, setError, setReviewsError, addRecentlyViewed]);

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

  const toggleWishlist = useCallback(async () => {
    if (!user || !business) return;
    const alreadySaved = isWishlisted(business.id);

    if (alreadySaved) {
      removeWishlistItem(business.id);
      AnalyticsHelper.sendEvent(AnalyticsEvents.REMOVE_FROM_WISHLIST, {
        [AnalyticsParams.BUSINESS_ID]: business.id,
        [AnalyticsParams.BUSINESS_NAME]: business.name,
      });
      await container.removeFromWishlistUseCase.execute(user.id, business.id);
    } else {
      const result = await container.addToWishlistUseCase.execute(user.id, {
        placeId: business.id,
        placeName: business.name,
        placeImageUrl: business.coverImageUrl,
        rating: business.rating,
        reviewCount: business.reviewCount,
        location: business.location,
      });
      result.fold(
        () => {},
        (newItem) => {
          addWishlistItem(newItem);
          AnalyticsHelper.sendEvent(AnalyticsEvents.ADD_TO_WISHLIST, {
            [AnalyticsParams.BUSINESS_ID]: business.id,
            [AnalyticsParams.BUSINESS_NAME]: business.name,
          });
        },
      );
    }
  }, [user, business, isWishlisted, removeWishlistItem, addWishlistItem]);

  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;
      fetchDetail();
      return () => {
        isMountedRef.current = false;
        reset();
      };
    }, [fetchDetail, reset]),
  );

  const checkHasReviewed = useCallback(async (): Promise<boolean> => {
    if (!user || !business) return false;
    const result = await container.getUserReviewsUseCase.execute(user.id);
    return result.fold(
      () => false,
      (userReviews) => userReviews.some((r) => r.businessId === business.id),
    );
  }, [user, business]);

  return {
    business,
    reviews,
    announcements,
    isLoading,
    error,
    reviewsError,
    toggleFavorite,
    toggleWishlist,
    isWishlisted,
    checkHasReviewed,
    refresh: fetchDetail,
  };
};
