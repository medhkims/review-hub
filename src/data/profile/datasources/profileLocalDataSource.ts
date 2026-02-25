import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileModel } from '../models/profileModel';
import { CacheException } from '@/core/error/exceptions';
import { serializeTimestamp, deserializeTimestamp } from '@/core/utils/timestampSerializer';

export interface ProfileLocalDataSource {
  getCachedProfile(userId: string): Promise<ProfileModel | null>;
  cacheProfile(userId: string, profile: ProfileModel): Promise<void>;
  clearCache(userId: string): Promise<void>;
}

export class ProfileLocalDataSourceImpl implements ProfileLocalDataSource {
  private readonly CACHE_KEY_PREFIX = '@profile_cache_';

  private getCacheKey(userId: string): string {
    return `${this.CACHE_KEY_PREFIX}${userId}`;
  }

  async getCachedProfile(userId: string): Promise<ProfileModel | null> {
    try {
      const cacheKey = this.getCacheKey(userId);
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) return null;

      const parsed = JSON.parse(cached);

      // Convert timestamp strings back to Timestamp objects
      if (parsed.updated_at) {
        parsed.updated_at = deserializeTimestamp(parsed.updated_at);
      }

      return parsed as ProfileModel;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve cached profile';
      throw new CacheException(message);
    }
  }

  async cacheProfile(userId: string, profile: ProfileModel): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);

      // Serialize the profile (convert Timestamp to JSON-serializable format)
      const serializable = {
        ...profile,
        updated_at: serializeTimestamp(profile.updated_at),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(serializable));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cache profile';
      throw new CacheException(message);
    }
  }

  async clearCache(userId: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);
      await AsyncStorage.removeItem(cacheKey);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to clear profile cache';
      throw new CacheException(message);
    }
  }
}
