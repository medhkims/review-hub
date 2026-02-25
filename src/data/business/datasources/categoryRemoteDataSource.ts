import { remoteConfig } from '@/core/firebase/firebaseConfig';
import { fetchAndActivate, getValue } from 'firebase/remote-config';
import { CategoryModel } from '../models/categoryModel';
import { ServerException } from '@/core/error/exceptions';

export interface CategoryRemoteDataSource {
  getCategories(): Promise<CategoryModel[]>;
}

export class CategoryRemoteDataSourceImpl implements CategoryRemoteDataSource {
  private readonly CATEGORIES_KEY = 'categories';

  async getCategories(): Promise<CategoryModel[]> {
    try {
      await fetchAndActivate(remoteConfig);
      const value = getValue(remoteConfig, this.CATEGORIES_KEY);
      const parsed: CategoryModel[] = JSON.parse(value.asString());
      return parsed;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch categories';
      throw new ServerException(message);
    }
  }
}
