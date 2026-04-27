import { create } from 'zustand';
import { BusinessDetailEntity } from '@/domain/business/entities/businessDetailEntity';
import { ReviewEntity } from '@/domain/business/entities/reviewEntity';
import { AnnouncementEntity } from '@/domain/announcement/entities/announcementEntity';

interface BusinessDetailState {
  business: BusinessDetailEntity | null;
  reviews: ReviewEntity[];
  announcements: AnnouncementEntity[];
  isLoading: boolean;
  error: string | null;
  reviewsError: string | null;
  setBusiness: (business: BusinessDetailEntity | null) => void;
  setReviews: (reviews: ReviewEntity[]) => void;
  setAnnouncements: (announcements: AnnouncementEntity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setReviewsError: (error: string | null) => void;
  setFavorite: (isFavorite: boolean) => void;
  reset: () => void;
}

export const useBusinessDetailStore = create<BusinessDetailState>((set) => ({
  business: null,
  reviews: [],
  announcements: [],
  isLoading: false,
  error: null,
  reviewsError: null,
  setBusiness: (business) => set({ business, error: null }),
  setReviews: (reviews) => set({ reviews, reviewsError: null }),
  setAnnouncements: (announcements) => set({ announcements }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setReviewsError: (reviewsError) => set({ reviewsError }),
  setFavorite: (isFavorite) =>
    set((state) => ({
      business: state.business ? { ...state.business, isFavorite } : null,
    })),
  reset: () => set({ business: null, reviews: [], announcements: [], isLoading: false, error: null, reviewsError: null }),
}));
