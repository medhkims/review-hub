import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileModel } from '../models/profileModel';
import { CacheException } from '@/core/error/exceptions';

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
        parsed.updated_at = {
          toDate: () => new Date(parsed.updated_at._seconds * 1000),
          _seconds: parsed.updated_at._seconds,
          _nanoseconds: parsed.updated_at._nanoseconds,
        };
      }

      return parsed as ProfileModel;
    } catch (error: any) {
      throw new CacheException(error.message || 'Failed to retrieve cached profile');
    }
  }

  async cacheProfile(userId: string, profile: ProfileModel): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);

      // Serialize the profile (convert Timestamp to JSON-serializable format)
      const serializable = {
        ...profile,
        updated_at: {
          _seconds: (profile.updated_at as any).seconds || 0,
          _nanoseconds: (profile.updated_at as any).nanoseconds || 0,
        },
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(serializable));
    } catch (error: any) {
      throw new CacheException(error.message || 'Failed to cache profile');
    }
  }

  async clearCache(userId: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);
      await AsyncStorage.removeItem(cacheKey);
    } catch (error: any) {
      throw new CacheException(error.message || 'Failed to clear profile cache');
    }
  }
}
