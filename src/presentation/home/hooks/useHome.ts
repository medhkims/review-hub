import { useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
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
    nearbyBusinesses,
    topRatedBusinesses,
    popularCategoryBusinesses,
    newBusinesses,
    recentSearches,
    categories,
    banners,
    recentReviews,
    deals,
    weeklyPicks,
    userLocation,
    mostViewedCategoryId,
    selectedCategoryId,
    searchQuery,
    isLoading,
    isNewBusinessesLoading,
    isCategoryLoading,
    isBannersLoading,
    isFuzzySearching,
    fuzzyMatch,
    homeStats,
    error,
    setBusinesses,
    setNearbyBusinesses,
    setTopRatedBusinesses,
    setPopularCategoryBusinesses,
    setNewBusinesses,
    addRecentlyViewed,
    setCategories,
    setBanners,
    setRecentReviews,
    setDeals,
    setWeeklyPicks,
    setUserLocation,
    setSelectedCategoryId,
    setSearchQuery,
    setLoading,
    setNewBusinessesLoading,
    setCategoryLoading,
    setBannersLoading,
    setFuzzySearching,
    setFuzzyMatch,
    setHomeStats,
    setError,
    updateBusinessFavorite,
  } = useHomeStore();
  const { user } = useAuthStore();
  const { role } = useRoleStore();
  const { items: wishlistItems, isWishlisted: storeIsWishlisted, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlistStore();

  // Re-create isWishlisted whenever items change so renderItem's useCallback
  // invalidates and FlatList cells actually re-render with the updated heart state.
  const isWishlisted = useCallback((id: string) => storeIsWishlisted(id), [wishlistItems]);
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

  const loadRecentReviews = useCallback(async () => {
    const result = await container.getRecentReviewsUseCase.execute(8);
    result.fold(
      () => {},
      (data) => setRecentReviews(data),
    );
  }, [setRecentReviews]);

  const loadDeals = useCallback(async () => {
    const result = await container.getActiveDealsUseCase.execute();
    result.fold(
      () => {},
      (data) => setDeals(data),
    );
  }, [setDeals]);

  const loadWeeklyPicks = useCallback(async () => {
    const result = await container.getWeeklyPicksUseCase.execute();
    result.fold(
      () => {},
      (data) => setWeeklyPicks(data),
    );
  }, [setWeeklyPicks]);

  const loadHomeStats = useCallback(async () => {
    const result = await container.getHomeStatsUseCase.execute();
    result.fold(
      () => {},
      (data) => setHomeStats(data),
    );
  }, [setHomeStats]);

  const loadTopRatedBusinesses = useCallback(async () => {
    const result = await container.getTopRatedBusinessesUseCase.execute();
    result.fold(
      () => {},
      (data) => setTopRatedBusinesses(data),
    );
  }, [setTopRatedBusinesses]);

  const loadPopularByCategory = useCallback(async (categoryId: string) => {
    const result = await container.getPopularByCategoryUseCase.execute(categoryId);
    result.fold(
      () => {},
      (data) => setPopularCategoryBusinesses(data),
    );
  }, [setPopularCategoryBusinesses]);

  const loadNearbyBusinesses = useCallback(async (lat: number, lng: number) => {
    const result = await container.getNearbyBusinessesUseCase.execute(lat, lng, 10);
    result.fold(
      () => {},
      (data) => setNearbyBusinesses(data),
    );
  }, [setNearbyBusinesses]);

  const requestUserLocation = useCallback(async () => {
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(coords);
      loadNearbyBusinesses(coords.latitude, coords.longitude);
    } catch {
      // Location not available — silently skip
    }
  }, [setUserLocation, loadNearbyBusinesses]);

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
      // Optimistic update — turn heart red immediately
      addWishlistItem({
        id: business.id,
        userId: user.id,
        placeId: business.id,
        placeName: business.name,
        placeImageUrl: business.coverImageUrl ?? null,
        rating: business.rating,
        reviewCount: business.reviewCount,
        location: business.location ?? '',
        addedAt: new Date(),
      });

      const result = await container.addToWishlistUseCase.execute(user.id, {
        placeId: business.id,
        placeName: business.name,
        placeImageUrl: business.coverImageUrl,
        rating: business.rating,
        reviewCount: business.reviewCount,
        location: business.location,
      });
      result.fold(
        (failure) => {
          // Rollback on failure
          removeWishlistItem(business.id);
          setError(failure.message);
        },
        () => {
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
      // Fire all independent data fetches in parallel for faster load
      Promise.all([
        loadBanners(),
        loadCategories(),
        loadNewBusinesses(),
        loadRecentReviews(),
        loadDeals(),
        loadWeeklyPicks(),
        loadHomeStats(),
        loadTopRatedBusinesses(),
        // Always load nearby — uses absolute fallback if location unavailable
        loadNearbyBusinesses(36.8, 10.18),
        requestUserLocation(),
      ]);
      // Load popular businesses for user's most viewed category
      if (mostViewedCategoryId) {
        loadPopularByCategory(mostViewedCategoryId);
      }
      if (searchQueryRef.current.trim()) return; // keep existing search results
      if (selectedCategoryId) {
        loadBusinessesByCategory(selectedCategoryId);
      } else {
        loadFeaturedBusinesses();
      }
    }, [loadBanners, loadCategories, loadNewBusinesses, loadRecentReviews, loadDeals, loadWeeklyPicks, loadHomeStats, loadTopRatedBusinesses, loadNearbyBusinesses, requestUserLocation, loadFeaturedBusinesses, loadBusinessesByCategory, loadPopularByCategory, mostViewedCategoryId, selectedCategoryId]),
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
    loadRecentReviews();
    loadDeals();
    loadWeeklyPicks();
  }, [search, selectedCategoryId, loadBusinessesByCategory, loadFeaturedBusinesses, loadRecentReviews, loadDeals, loadWeeklyPicks]);

  return {
    businesses,
    nearbyBusinesses,
    topRatedBusinesses,
    popularCategoryBusinesses,
    newBusinesses,
    recentSearches,
    categories,
    banners,
    recentReviews,
    deals,
    weeklyPicks,
    userLocation,
    mostViewedCategoryId,
    selectedCategoryId,
    searchQuery,
    isLoading,
    isNewBusinessesLoading,
    isCategoryLoading,
    isBannersLoading,
    isFuzzySearching,
    fuzzyMatch,
    homeStats,
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
