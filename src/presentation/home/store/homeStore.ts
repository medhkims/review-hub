import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';
import { BannerEntity } from '@/domain/banner/entities/bannerEntity';
import { RecentReviewEntity } from '@/domain/business/entities/recentReviewEntity';
import { DealEntity } from '@/domain/deals/entities/dealEntity';
import { WeeklyPickEntity } from '@/domain/weeklyPicks/entities/weeklyPickEntity';

interface HomeState {
  businesses: BusinessEntity[];
  nearbyBusinesses: BusinessEntity[];
  topRatedBusinesses: BusinessEntity[];
  popularCategoryBusinesses: BusinessEntity[];
  newBusinesses: BusinessEntity[];
  recentSearches: BusinessEntity[];
  categories: CategoryEntity[];
  banners: BannerEntity[];
  recentReviews: RecentReviewEntity[];
  deals: DealEntity[];
  weeklyPicks: WeeklyPickEntity[];
  userLocation: { latitude: number; longitude: number } | null;
  mostViewedCategoryId: string | null;
  selectedCategoryId: string | null;
  searchQuery: string;
  isLoading: boolean;
  isNewBusinessesLoading: boolean;
  isCategoryLoading: boolean;
  isBannersLoading: boolean;
  isFuzzySearching: boolean;
  fuzzyMatch: BusinessEntity | null;
  homeStats: { totalBusinesses: number; totalReviews: number } | null;
  error: string | null;
  setBusinesses: (businesses: BusinessEntity[]) => void;
  setNearbyBusinesses: (businesses: BusinessEntity[]) => void;
  setTopRatedBusinesses: (businesses: BusinessEntity[]) => void;
  setPopularCategoryBusinesses: (businesses: BusinessEntity[]) => void;
  setNewBusinesses: (businesses: BusinessEntity[]) => void;
  setRecentSearches: (businesses: BusinessEntity[]) => void;
  addRecentlyViewed: (business: BusinessEntity) => void;
  setCategories: (categories: CategoryEntity[]) => void;
  setBanners: (banners: BannerEntity[]) => void;
  setRecentReviews: (reviews: RecentReviewEntity[]) => void;
  setDeals: (deals: DealEntity[]) => void;
  setWeeklyPicks: (picks: WeeklyPickEntity[]) => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  setMostViewedCategoryId: (id: string | null) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setNewBusinessesLoading: (loading: boolean) => void;
  setCategoryLoading: (loading: boolean) => void;
  setBannersLoading: (loading: boolean) => void;
  setFuzzySearching: (loading: boolean) => void;
  setFuzzyMatch: (match: BusinessEntity | null) => void;
  setHomeStats: (stats: { totalBusinesses: number; totalReviews: number }) => void;
  setError: (error: string | null) => void;
  updateBusinessFavorite: (businessId: string, isFavorite: boolean) => void;
  /** Write all home data in one Zustand call → single re-render */
  setHomeData: (data: {
    categories?: CategoryEntity[];
    banners?: BannerEntity[];
    newBusinesses?: BusinessEntity[];
    topRatedBusinesses?: BusinessEntity[];
    recentReviews?: RecentReviewEntity[];
    deals?: DealEntity[];
    weeklyPicks?: WeeklyPickEntity[];
    homeStats?: { totalBusinesses: number; totalReviews: number };
    businesses?: BusinessEntity[];
  }) => void;
  reset: () => void;
}

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      businesses: [],
      nearbyBusinesses: [],
      topRatedBusinesses: [],
      popularCategoryBusinesses: [],
      newBusinesses: [],
      recentSearches: [],
      categories: [],
      banners: [],
      recentReviews: [],
      deals: [],
      weeklyPicks: [],
      userLocation: null,
      mostViewedCategoryId: null,
      selectedCategoryId: null,
      searchQuery: '',
      isLoading: false,
      isNewBusinessesLoading: false,
      isCategoryLoading: false,
      isBannersLoading: false,
      isFuzzySearching: false,
      fuzzyMatch: null,
      homeStats: null,
      error: null,
      setBusinesses: (businesses) => set({ businesses, error: null }),
      setNearbyBusinesses: (nearbyBusinesses) => set({ nearbyBusinesses }),
      setTopRatedBusinesses: (topRatedBusinesses) => set({ topRatedBusinesses }),
      setPopularCategoryBusinesses: (popularCategoryBusinesses) => set({ popularCategoryBusinesses }),
      setNewBusinesses: (newBusinesses) => set({ newBusinesses }),
      setRecentSearches: (recentSearches) => set({ recentSearches }),
      addRecentlyViewed: (business) =>
        set((state) => {
          const filtered = state.recentSearches.filter((b) => b.id !== business.id);
          // Track which category the user views most
          const categoryCount: Record<string, number> = {};
          [business, ...filtered].forEach((b) => {
            categoryCount[b.categoryId] = (categoryCount[b.categoryId] || 0) + 1;
          });
          const topCategoryId = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
          return {
            recentSearches: [business, ...filtered].slice(0, 10),
            mostViewedCategoryId: topCategoryId,
          };
        }),
      setCategories: (categories) => set({ categories }),
      setBanners: (banners) => set({ banners }),
      setRecentReviews: (recentReviews) => set({ recentReviews }),
      setDeals: (deals) => set({ deals }),
      setWeeklyPicks: (weeklyPicks) => set({ weeklyPicks }),
      setUserLocation: (userLocation) => set({ userLocation }),
      setMostViewedCategoryId: (mostViewedCategoryId) => set({ mostViewedCategoryId }),
      setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setLoading: (isLoading) => set({ isLoading }),
      setNewBusinessesLoading: (isNewBusinessesLoading) => set({ isNewBusinessesLoading }),
      setCategoryLoading: (isCategoryLoading) => set({ isCategoryLoading }),
      setBannersLoading: (isBannersLoading) => set({ isBannersLoading }),
      setFuzzySearching: (isFuzzySearching) => set({ isFuzzySearching }),
      setFuzzyMatch: (fuzzyMatch) => set({ fuzzyMatch }),
      setHomeStats: (homeStats) => set({ homeStats }),
      setError: (error) => set({ error, isLoading: false }),
      setHomeData: (data) => set({ ...data, isCategoryLoading: false, isNewBusinessesLoading: false }),
      updateBusinessFavorite: (businessId, isFavorite) =>
        set((state) => ({
          businesses: state.businesses.map((b) =>
            b.id === businessId ? { ...b, isFavorite } : b
          ),
          newBusinesses: state.newBusinesses.map((b) =>
            b.id === businessId ? { ...b, isFavorite } : b
          ),
        })),
      reset: () =>
        set({
          businesses: [],
          nearbyBusinesses: [],
          topRatedBusinesses: [],
          popularCategoryBusinesses: [],
          newBusinesses: [],
          recentSearches: [],
          categories: [],
          banners: [],
          recentReviews: [],
          deals: [],
          weeklyPicks: [],
          userLocation: null,
          mostViewedCategoryId: null,
          selectedCategoryId: null,
          searchQuery: '',
          isLoading: false,
          isNewBusinessesLoading: false,
          isCategoryLoading: false,
          isBannersLoading: false,
          isFuzzySearching: false,
          fuzzyMatch: null,
          homeStats: null,
          error: null,
        }),
    }),
    {
      name: 'home-cache-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        mostViewedCategoryId: state.mostViewedCategoryId,
        categories: state.categories,
        banners: state.banners,
        newBusinesses: state.newBusinesses,
        topRatedBusinesses: state.topRatedBusinesses,
        businesses: state.businesses,
        homeStats: state.homeStats,
        recentReviews: state.recentReviews,
        deals: state.deals,
        weeklyPicks: state.weeklyPicks,
      }),
    },
  ),
);
