import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistItemModel } from '../models/wishlistItemModel';
import { CacheException } from '@/core/error/exceptions';
import { serializeTimestamp, deserializeTimestamp } from '@/core/utils/timestampSerializer';

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
        added_at: deserializeTimestamp(item.added_at as { _seconds: number; _nanoseconds: number }),
      })) as unknown as WishlistItemModel[];
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : 'Failed to retrieve cached wishlist';
      throw new CacheException(err);
    }
  }

  async cacheWishlist(userId: string, items: WishlistItemModel[]): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);

      const serializable = items.map((item) => ({
        ...item,
        added_at: serializeTimestamp(item.added_at),
      }));

      await AsyncStorage.setItem(cacheKey, JSON.stringify(serializable));
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : 'Failed to cache wishlist';
      throw new CacheException(err);
    }
  }

  async addCachedItem(userId: string, item: WishlistItemModel): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);
      const cached = await AsyncStorage.getItem(cacheKey);
      const parsed: Array<Record<string, unknown>> = cached ? JSON.parse(cached) : [];

      const serialized = {
        ...item,
        added_at: serializeTimestamp(item.added_at),
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
      const err = error instanceof Error ? error.message : 'Failed to add item to wishlist cache';
      throw new CacheException(err);
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
      const err = error instanceof Error ? error.message : 'Failed to update wishlist cache';
      throw new CacheException(err);
    }
  }
}
