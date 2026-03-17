import { useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useHomeStore } from '../store/homeStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useWishlistStore } from '@/presentation/wishlist/store/wishlistStore';
import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { container } from '@/core/di/container';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';
import { AnalyticsEvents, AnalyticsParams } from '@/core/analytics/analyticsKeys';
import { SubmitBusinessParams } from '@/domain/business/repositories/businessRepository';
import { trackKeywordEvent } from '@/core/utils/premiumTracking';


export const useHome = () => {
  const {
    businesses,
    newBusinesses,
    recentSearches,
    categories,
    banners,
    selectedCategoryId,
    searchQuery,
    isLoading,
    isNewBusinessesLoading,
    isCategoryLoading,
    isBannersLoading,
    isFuzzySearching,
    fuzzyMatch,
    error,
    setBusinesses,
    setNewBusinesses,
    addRecentlyViewed,
    setCategories,
    setBanners,
    setSelectedCategoryId,
    setSearchQuery,
    setLoading,
    setNewBusinessesLoading,
    setCategoryLoading,
    setBannersLoading,
    setFuzzySearching,
    setFuzzyMatch,
    setError,
    updateBusinessFavorite,
  } = useHomeStore();
  const { user } = useAuthStore();
  const { role } = useRoleStore();
  const { isWishlisted, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlistStore();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref so useFocusEffect always reads the latest searchQuery without it as a dependency
  const searchQueryRef = useRef(searchQuery);
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);

  const loadBanners = useCallback(async () => {
    setBannersLoading(true);
    const result = await container.getBannersUseCase.execute();
    result.fold(
      () => setBannersLoading(false),
      (data) => setBanners(data),
    );
    setBannersLoading(false);
  }, [setBannersLoading, setBanners]);

  const loadCategories = useCallback(async () => {
    setCategoryLoading(true);
    const result = await container.getActiveCategoriesUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (data) => setCategories(data),
    );
    setCategoryLoading(false);
  }, [setCategoryLoading, setError, setCategories]);

  const loadNewBusinesses = useCallback(async () => {
    setNewBusinessesLoading(true);
    const result = await container.getNewBusinessesUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (data) => setNewBusinesses(data),
    );
    setNewBusinessesLoading(false);
  }, [setNewBusinessesLoading, setError, setNewBusinesses]);

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
    setFuzzyMatch(null);
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
      if (role !== 'admin') {
        container.incrementGlobalSearchCountUseCase.execute();
      }
      const result = await container.searchBusinessesUseCase.execute(query, selectedCategoryId);
      let errorMsg: string | null = null;
      let data: BusinessEntity[] = [];
      result.fold(
        (failure) => { errorMsg = failure.message; },
        (items) => { data = items; },
      );
      if (errorMsg) {
        setError(errorMsg);
        setLoading(false);
        return;
      }
      setBusinesses(data);
      setLoading(false);
      // Track keyword find-events (business appeared in search results)
      data.slice(0, 10).forEach(biz => trackKeywordEvent(biz.id, query, false));
      // When exact search returns nothing, attempt fuzzy matching
      if (data.length === 0) {
        setFuzzySearching(true);
        const fuzzyResult = await container.fuzzySearchBusinessUseCase.execute(
          query,
          selectedCategoryId,
        );
        fuzzyResult.fold(
          () => setFuzzyMatch(null),
          (match) => setFuzzyMatch(match),
        );
        setFuzzySearching(false);
      }
    }, 500);
  }, [role, selectedCategoryId, loadBusinessesByCategory, loadFeaturedBusinesses, setSearchQuery, setLoading, setError, setBusinesses, setFuzzyMatch, setFuzzySearching]);

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

  // Refresh every time this screen comes into focus so ratings (and other
  // fields updated after review submissions) are always up-to-date.
  // If the user has an active search query we do NOT overwrite the business
  // list — that would replace search results with featured businesses while
  // the search bar still shows the query, causing wrong results to appear.
  useFocusEffect(
    useCallback(() => {
      loadBanners();
      loadCategories();
      loadNewBusinesses();
      if (searchQueryRef.current.trim()) return; // keep existing search results
      if (selectedCategoryId) {
        loadBusinessesByCategory(selectedCategoryId);
      } else {
        loadFeaturedBusinesses();
      }
    }, [loadBanners, loadCategories, loadNewBusinesses, loadFeaturedBusinesses, loadBusinessesByCategory, selectedCategoryId]),
  );

  const submitBusiness = useCallback(
    async (params: SubmitBusinessParams): Promise<string | null> => {
      const result = await container.submitBusinessUseCase.execute(params);
      return result.fold(
        (failure) => { setError(failure.message); return null; },
        (id) => id,
      );
    },
    [setError],
  );

  const checkBusinessDuplicate = useCallback(
    (name: string, categoryId: string) =>
      container.checkBusinessDuplicateUseCase.execute(name, categoryId),
    [],
  );

  const refresh = useCallback(async () => {
    if (searchQueryRef.current.trim()) {
      // Re-run the current search instead of loading featured businesses
      search(searchQueryRef.current);
    } else if (selectedCategoryId) {
      await loadBusinessesByCategory(selectedCategoryId);
    } else {
      await loadFeaturedBusinesses();
    }
  }, [search, selectedCategoryId, loadBusinessesByCategory, loadFeaturedBusinesses]);

  return {
    businesses,
    newBusinesses,
    recentSearches,
    categories,
    banners,
    selectedCategoryId,
    searchQuery,
    isLoading,
    isNewBusinessesLoading,
    isCategoryLoading,
    isBannersLoading,
    isFuzzySearching,
    fuzzyMatch,
    error,
    isWishlisted,
    selectCategory,
    search,
    toggleFavorite,
    toggleWishlist,
    addRecentlyViewed,
    submitBusiness,
    checkBusinessDuplicate,
    refresh,
    refreshNewBusinesses: loadNewBusinesses,
  };
};
