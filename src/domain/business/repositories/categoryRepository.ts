import { CategoryEntity } from '../entities/categoryEntity';
import { SubcategoryEntity } from '../entities/subcategoryEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface DeletedCategoryItem {
  category: CategoryEntity;
}

export interface DeletedSubcategoryItem {
  parentCategory: CategoryEntity;
  subcategory: SubcategoryEntity;
}

export interface DeletedItemsResult {
  deletedCategories: DeletedCategoryItem[];
  deletedSubcategories: DeletedSubcategoryItem[];
}

export interface CategoryRepository {
  getCategories(): Promise<Either<Failure, CategoryEntity[]>>;
  getCategoriesForAdmin(): Promise<Either<Failure, CategoryEntity[]>>;
  addCategory(name: string, icon: string, logoUri?: string): Promise<Either<Failure, CategoryEntity>>;
  removeCategory(categoryId: string): Promise<Either<Failure, void>>;
  addSubcategory(categoryId: string, name: string): Promise<Either<Failure, SubcategoryEntity>>;
  removeSubcategory(categoryId: string, subcategoryId: string): Promise<Either<Failure, void>>;
  updateCategory(categoryId: string, name: string, icon: string, logoUri?: string): Promise<Either<Failure, CategoryEntity>>;
  updateSubcategory(categoryId: string, subcategoryId: string, name: string): Promise<Either<Failure, SubcategoryEntity>>;
  updateRatingCriteria(categoryId: string, criteria: import('../entities/ratingCriterionEntity').RatingCriterionEntity[]): Promise<Either<Failure, void>>;
  softDeleteRatingCriterion(categoryId: string, criterionKey: string): Promise<Either<Failure, void>>;
  recoverRatingCriterion(categoryId: string, criterionKey: string): Promise<Either<Failure, void>>;
  softDeleteCategory(categoryId: string): Promise<Either<Failure, void>>;
  softDeleteSubcategory(categoryId: string, subcategoryId: string): Promise<Either<Failure, void>>;
  recoverCategory(categoryId: string, withSubcategories: boolean): Promise<Either<Failure, void>>;
  recoverSubcategory(categoryId: string, subcategoryId: string): Promise<Either<Failure, void>>;
  getDeletedItems(): Promise<Either<Failure, DeletedItemsResult>>;
  moveSubcategory(fromCategoryId: string, subcategoryId: string, toCategoryId: string): Promise<Either<Failure, void>>;
}
