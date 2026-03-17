import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { CategoryDefaultEntity } from '../entities/categoryDefaultEntity';

export interface UpdateCategoryDefaultParams {
  profileImageUri?: string;
  profileMimeType?: string;
  coverImageUri?: string;
  coverMimeType?: string;
}

export interface CategoryDefaultRepository {
  getCategoryDefaults(): Promise<Either<Failure, CategoryDefaultEntity[]>>;
  updateCategoryDefault(
    categoryId: string,
    params: UpdateCategoryDefaultParams,
  ): Promise<Either<Failure, CategoryDefaultEntity>>;
}
