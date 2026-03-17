import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Platform } from 'react-native';
import { firestore, storage } from '@/core/firebase/firebaseConfig';
import { AdminInfoModel } from '../models/adminInfoModel';
import { ServerException } from '@/core/error/exceptions';

const EMPTY_INFO: AdminInfoModel = {
  picture_url: null,
  address: null,
  emails: [],
  phones: [],
};

export interface AdminInfoRemoteDataSource {
  getAdminInfo(): Promise<AdminInfoModel>;
  updateAdminInfo(info: AdminInfoModel): Promise<void>;
  uploadAdminPicture(uri: string, mimeType?: string): Promise<string>;
}

export class AdminInfoRemoteDataSourceImpl implements AdminInfoRemoteDataSource {
  async getAdminInfo(): Promise<AdminInfoModel> {
    try {
      const snap = await getDoc(doc(firestore, 'appConfig', 'adminInfo'));
      if (!snap.exists()) return { ...EMPTY_INFO };
      const data = snap.data();
      return {
        picture_url: (data.picture_url as string | null) ?? null,
        address: (data.address as AdminInfoModel['address']) ?? null,
        emails: (data.emails as AdminInfoModel['emails']) ?? [],
        phones: (data.phones as AdminInfoModel['phones']) ?? [],
      };
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      throw new ServerException('Failed to fetch admin info');
    }
  }

  async updateAdminInfo(info: AdminInfoModel): Promise<void> {
    try {
      await setDoc(doc(firestore, 'appConfig', 'adminInfo'), info, { merge: true });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      throw new ServerException('Failed to update admin info');
    }
  }

  async uploadAdminPicture(uri: string, mimeType?: string): Promise<string> {
    try {
      let uploadData: Uint8Array | Blob;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        if (!response.ok) throw new ServerException('Failed to read image file');
        uploadData = await response.blob();
      } else {
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => resolve(xhr.response as ArrayBuffer);
          xhr.onerror = () => reject(new ServerException('Failed to read image file'));
          xhr.responseType = 'arraybuffer';
          xhr.open('GET', uri, true);
          xhr.send(null);
        });
        uploadData = new Uint8Array(arrayBuffer);
      }

      const contentType = mimeType ?? 'image/jpeg';
      const storageRef = ref(storage, `admin/profile_picture_${Date.now()}`);

      return new Promise((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, uploadData, { contentType });
        const timeoutId = setTimeout(() => {
          task.cancel();
          reject(new ServerException('Upload timed out'));
        }, 60000);

        task.on(
          'state_changed',
          () => clearTimeout(timeoutId),
          (err) => {
            clearTimeout(timeoutId);
            reject(new ServerException(err.message || 'Upload failed'));
          },
          async () => {
            clearTimeout(timeoutId);
            try {
              resolve(await getDownloadURL(task.snapshot.ref));
            } catch (err: unknown) {
              const e = err as { message?: string };
              reject(new ServerException(e.message ?? 'Failed to get download URL'));
            }
          },
        );
      });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const e = error as { message?: string };
      throw new ServerException(e.message ?? 'Failed to upload picture');
    }
  }
}
