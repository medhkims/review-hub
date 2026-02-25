import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessModel } from '../models/businessModel';
import { CacheException } from '@/core/error/exceptions';

export interface BusinessLocalDataSource {
  getCachedBusinesses(key: string): Promise<BusinessModel[] | null>;
  cacheBusinesses(key: string, businesses: BusinessModel[]): Promise<void>;
  clearCache(): Promise<void>;
}

export class BusinessLocalDataSourceImpl implements BusinessLocalDataSource {
  private readonly CACHE_PREFIX = '@business_cache_';

  async getCachedBusinesses(key: string): Promise<BusinessModel[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;
      const parsed = JSON.parse(cached) as Array<Record<string, unknown>>;
      return parsed.map((item) => ({
        ...item,
        created_at: {
          toDate: () => new Date(item.created_at_ms as number),
        },
        updated_at: {
          toDate: () => new Date(item.updated_at_ms as number),
        },
      })) as unknown as BusinessModel[];
    } catch {
      throw new CacheException('Failed to retrieve cached businesses');
    }
  }

  async cacheBusinesses(key: string, businesses: BusinessModel[]): Promise<void> {
    try {
      const serializable = businesses.map((b) => ({
        ...b,
        created_at_ms: b.created_at.toDate().getTime(),
        updated_at_ms: b.updated_at.toDate().getTime(),
        created_at: undefined,
        updated_at: undefined,
      }));
      await AsyncStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(serializable));
    } catch {
      throw new CacheException('Failed to cache businesses');
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(this.CACHE_PREFIX));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch {
      throw new CacheException('Failed to clear business cache');
    }
  }
}
