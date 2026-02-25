import { useCallback, useEffect, useRef } from 'react';
import { useHomeStore } from '../store/homeStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useWishlistStore } from '@/presentation/wishlist/store/wishlistStore';
import { container } from '@/core/di/container';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';
import { AnalyticsEvents, AnalyticsParams } from '@/core/analytics/analyticsKeys';

export const useHome = () => {
  const {
    businesses,
    categories,
    selectedCategoryId,
    searchQuery,
    isLoading,
    isCategoryLoading,
    error,
    setBusinesses,
    setCategories,
    setSelectedCategoryId,
    setSearchQuery,
    setLoading,
    setCategoryLoading,
    setError,
    updateBusinessFavorite,
  } = useHomeStore();
  const { user } = useAuthStore();
  const { isWishlisted, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlistStore();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCategories = useCallback(async () => {
    setCategoryLoading(true);
    const result = await container.getCategoriesUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (data) => setCategories(data),
    );
    setCategoryLoading(false);
  }, [setCategoryLoading, setError, setCategories]);

  const loadFeaturedBusinesses = useCallback(async () => {
    setLoading(true);
    const result = await container.getFeaturedBusinessesUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (data) => setBusinesses(data),
    );
    setLoading(false);
  }, [setLoading, setError, setBusinesses]);

  const loadBusinessesByCategory = useCallback(async (categoryId: string) => {
    setLoading(true);
    const result = await container.getBusinessesByCategoryUseCase.execute(categoryId);
    result.fold(
      (failure) => setError(failure.message),
      (data) => setBusinesses(data),
    );
    setLoading(false);
  }, [setLoading, setError, setBusinesses]);

  const selectCategory = useCallback(async (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    if (categoryId) {
      AnalyticsHelper.sendEvent(AnalyticsEvents.SELECT_CATEGORY, {
        [AnalyticsParams.CATEGORY_ID]: categoryId,
      });
      await loadBusinessesByCategory(categoryId);
    } else {
      AnalyticsHelper.sendEvent(AnalyticsEvents.CLEAR_CATEGORY);
      await loadFeaturedBusinesses();
    }
  }, [setSelectedCategoryId, loadBusinessesByCategory, loadFeaturedBusinesses]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (!query.trim()) {
      if (selectedCategoryId) {
        loadBusinessesByCategory(selectedCategoryId);
      } else {
        loadFeaturedBusinesses();
      }
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      AnalyticsHelper.sendEvent(AnalyticsEvents.SEARCH, {
        [AnalyticsParams.SEARCH_QUERY]: query,
      });
      const result = await container.searchBusinessesUseCase.execute(query);
      result.fold(
        (failure) => setError(failure.message),
        (data) => setBusinesses(data),
      );
      setLoading(false);
    }, 500);
  }, [selectedCategoryId, loadBusinessesByCategory, loadFeaturedBusinesses, setSearchQuery, setLoading, setError, setBusinesses]);

  const toggleFavorite = useCallback(async (businessId: string) => {
    if (!user) return;
    const result = await container.toggleFavoriteUseCase.execute(businessId, user.id);
    result.fold(
      (failure) => setError(failure.message),
      (isFavorite) => {
        updateBusinessFavorite(businessId, isFavorite);
        AnalyticsHelper.sendEvent(AnalyticsEvents.TOGGLE_FAVORITE, {
          [AnalyticsParams.BUSINESS_ID]: businessId,
          [AnalyticsParams.IS_FAVORITE]: isFavorite,
        });
      },
    );
  }, [user, setError, updateBusinessFavorite]);

  const toggleWishlist = useCallback(async (business: BusinessEntity) => {
    if (!user) return;
    const alreadySaved = isWishlisted(business.id);

    if (alreadySaved) {
      // Remove: itemId == placeId (document ID = placeId)
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
        (failure) => setError(failure.message),
        (newItem) => {
          addWishlistItem(newItem);
          AnalyticsHelper.sendEvent(AnalyticsEvents.ADD_TO_WISHLIST, {
            [AnalyticsParams.BUSINESS_ID]: business.id,
            [AnalyticsParams.BUSINESS_NAME]: business.name,
          });
        },
      );
    }
  }, [user, isWishlisted, removeWishlistItem, addWishlistItem, setError]);

  useEffect(() => {
    loadCategories();
    loadFeaturedBusinesses();
  }, [loadCategories, loadFeaturedBusinesses]);

  return {
    businesses,
    categories,
    selectedCategoryId,
    searchQuery,
    isLoading,
    isCategoryLoading,
    error,
    isWishlisted,
    selectCategory,
    search,
    toggleFavorite,
    toggleWishlist,
    refresh: loadFeaturedBusinesses,
  };
};
