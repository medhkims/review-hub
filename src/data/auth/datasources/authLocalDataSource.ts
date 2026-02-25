import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserModel } from '../models/userModel';
import { CacheException } from '@/core/error/exceptions';

const USER_KEY = '@reviewhub:current_user';

export interface AuthLocalDataSource {
  getCachedUser(): Promise<UserModel | null>;
  cacheUser(user: UserModel): Promise<void>;
  clearCache(): Promise<void>;
}

export class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  async getCachedUser(): Promise<UserModel | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);

      if (userJson === null) {
        return null;
      }

      const user = JSON.parse(userJson) as UserModel;
      return user;
    } catch (error) {
      throw new CacheException('Failed to get cached user');
    }
  }

  async cacheUser(user: UserModel): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      throw new CacheException('Failed to cache user');
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      throw new CacheException('Failed to clear user cache');
    }
  }
}
