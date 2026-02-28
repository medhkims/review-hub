import { create } from 'zustand';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';

interface HomeState {
  businesses: BusinessEntity[];
  newBusinesses: BusinessEntity[];
  recentSearches: BusinessEntity[];
  categories: CategoryEntity[];
  selectedCategoryId: string | null;
  searchQuery: string;
  isLoading: boolean;
  isNewBusinessesLoading: boolean;
  isCategoryLoading: boolean;
  error: string | null;
  setBusinesses: (businesses: BusinessEntity[]) => void;
  setNewBusinesses: (businesses: BusinessEntity[]) => void;
  setRecentSearches: (businesses: BusinessEntity[]) => void;
  setCategories: (categories: CategoryEntity[]) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setNewBusinessesLoading: (loading: boolean) => void;
  setCategoryLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateBusinessFavorite: (businessId: string, isFavorite: boolean) => void;
  reset: () => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  businesses: [],
  newBusinesses: [],
  recentSearches: [],
  categories: [],
  selectedCategoryId: null,
  searchQuery: '',
  isLoading: false,
  isNewBusinessesLoading: false,
  isCategoryLoading: false,
  error: null,
  setBusinesses: (businesses) => set({ businesses, error: null }),
  setNewBusinesses: (newBusinesses) => set({ newBusinesses }),
  setRecentSearches: (recentSearches) => set({ recentSearches }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  setNewBusinessesLoading: (isNewBusinessesLoading) => set({ isNewBusinessesLoading }),
  setCategoryLoading: (isCategoryLoading) => set({ isCategoryLoading }),
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
      selectedCategoryId: null,
      searchQuery: '',
      isLoading: false,
      isNewBusinessesLoading: false,
      isCategoryLoading: false,
      error: null,
    }),
}));
