import { create } from 'zustand';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';

interface HomeState {
  businesses: BusinessEntity[];
  categories: CategoryEntity[];
  selectedCategoryId: string | null;
  searchQuery: string;
  isLoading: boolean;
  isCategoryLoading: boolean;
  error: string | null;
  setBusinesses: (businesses: BusinessEntity[]) => void;
  setCategories: (categories: CategoryEntity[]) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setCategoryLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateBusinessFavorite: (businessId: string, isFavorite: boolean) => void;
  reset: () => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  businesses: [],
  categories: [],
  selectedCategoryId: null,
  searchQuery: '',
  isLoading: false,
  isCategoryLoading: false,
  error: null,
  setBusinesses: (businesses) => set({ businesses, error: null }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  setCategoryLoading: (isCategoryLoading) => set({ isCategoryLoading }),
  setError: (error) => set({ error, isLoading: false }),
  updateBusinessFavorite: (businessId, isFavorite) =>
    set((state) => ({
      businesses: state.businesses.map((b) =>
        b.id === businessId ? { ...b, isFavorite } : b
      ),
    })),
  reset: () =>
    set({
      businesses: [],
      categories: [],
      selectedCategoryId: null,
      searchQuery: '',
      isLoading: false,
      isCategoryLoading: false,
      error: null,
    }),
}));
