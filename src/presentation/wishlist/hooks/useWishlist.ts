import { useCallback, useEffect } from 'react';
import { useWishlistStore } from '../store/wishlistStore';
import { container } from '@/core/di/container';
import { WishlistAddInput } from '@/domain/wishlist/repositories/wishlistRepository';

export const useWishlist = (userId?: string) => {
  const { items, isLoading, error, setItems, addItem, removeItem, setLoading, setError, isWishlisted } =
    useWishlistStore();

  const getWishlistUseCase = container.getWishlistUseCase;
  const addToWishlistUseCase = container.addToWishlistUseCase;
  const removeFromWishlistUseCase = container.removeFromWishlistUseCase;

  const fetchWishlist = useCallback(
    async (targetUserId: string) => {
      setLoading(true);
      setError(null);

      const result = await getWishlistUseCase.execute(targetUserId);

      result.fold(
        (failure) => {
          setError(failure.message);
          setLoading(false);
        },
        (fetchedItems) => {
          setItems(fetchedItems);
          setLoading(false);
        }
      );
    },
    [getWishlistUseCase, setLoading, setError, setItems]
  );

  const addToWishlist = useCallback(
    async (targetUserId: string, input: WishlistAddInput) => {
      const result = await addToWishlistUseCase.execute(targetUserId, input);

      result.fold(
        (failure) => setError(failure.message),
        (newItem) => addItem(newItem),
      );
    },
    [addToWishlistUseCase, addItem, setError]
  );

  const removeFromWishlist = useCallback(
    async (targetUserId: string, itemId: string) => {
      // Optimistic update — remove from store immediately
      removeItem(itemId);

      const result = await removeFromWishlistUseCase.execute(targetUserId, itemId);

      result.fold(
        (failure) => {
          // Rollback: re-fetch the wishlist on failure
          setError(failure.message);
          fetchWishlist(targetUserId);
        },
        () => {
          // Success — store is already updated optimistically
        }
      );
    },
    [removeFromWishlistUseCase, removeItem, setError, fetchWishlist]
  );

  useEffect(() => {
    if (userId) {
      fetchWishlist(userId);
    }
  }, [userId, fetchWishlist]);

  return {
    items,
    isLoading,
    error,
    isWishlisted,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
  };
};
