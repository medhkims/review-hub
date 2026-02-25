import { create } from 'zustand';
import { BusinessDetailEntity } from '@/domain/business/entities/businessDetailEntity';
import { ReviewEntity } from '@/domain/business/entities/reviewEntity';

interface BusinessDetailState {
  business: BusinessDetailEntity | null;
  reviews: ReviewEntity[];
  isLoading: boolean;
  error: string | null;
  reviewsError: string | null;
  setBusiness: (business: BusinessDetailEntity | null) => void;
  setReviews: (reviews: ReviewEntity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setReviewsError: (error: string | null) => void;
  setFavorite: (isFavorite: boolean) => void;
  reset: () => void;
}

export const useBusinessDetailStore = create<BusinessDetailState>((set) => ({
  business: null,
  reviews: [],
  isLoading: false,
  error: null,
  reviewsError: null,
  setBusiness: (business) => set({ business, error: null }),
  setReviews: (reviews) => set({ reviews, reviewsError: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setReviewsError: (reviewsError) => set({ reviewsError }),
  setFavorite: (isFavorite) =>
    set((state) => ({
      business: state.business ? { ...state.business, isFavorite } : null,
    })),
  reset: () => set({ business: null, reviews: [], isLoading: false, error: null, reviewsError: null }),
}));
