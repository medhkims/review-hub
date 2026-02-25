import { create } from 'zustand';
import { WishlistItemEntity } from '@/domain/wishlist/entities/wishlistItemEntity';

interface WishlistState {
  items: WishlistItemEntity[];
  isLoading: boolean;
  error: string | null;
  setItems: (items: WishlistItemEntity[]) => void;
  addItem: (item: WishlistItemEntity) => void;
  removeItem: (itemId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isWishlisted: (placeId: string) => boolean;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  setItems: (items) => set({ items, error: null }),
  addItem: (item) =>
    set((state) => ({
      items: state.items.some((i) => i.placeId === item.placeId)
        ? state.items
        : [item, ...state.items],
    })),
  removeItem: (itemId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  isWishlisted: (placeId) => get().items.some((i) => i.placeId === placeId),
  reset: () => set({ items: [], isLoading: false, error: null }),
}));
