import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';
import { BannerEntity } from '@/domain/banner/entities/bannerEntity';

interface HomeState {
  businesses: BusinessEntity[];
  newBusinesses: BusinessEntity[];
  recentSearches: BusinessEntity[];
  categories: CategoryEntity[];
  banners: BannerEntity[];
  selectedCategoryId: string | null;
  searchQuery: string;
  isLoading: boolean;
  isNewBusinessesLoading: boolean;
  isCategoryLoading: boolean;
  isBannersLoading: boolean;
  isFuzzySearching: boolean;
  fuzzyMatch: BusinessEntity | null;
  error: string | null;
  setBusinesses: (businesses: BusinessEntity[]) => void;
  setNewBusinesses: (businesses: BusinessEntity[]) => void;
  setRecentSearches: (businesses: BusinessEntity[]) => void;
  addRecentlyViewed: (business: BusinessEntity) => void;
  setCategories: (categories: CategoryEntity[]) => void;
  setBanners: (banners: BannerEntity[]) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setNewBusinessesLoading: (loading: boolean) => void;
  setCategoryLoading: (loading: boolean) => void;
  setBannersLoading: (loading: boolean) => void;
  setFuzzySearching: (loading: boolean) => void;
  setFuzzyMatch: (match: BusinessEntity | null) => void;
  setError: (error: string | null) => void;
  updateBusinessFavorite: (businessId: string, isFavorite: boolean) => void;
  reset: () => void;
}

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      businesses: [],
      newBusinesses: [],
      recentSearches: [],
      categories: [],
      banners: [],
      selectedCategoryId: null,
      searchQuery: '',
      isLoading: false,
      isNewBusinessesLoading: false,
      isCategoryLoading: false,
      isBannersLoading: false,
      isFuzzySearching: false,
      fuzzyMatch: null,
      error: null,
      setBusinesses: (businesses) => set({ businesses, error: null }),
      setNewBusinesses: (newBusinesses) => set({ newBusinesses }),
      setRecentSearches: (recentSearches) => set({ recentSearches }),
      addRecentlyViewed: (business) =>
        set((state) => {
          const filtered = state.recentSearches.filter((b) => b.id !== business.id);
          return { recentSearches: [business, ...filtered].slice(0, 5) };
        }),
      setCategories: (categories) => set({ categories }),
      setBanners: (banners) => set({ banners }),
      setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setLoading: (isLoading) => set({ isLoading }),
      setNewBusinessesLoading: (isNewBusinessesLoading) => set({ isNewBusinessesLoading }),
      setCategoryLoading: (isCategoryLoading) => set({ isCategoryLoading }),
      setBannersLoading: (isBannersLoading) => set({ isBannersLoading }),
      setFuzzySearching: (isFuzzySearching) => set({ isFuzzySearching }),
      setFuzzyMatch: (fuzzyMatch) => set({ fuzzyMatch }),
      setError: (error) => set({ error, isLoading: false }),
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
          newBusinesses: [],
          recentSearches: [],
          categories: [],
          banners: [],
          selectedCategoryId: null,
          searchQuery: '',
          isLoading: false,
          isNewBusinessesLoading: false,
          isCategoryLoading: false,
          isBannersLoading: false,
          isFuzzySearching: false,
          fuzzyMatch: null,
          error: null,
        }),
    }),
    {
      name: 'home-recent-searches',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    },
  ),
);
