import {
  collection,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Platform } from 'react-native';
import { firestore, storage } from '@/core/firebase/firebaseConfig';
import { CategoryDefaultModel } from '../models/categoryDefaultModel';
import { ServerException } from '@/core/error/exceptions';
import { UpdateCategoryDefaultParams } from '@/domain/categoryDefaults/repositories/categoryDefaultRepository';

export interface CategoryDefaultRemoteDataSource {
  getCategoryDefaults(): Promise<CategoryDefaultModel[]>;
  updateCategoryDefault(
    categoryId: string,
    params: UpdateCategoryDefaultParams,
  ): Promise<CategoryDefaultModel>;
}

export class CategoryDefaultRemoteDataSourceImpl implements CategoryDefaultRemoteDataSource {
  private readonly COLLECTION = 'category_defaults';
  private readonly STORAGE_PATH = 'category_defaults';

  async getCategoryDefaults(): Promise<CategoryDefaultModel[]> {
    try {
      const snapshot = await getDocs(collection(firestore, this.COLLECTION));
      return snapshot.docs.map((d) => ({ ...d.data(), category_id: d.id } as CategoryDefaultModel));
    } catch (error: unknown) {
      const e = error as { message?: string; code?: string };
      throw new ServerException(e.message || 'Failed to fetch category defaults', e.code);
    }
  }

  async updateCategoryDefault(
    categoryId: string,
    params: UpdateCategoryDefaultParams,
  ): Promise<CategoryDefaultModel> {
    try {
      const docRef = doc(firestore, this.COLLECTION, categoryId);

      // Load current data to get existing URLs for cleanup
      const currentSnap = await getDoc(docRef);
      const currentData = currentSnap.exists()
        ? (currentSnap.data() as CategoryDefaultModel)
        : null;

      const updates: Record<string, unknown> = { updated_at: serverTimestamp() };

      if (params.profileImageUri) {
        if (currentData?.profile_image_url) {
          await this.deleteImageByUrl(currentData.profile_image_url);
        }
        updates.profile_image_url = await this.uploadImage(
          params.profileImageUri,
          params.profileMimeType,
          `${this.STORAGE_PATH}/${categoryId}/profile_${Date.now()}`,
        );
      }

      if (params.coverImageUri) {
        if (currentData?.cover_image_url) {
          await this.deleteImageByUrl(currentData.cover_image_url);
        }
        updates.cover_image_url = await this.uploadImage(
          params.coverImageUri,
          params.coverMimeType,
          `${this.STORAGE_PATH}/${categoryId}/cover_${Date.now()}`,
        );
      }

      await setDoc(docRef, { ...updates, category_id: categoryId }, { merge: true });
      const snap = await getDoc(docRef);
      return { ...snap.data(), category_id: snap.id } as CategoryDefaultModel;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const e = error as { message?: string; code?: string };
      throw new ServerException(e.message || 'Failed to update category default', e.code);
    }
  }

  private async uploadImage(imageUri: string, mimeType?: string, storagePath?: string): Promise<string> {
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

    const contentType = mimeType || 'image/jpeg';
    const extension = contentType.split('/')[1] || 'jpg';
    const path = storagePath ? `${storagePath}.${extension}` : `${this.STORAGE_PATH}/${Date.now()}.${extension}`;
    const storageRef = ref(storage, path);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, uploadData, { contentType });
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(new ServerException(error.message || 'Upload failed', error.code)),
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (err: unknown) {
            const e = err as { message?: string; code?: string };
            reject(new ServerException(e.message || 'Failed to get download URL', e.code));
          }
        },
      );
    });
  }

  private async deleteImageByUrl(imageUrl: string): Promise<void> {
    try {
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
    } catch {
      // Ignore — file may already be gone
    }
  }
}
