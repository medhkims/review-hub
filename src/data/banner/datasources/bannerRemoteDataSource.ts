import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { firestore, storage } from '@/core/firebase/firebaseConfig';
import { Platform } from 'react-native';
import { BannerModel } from '../models/bannerModel';
import { ServerException } from '@/core/error/exceptions';
import { CreateBannerParams, UpdateBannerParams } from '@/domain/banner/repositories/bannerRepository';

export interface BannerRemoteDataSource {
  getBanners(): Promise<BannerModel[]>;
  getAllBanners(): Promise<BannerModel[]>;
  createBanner(params: CreateBannerParams): Promise<BannerModel>;
  updateBanner(id: string, params: UpdateBannerParams): Promise<BannerModel>;
  deleteBanner(id: string): Promise<void>;
}

export class BannerRemoteDataSourceImpl implements BannerRemoteDataSource {
  private readonly COLLECTION = 'banners';
  private readonly STORAGE_PATH = 'banners';

  async getBanners(): Promise<BannerModel[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('is_active', '==', true),
        orderBy('sort_order', 'asc'),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BannerModel));
    } catch (error: unknown) {
      const e = error as { message?: string; code?: string };
      throw new ServerException(e.message || 'Failed to fetch banners', e.code);
    }
  }

  async getAllBanners(): Promise<BannerModel[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        orderBy('sort_order', 'asc'),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BannerModel));
    } catch (error: unknown) {
      const e = error as { message?: string; code?: string };
      throw new ServerException(e.message || 'Failed to fetch banners', e.code);
    }
  }

  async createBanner(params: CreateBannerParams): Promise<BannerModel> {
    try {
      const imageUrl = await this.uploadImage(params.imageUri, params.mimeType);
      const docRef = await addDoc(collection(firestore, this.COLLECTION), {
        title: params.title,
        description: params.description,
        content: params.content,
        image_url: imageUrl,
        is_active: params.isActive,
        is_clickable: params.isClickable,
        sort_order: params.sortOrder,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as BannerModel;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const e = error as { message?: string; code?: string };
      throw new ServerException(e.message || 'Failed to create banner', e.code);
    }
  }

  async updateBanner(id: string, params: UpdateBannerParams): Promise<BannerModel> {
    try {
      const docRef = doc(firestore, this.COLLECTION, id);
      const updates: Record<string, unknown> = { updated_at: serverTimestamp() };

      if (params.title !== undefined) updates.title = params.title;
      if (params.description !== undefined) updates.description = params.description;
      if (params.content !== undefined) updates.content = params.content;
      if (params.isActive !== undefined) updates.is_active = params.isActive;
      if (params.isClickable !== undefined) updates.is_clickable = params.isClickable;
      if (params.sortOrder !== undefined) updates.sort_order = params.sortOrder;

      if (params.imageUri) {
        updates.image_url = await this.uploadImage(params.imageUri, params.mimeType);
      }

      await updateDoc(docRef, updates);
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as BannerModel;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const e = error as { message?: string; code?: string };
      throw new ServerException(e.message || 'Failed to update banner', e.code);
    }
  }

  async deleteBanner(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as BannerModel;
        if (data.image_url) {
          await this.deleteImageByUrl(data.image_url).catch(() => {
            // Ignore storage deletion failures
          });
        }
      }
      await deleteDoc(docRef);
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const e = error as { message?: string; code?: string };
      throw new ServerException(e.message || 'Failed to delete banner', e.code);
    }
  }

  private async uploadImage(imageUri: string, mimeType?: string): Promise<string> {
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
    const filename = `banner_${Date.now()}.${extension}`;
    const storagePath = `${this.STORAGE_PATH}/${filename}`;
    const storageRef = ref(storage, storagePath);

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
      // Ignore — the file might already be gone
    }
  }
}
