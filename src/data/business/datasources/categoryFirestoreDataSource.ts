import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  writeBatch,
  query,
  where,
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
  moveSubcategory(fromCategoryId: string, subcategoryId: string, toCategoryId: string): Promise<void>;
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
      const alreadyExists = (data.subcategories ?? []).some((s) => s.id === subcategory.id);
      if (alreadyExists) throw new ServerException('A subcategory with this name already exists');
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
      const existingDocs = existing.docs.map((d) => ({ id: d.id, ...d.data() } as CategoryModel));
      const existingById = new Map(existingDocs.map((m) => [m.id, m]));

      // Categories in bundled data that are completely missing from Firestore
      const missingCategories = CATEGORIES_DATA.filter((cat) => !existingById.has(cat.id));

      // Build a global set of all subcategory IDs that exist ANYWHERE in Firestore
      // (across all categories). This prevents re-adding a sub that was intentionally
      // moved to a different category by an admin.
      const globalSubIds = new Set(
        existingDocs.flatMap((m) => (m.subcategories ?? []).map((s) => s.id)),
      );

      // Existing categories that are missing some subcategories from bundled data
      // AND those subcategories don't exist in ANY other category (i.e. truly new, not moved).
      const categoriesNeedingSubSync: { cat: typeof CATEGORIES_DATA[0]; existingModel: CategoryModel }[] = [];
      for (const cat of CATEGORIES_DATA) {
        const model = existingById.get(cat.id);
        if (!model || cat.subcategories.length === 0) continue;
        const existingSubIds = new Set((model.subcategories ?? []).map((s) => s.id));
        const hasTrulyMissingSubs = cat.subcategories.some(
          (s) => !existingSubIds.has(s.id) && !globalSubIds.has(s.id),
        );
        if (hasTrulyMissingSubs) categoriesNeedingSubSync.push({ cat, existingModel: model });
      }

      // Find categories that have duplicate subcategories in Firestore (by id or normalised name)
      const categoriesNeedingDedup: { model: CategoryModel; deduped: SubcategoryModel[] }[] = [];
      for (const model of existingDocs) {
        const subs = model.subcategories ?? [];
        const seenKeys = new Set<string>();
        const deduped = subs.filter((s) => {
          const key = s.id ?? s.name?.toLowerCase().trim();
          if (!key || seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });
        if (deduped.length < subs.length) {
          categoriesNeedingDedup.push({ model, deduped });
        }
      }

      // Find categories that are missing rating_criteria in Firestore but have them in bundled data
      const categoriesNeedingCriteriaSync: { catId: string; rating_criteria: CategoryModel['rating_criteria'] }[] = [];
      for (const cat of CATEGORIES_DATA) {
        const model = existingById.get(cat.id);
        if (!model) continue; // will be added as missing category
        if (cat.ratingCriteria.length === 0) continue; // no criteria defined
        if ((model.rating_criteria ?? []).length === 0) {
          categoriesNeedingCriteriaSync.push({
            catId: cat.id,
            rating_criteria: cat.ratingCriteria.map((r) => ({ key: r.key, label: r.label, icon: r.icon })),
          });
        }
      }

      const nothingToDo =
        missingCategories.length === 0 &&
        categoriesNeedingSubSync.length === 0 &&
        categoriesNeedingDedup.length === 0 &&
        categoriesNeedingCriteriaSync.length === 0;
      if (!existing.empty && nothingToDo) {
        return existingDocs.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
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

      // Add completely missing categories
      for (const cat of missingCategories) {
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

      // Patch missing subcategories into existing categories (preserve admin edits).
      // Only add a sub if it genuinely doesn't exist anywhere in Firestore.
      for (const { cat, existingModel } of categoriesNeedingSubSync) {
        const existingSubIds = new Set((existingModel.subcategories ?? []).map((s) => s.id));
        const newSubs = cat.subcategories
          .filter((s) => !existingSubIds.has(s.id) && !globalSubIds.has(s.id))
          .map((s) => ({ id: s.id, name: s.name, category_id: cat.id }));
        if (newSubs.length === 0) continue;
        const mergedSubs = [...(existingModel.subcategories ?? []), ...newSubs];
        batch.update(doc(this.colRef, cat.id), { subcategories: mergedSubs });
      }

      // Remove duplicate subcategories already stored in Firestore (keep first occurrence)
      for (const { model, deduped } of categoriesNeedingDedup) {
        batch.update(doc(this.colRef, model.id), { subcategories: deduped });
      }

      // Patch rating_criteria into existing categories that have none
      for (const { catId, rating_criteria } of categoriesNeedingCriteriaSync) {
        batch.update(doc(this.colRef, catId), { rating_criteria });
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

  async moveSubcategory(fromCategoryId: string, subcategoryId: string, toCategoryId: string): Promise<void> {
    try {
      const fromRef = doc(this.colRef, fromCategoryId);
      const toRef = doc(this.colRef, toCategoryId);

      const [fromSnap, toSnap] = await Promise.all([getDoc(fromRef), getDoc(toRef)]);
      if (!fromSnap.exists()) throw new ServerException('Source category not found');
      if (!toSnap.exists()) throw new ServerException('Target category not found');

      const fromData = fromSnap.data() as CategoryModel;
      const toData = toSnap.data() as CategoryModel;

      const subToMove = (fromData.subcategories ?? []).find((s) => s.id === subcategoryId);
      if (!subToMove) throw new ServerException('Subcategory not found in source category');

      // 1. Move the subcategory definition between category documents
      const updatedFromSubs = (fromData.subcategories ?? []).filter((s) => s.id !== subcategoryId);
      const movedSub: SubcategoryModel = { ...subToMove, category_id: toCategoryId };
      const updatedToSubs = [...(toData.subcategories ?? []), movedSub];

      const categoryBatch = writeBatch(firestore);
      categoryBatch.update(fromRef, { subcategories: updatedFromSubs });
      categoryBatch.update(toRef, { subcategories: updatedToSubs });
      await categoryBatch.commit();

      // 2. Migrate all businesses that belong to this subcategory.
      // Businesses may store the subcategory by NAME ('Podcast') or by ID ('podcast'),
      // so we match on both to handle all historic data formats.
      const subName = subToMove.name;   // e.g. 'Podcast'
      const subId   = subToMove.id;     // e.g. 'podcast'
      const bizCol = collection(firestore, 'businesses');

      // Query businesses in the source category
      const bizSnapshot = await getDocs(
        query(bizCol, where('category_id', '==', fromCategoryId)),
      );

      // Filter client-side to those that actually use this subcategory (name or id)
      const affected = bizSnapshot.docs.filter((d) => {
        const data = d.data();
        const subCat = (data['sub_category'] as string | undefined)?.trim() ?? '';
        const subCats = data['sub_categories'] as string[] | undefined;
        const matchesSingle = subCat === subName || subCat === subId;
        const matchesArray = Array.isArray(subCats) &&
          subCats.some((s) => s.trim() === subName || s.trim() === subId);
        return matchesSingle || matchesArray;
      });

      if (affected.length === 0) return;

      // Firestore batch limit is 500 — chunk if needed
      const BATCH_LIMIT = 500;
      for (let i = 0; i < affected.length; i += BATCH_LIMIT) {
        const chunk = affected.slice(i, i + BATCH_LIMIT);
        const bizBatch = writeBatch(firestore);
        for (const bizDoc of chunk) {
          bizBatch.update(bizDoc.ref, {
            category_id: toCategoryId,
            category_name: toData.name,
          });
        }
        await bizBatch.commit();
      }
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to move subcategory';
      throw new ServerException(message);
    }
  }
}
