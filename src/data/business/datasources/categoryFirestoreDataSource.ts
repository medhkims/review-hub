import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { CategoryModel, SubcategoryModel } from '../models/categoryModel';
import { ServerException } from '@/core/error/exceptions';
import { CATEGORIES_DATA } from '@/core/constants/categoriesData';

export interface CategoryFirestoreDataSource {
  getCategories(): Promise<CategoryModel[]>;
  addCategory(category: CategoryModel): Promise<void>;
  removeCategory(categoryId: string): Promise<void>;
  addSubcategory(categoryId: string, subcategory: SubcategoryModel): Promise<void>;
  removeSubcategory(categoryId: string, subcategoryId: string): Promise<void>;
  updateCategory(categoryId: string, fields: Partial<CategoryModel>): Promise<void>;
  updateSubcategory(categoryId: string, subcategoryId: string, name: string): Promise<void>;
  softDeleteCategory(categoryId: string): Promise<void>;
  softDeleteSubcategory(categoryId: string, subcategoryId: string): Promise<void>;
  recoverCategory(categoryId: string, withSubcategories: boolean): Promise<void>;
  recoverSubcategory(categoryId: string, subcategoryId: string): Promise<void>;
  softDeleteRatingCriterion(categoryId: string, criterionKey: string): Promise<void>;
  recoverRatingCriterion(categoryId: string, criterionKey: string): Promise<void>;
  getAllCategories(): Promise<CategoryModel[]>;
  seedIfEmpty(): Promise<CategoryModel[]>;
}

export class CategoryFirestoreDataSourceImpl implements CategoryFirestoreDataSource {
  private readonly colRef = collection(firestore, 'categories');

  async getCategories(): Promise<CategoryModel[]> {
    try {
      const snapshot = await getDocs(this.colRef);
      if (snapshot.empty) return [];
      return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as CategoryModel))
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch categories';
      throw new ServerException(message);
    }
  }

  async addCategory(category: CategoryModel): Promise<void> {
    try {
      await setDoc(doc(this.colRef, category.id), category);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add category';
      throw new ServerException(message);
    }
  }

  async removeCategory(categoryId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.colRef, categoryId));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove category';
      throw new ServerException(message);
    }
  }

  async addSubcategory(categoryId: string, subcategory: SubcategoryModel): Promise<void> {
    try {
      const docRef = doc(this.colRef, categoryId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new ServerException('Category not found');
      const data = snapshot.data() as CategoryModel;
      const updated = [...(data.subcategories ?? []), subcategory];
      await updateDoc(docRef, { subcategories: updated });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to add subcategory';
      throw new ServerException(message);
    }
  }

  async removeSubcategory(categoryId: string, subcategoryId: string): Promise<void> {
    try {
      const docRef = doc(this.colRef, categoryId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new ServerException('Category not found');
      const data = snapshot.data() as CategoryModel;
      const updated = (data.subcategories ?? []).filter((s) => s.id !== subcategoryId);
      await updateDoc(docRef, { subcategories: updated });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to remove subcategory';
      throw new ServerException(message);
    }
  }

  async updateCategory(categoryId: string, fields: Partial<CategoryModel>): Promise<void> {
    try {
      await updateDoc(doc(this.colRef, categoryId), fields as Record<string, unknown>);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update category';
      throw new ServerException(message);
    }
  }

  async updateSubcategory(categoryId: string, subcategoryId: string, name: string): Promise<void> {
    try {
      const docRef = doc(this.colRef, categoryId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new ServerException('Category not found');
      const data = snapshot.data() as CategoryModel;
      const updated = (data.subcategories ?? []).map((s) =>
        s.id === subcategoryId ? { ...s, name } : s,
      );
      await updateDoc(docRef, { subcategories: updated });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to update subcategory';
      throw new ServerException(message);
    }
  }

  async softDeleteCategory(categoryId: string): Promise<void> {
    try {
      const docRef = doc(this.colRef, categoryId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new ServerException('Category not found');
      const data = snapshot.data() as CategoryModel;
      const updatedSubs = (data.subcategories ?? []).map((s) => ({ ...s, is_deleted: true }));
      await updateDoc(docRef, { is_deleted: true, subcategories: updatedSubs });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      throw new ServerException(message);
    }
  }

  async softDeleteSubcategory(categoryId: string, subcategoryId: string): Promise<void> {
    try {
      const docRef = doc(this.colRef, categoryId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new ServerException('Category not found');
      const data = snapshot.data() as CategoryModel;
      const updated = (data.subcategories ?? []).map((s) =>
        s.id === subcategoryId ? { ...s, is_deleted: true } : s,
      );
      await updateDoc(docRef, { subcategories: updated });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to delete subcategory';
      throw new ServerException(message);
    }
  }

  async recoverCategory(categoryId: string, withSubcategories: boolean): Promise<void> {
    try {
      const docRef = doc(this.colRef, categoryId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new ServerException('Category not found');
      const data = snapshot.data() as CategoryModel;
      const updatedSubs = withSubcategories
        ? (data.subcategories ?? []).map((s) => ({ ...s, is_deleted: false }))
        : data.subcategories;
      await updateDoc(docRef, { is_deleted: false, subcategories: updatedSubs });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to recover category';
      throw new ServerException(message);
    }
  }

  async recoverSubcategory(categoryId: string, subcategoryId: string): Promise<void> {
    try {
      const docRef = doc(this.colRef, categoryId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new ServerException('Category not found');
      const data = snapshot.data() as CategoryModel;
      const updated = (data.subcategories ?? []).map((s) =>
        s.id === subcategoryId ? { ...s, is_deleted: false } : s,
      );
      await updateDoc(docRef, { subcategories: updated });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to recover subcategory';
      throw new ServerException(message);
    }
  }

  async softDeleteRatingCriterion(categoryId: string, criterionKey: string): Promise<void> {
    try {
      const docRef = doc(this.colRef, categoryId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new ServerException('Category not found');
      const data = snapshot.data() as CategoryModel;
      const target = (data.rating_criteria ?? []).find((c) => c.key === criterionKey);
      if (!target) throw new ServerException('Criterion not found');
      const updatedActive = (data.rating_criteria ?? []).filter((c) => c.key !== criterionKey);
      const updatedDeleted = [...(data.deleted_rating_criteria ?? []), target];
      await updateDoc(docRef, { rating_criteria: updatedActive, deleted_rating_criteria: updatedDeleted });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to delete criterion';
      throw new ServerException(message);
    }
  }

  async recoverRatingCriterion(categoryId: string, criterionKey: string): Promise<void> {
    try {
      const docRef = doc(this.colRef, categoryId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new ServerException('Category not found');
      const data = snapshot.data() as CategoryModel;
      const target = (data.deleted_rating_criteria ?? []).find((c) => c.key === criterionKey);
      if (!target) throw new ServerException('Deleted criterion not found');
      const updatedDeleted = (data.deleted_rating_criteria ?? []).filter((c) => c.key !== criterionKey);
      const updatedActive = [...(data.rating_criteria ?? []), target];
      await updateDoc(docRef, { rating_criteria: updatedActive, deleted_rating_criteria: updatedDeleted });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to recover criterion';
      throw new ServerException(message);
    }
  }

  async getAllCategories(): Promise<CategoryModel[]> {
    try {
      const snapshot = await getDocs(this.colRef);
      if (snapshot.empty) return [];
      return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as CategoryModel))
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch categories';
      throw new ServerException(message);
    }
  }

  async seedIfEmpty(): Promise<CategoryModel[]> {
    try {
      const existing = await getDocs(this.colRef);
      const existingIds = new Set(existing.docs.map((d) => d.id));

      // Find categories in bundled data that are missing from Firestore
      const missing = CATEGORIES_DATA.filter((cat) => !existingIds.has(cat.id));

      if (!existing.empty && missing.length === 0) {
        return existing.docs
          .map((d) => ({ id: d.id, ...d.data() } as CategoryModel))
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      }

      const batch = writeBatch(firestore);

      if (existing.empty) {
        // First-time seed: write all categories
        const models: CategoryModel[] = CATEGORIES_DATA.map((cat) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          sort_order: cat.sortOrder,
          subcategories: cat.subcategories.map((s) => ({
            id: s.id,
            name: s.name,
            category_id: cat.id,
          })),
          rating_criteria: cat.ratingCriteria.map((r) => ({
            key: r.key,
            label: r.label,
            icon: r.icon,
          })),
        }));
        for (const model of models) {
          batch.set(doc(this.colRef, model.id), model);
        }
        await batch.commit();
        return models;
      }

      // Partial sync: only add missing categories (never overwrite admin edits)
      for (const cat of missing) {
        const model: CategoryModel = {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          sort_order: cat.sortOrder,
          subcategories: cat.subcategories.map((s) => ({
            id: s.id,
            name: s.name,
            category_id: cat.id,
          })),
          rating_criteria: cat.ratingCriteria.map((r) => ({
            key: r.key,
            label: r.label,
            icon: r.icon,
          })),
        };
        batch.set(doc(this.colRef, model.id), model);
      }
      await batch.commit();

      const updated = await getDocs(this.colRef);
      return updated.docs
        .map((d) => ({ id: d.id, ...d.data() } as CategoryModel))
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to seed categories';
      throw new ServerException(message);
    }
  }
}
