import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistItemModel } from '../models/wishlistItemModel';
import { CacheException } from '@/core/error/exceptions';

export interface WishlistLocalDataSource {
  getCachedWishlist(userId: string): Promise<WishlistItemModel[] | null>;
  cacheWishlist(userId: string, items: WishlistItemModel[]): Promise<void>;
  addCachedItem(userId: string, item: WishlistItemModel): Promise<void>;
  removeCachedItem(userId: string, itemId: string): Promise<void>;
}

export class WishlistLocalDataSourceImpl implements WishlistLocalDataSource {
  private readonly CACHE_KEY_PREFIX = '@wishlist_cache_';

  private getCacheKey(userId: string): string {
    return `${this.CACHE_KEY_PREFIX}${userId}`;
  }

  async getCachedWishlist(userId: string): Promise<WishlistItemModel[] | null> {
    try {
      const cacheKey = this.getCacheKey(userId);
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) return null;

      const parsed = JSON.parse(cached) as Array<Record<string, unknown>>;

      // Restore Timestamp-like objects from serialized format
      return parsed.map((item) => ({
        ...item,
        added_at: {
          toDate: () =>
            new Date(
              ((item.added_at as Record<string, number>)._seconds ?? 0) * 1000
            ),
          _seconds: (item.added_at as Record<string, number>)._seconds ?? 0,
          _nanoseconds:
            (item.added_at as Record<string, number>)._nanoseconds ?? 0,
        },
      })) as unknown as WishlistItemModel[];
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new CacheException(err.message || 'Failed to retrieve cached wishlist');
    }
  }

  async cacheWishlist(userId: string, items: WishlistItemModel[]): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);

      const serializable = items.map((item) => ({
        ...item,
        added_at: {
          _seconds: (item.added_at as unknown as { seconds?: number }).seconds ?? 0,
          _nanoseconds:
            (item.added_at as unknown as { nanoseconds?: number }).nanoseconds ?? 0,
        },
      }));

      await AsyncStorage.setItem(cacheKey, JSON.stringify(serializable));
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new CacheException(err.message || 'Failed to cache wishlist');
    }
  }

  async addCachedItem(userId: string, item: WishlistItemModel): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);
      const cached = await AsyncStorage.getItem(cacheKey);
      const parsed: Array<Record<string, unknown>> = cached ? JSON.parse(cached) : [];

      const serialized = {
        ...item,
        added_at: {
          _seconds: (item.added_at as unknown as { seconds?: number }).seconds ?? 0,
          _nanoseconds:
            (item.added_at as unknown as { nanoseconds?: number }).nanoseconds ?? 0,
        },
      };

      // Replace existing entry with same id, or prepend new
      const existing = parsed.findIndex((i) => i.id === item.id);
      if (existing >= 0) {
        parsed[existing] = serialized;
      } else {
        parsed.unshift(serialized);
      }

      await AsyncStorage.setItem(cacheKey, JSON.stringify(parsed));
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new CacheException(err.message || 'Failed to add item to wishlist cache');
    }
  }

  async removeCachedItem(userId: string, itemId: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) return;

      const parsed = JSON.parse(cached) as Array<{ id: string }>;
      const updated = parsed.filter((item) => item.id !== itemId);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(updated));
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new CacheException(err.message || 'Failed to update wishlist cache');
    }
  }
}
