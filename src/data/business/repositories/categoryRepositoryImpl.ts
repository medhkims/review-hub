import { CategoryRepository, DeletedItemsResult } from '@/domain/business/repositories/categoryRepository';
import { RatingCriterionEntity } from '@/domain/business/entities/ratingCriterionEntity';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';
import { SubcategoryEntity } from '@/domain/business/entities/subcategoryEntity';
import { CategoryRemoteDataSource } from '../datasources/categoryRemoteDataSource';
import { CategoryFirestoreDataSource } from '../datasources/categoryFirestoreDataSource';
import { CategoryMapper } from '../mappers/categoryMapper';
import { Either, right, left } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';
import { CATEGORIES_DATA } from '@/core/constants/categoriesData';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/core/firebase/firebaseConfig';
import { Platform } from 'react-native';

async function uploadCategoryLogo(categoryId: string, imageUri: string): Promise<string> {
  let uploadData: Uint8Array | Blob;
  if (Platform.OS === 'web') {
    const response = await fetch(imageUri);
    if (!response.ok) throw new ServerException('Failed to read image file');
    uploadData = await response.blob();
  } else {
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response as ArrayBuffer);
      xhr.onerror = () => reject(new ServerException('Failed to read image file'));
      xhr.responseType = 'arraybuffer';
      xhr.open('GET', imageUri, true);
      xhr.send(null);
    });
    uploadData = new Uint8Array(arrayBuffer);
  }
  const storageRef = ref(storage, `category_images/${categoryId}_${Date.now()}.jpg`);
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, uploadData, { contentType: 'image/jpeg' });
    task.on('state_changed', null,
      (err) => reject(new ServerException(err.message || 'Upload failed')),
      async () => resolve(await getDownloadURL(task.snapshot.ref)),
    );
  });
}

export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(
    private readonly remote: CategoryRemoteDataSource,
    private readonly firestore: CategoryFirestoreDataSource,
  ) {}

  async getCategories(): Promise<Either<Failure, CategoryEntity[]>> {
    try {
      // Seed any missing bundled categories into Firestore, then return all
      const firestoreModels = await this.firestore.seedIfEmpty();
      if (firestoreModels.length > 0) {
        const active = firestoreModels.filter((m) => !m.is_deleted);
        const entities = active.map((model, index) => ({
          ...CategoryMapper.toEntity(model, index),
          subcategories: CategoryMapper.toEntity(model, index).subcategories.filter((s) => !s.isDeleted),
        }));
        return right(entities);
      }
    } catch {
      // Firestore failed — fall through to Remote Config
    }

    try {
      const models = await this.remote.getCategories();
      if (models.length > 0) {
        const entities = models.map((model, index) => CategoryMapper.toEntity(model, index));
        return right(entities);
      }
    } catch {
      // Remote Config failed or returned empty — fall back to bundled data
    }

    {
      const entities: CategoryEntity[] = CATEGORIES_DATA.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        subcategories: cat.subcategories.map((sub) => ({
          id: sub.id,
          name: sub.name,
          categoryId: cat.id,
        })),
        ratingCriteria: cat.ratingCriteria.map((rc) => ({
          key: rc.key,
          label: rc.label,
          icon: rc.icon,
        })),
      }));
      return right(entities);
    }
  }

  async getCategoriesForAdmin(): Promise<Either<Failure, CategoryEntity[]>> {
    try {
      // Seed Firestore from bundled data if collection is empty
      const models = await this.firestore.seedIfEmpty();
      if (models.length > 0) {
        const active = models.filter((m) => !m.is_deleted);
        const entities = active.map((model, index) => {
          const entity = CategoryMapper.toEntity(model, index);
          return { ...entity, subcategories: entity.subcategories.filter((s) => !s.isDeleted) };
          // deletedRatingCriteria is already mapped by CategoryMapper.toEntity
        });
        return right(entities);
      }
    } catch {
      // Firestore unavailable — fall back to bundled data so admin can view categories
    }

    const entities: CategoryEntity[] = CATEGORIES_DATA.map((cat, index) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      sortOrder: cat.sortOrder ?? index,
      subcategories: cat.subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        categoryId: cat.id,
      })),
      ratingCriteria: cat.ratingCriteria.map((rc) => ({
        key: rc.key,
        label: rc.label,
        icon: rc.icon,
      })),
    }));
    return right(entities);
  }

  async addCategory(name: string, icon: string, logoUri?: string): Promise<Either<Failure, CategoryEntity>> {
    try {
      const existing = await this.firestore.getCategories();
      const maxOrder = existing.reduce((max, m) => Math.max(max, m.sort_order ?? 0), 0);
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      let logoUrl: string | undefined;
      if (logoUri) {
        logoUrl = await uploadCategoryLogo(id, logoUri);
      }
      const model = {
        id,
        name,
        icon,
        logo_url: logoUrl,
        sort_order: maxOrder + 1,
        subcategories: [],
        rating_criteria: [],
      };
      await this.firestore.addCategory(model);
      const entity: CategoryEntity = {
        id: model.id,
        name: model.name,
        icon: model.icon,
        logoUrl,
        sortOrder: model.sort_order,
        subcategories: [],
        ratingCriteria: [],
      };
      return right(entity);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to add category'));
    }
  }

  async removeCategory(categoryId: string): Promise<Either<Failure, void>> {
    try {
      await this.firestore.removeCategory(categoryId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to remove category'));
    }
  }

  async addSubcategory(categoryId: string, name: string): Promise<Either<Failure, SubcategoryEntity>> {
    try {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      const subcategoryModel = { id, name, category_id: categoryId };
      await this.firestore.addSubcategory(categoryId, subcategoryModel);
      const entity: SubcategoryEntity = { id, name, categoryId };
      return right(entity);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to add subcategory'));
    }
  }

  async removeSubcategory(categoryId: string, subcategoryId: string): Promise<Either<Failure, void>> {
    try {
      await this.firestore.removeSubcategory(categoryId, subcategoryId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to remove subcategory'));
    }
  }

  async updateCategory(
    categoryId: string,
    name: string,
    icon: string,
    logoUri?: string,
  ): Promise<Either<Failure, CategoryEntity>> {
    try {
      let logoUrl: string | undefined;
      if (logoUri && !logoUri.startsWith('https://')) {
        logoUrl = await uploadCategoryLogo(categoryId, logoUri);
      } else if (logoUri) {
        logoUrl = logoUri;
      }
      const fields: Record<string, unknown> = { name, icon };
      if (logoUrl !== undefined) fields['logo_url'] = logoUrl;
      await this.firestore.updateCategory(categoryId, fields as never);
      // Fetch updated entity
      const all = await this.firestore.getCategories();
      const model = all.find((m) => m.id === categoryId);
      if (!model) return left(new ServerFailure('Category not found after update'));
      const index = all.indexOf(model);
      return right(CategoryMapper.toEntity(model, index));
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to update category'));
    }
  }

  async updateSubcategory(
    categoryId: string,
    subcategoryId: string,
    name: string,
  ): Promise<Either<Failure, SubcategoryEntity>> {
    try {
      await this.firestore.updateSubcategory(categoryId, subcategoryId, name);
      const entity: SubcategoryEntity = { id: subcategoryId, name, categoryId };
      return right(entity);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to update subcategory'));
    }
  }

  async softDeleteCategory(categoryId: string): Promise<Either<Failure, void>> {
    try {
      await this.firestore.softDeleteCategory(categoryId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to delete category'));
    }
  }

  async softDeleteSubcategory(categoryId: string, subcategoryId: string): Promise<Either<Failure, void>> {
    try {
      await this.firestore.softDeleteSubcategory(categoryId, subcategoryId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to delete subcategory'));
    }
  }

  async recoverCategory(categoryId: string, withSubcategories: boolean): Promise<Either<Failure, void>> {
    try {
      await this.firestore.recoverCategory(categoryId, withSubcategories);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to recover category'));
    }
  }

  async recoverSubcategory(categoryId: string, subcategoryId: string): Promise<Either<Failure, void>> {
    try {
      await this.firestore.recoverSubcategory(categoryId, subcategoryId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to recover subcategory'));
    }
  }

  async getDeletedItems(): Promise<Either<Failure, DeletedItemsResult>> {
    try {
      const all = await this.firestore.getAllCategories();
      const deletedCategories = all
        .filter((m) => m.is_deleted)
        .map((m, i) => ({ category: CategoryMapper.toEntity(m, i) }));

      const deletedSubcategories = all
        .filter((m) => !m.is_deleted)
        .flatMap((m, i) => {
          const parent = CategoryMapper.toEntity(m, i);
          return (m.subcategories ?? [])
            .filter((s) => s.is_deleted)
            .map((s) => ({
              parentCategory: { ...parent, subcategories: [] },
              subcategory: { id: s.id, name: s.name, categoryId: m.id, isDeleted: true },
            }));
        });

      return right({ deletedCategories, deletedSubcategories });
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch deleted items'));
    }
  }

  async updateRatingCriteria(categoryId: string, criteria: RatingCriterionEntity[]): Promise<Either<Failure, void>> {
    try {
      const ratingCriteriaModel = criteria.map((c) => ({ key: c.key, label: c.label, icon: c.icon }));
      await this.firestore.updateCategory(categoryId, { rating_criteria: ratingCriteriaModel } as never);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to update rating criteria'));
    }
  }

  async softDeleteRatingCriterion(categoryId: string, criterionKey: string): Promise<Either<Failure, void>> {
    try {
      await this.firestore.softDeleteRatingCriterion(categoryId, criterionKey);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to delete criterion'));
    }
  }

  async recoverRatingCriterion(categoryId: string, criterionKey: string): Promise<Either<Failure, void>> {
    try {
      await this.firestore.recoverRatingCriterion(categoryId, criterionKey);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to recover criterion'));
    }
  }

  async moveSubcategory(fromCategoryId: string, subcategoryId: string, toCategoryId: string): Promise<Either<Failure, void>> {
    try {
      await this.firestore.moveSubcategory(fromCategoryId, subcategoryId, toCategoryId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to move subcategory'));
    }
  }
}
