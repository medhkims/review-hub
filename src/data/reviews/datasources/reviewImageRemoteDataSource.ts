import { storage } from '@/core/firebase/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ServerException } from '@/core/error/exceptions';
import { Platform } from 'react-native';

export interface ReviewImageRemoteDataSource {
  uploadReviewImage(userId: string, imageUri: string, mimeType?: string): Promise<string>;
}

export class ReviewImageRemoteDataSourceImpl implements ReviewImageRemoteDataSource {
  private readonly STORAGE_PATH = 'review_images';

  async uploadReviewImage(userId: string, imageUri: string, mimeType?: string): Promise<string> {
    try {
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

      const contentType = mimeType ?? 'image/jpeg';
      const extension = contentType.split('/')[1] ?? 'jpg';
      const filename = `review_${Date.now()}_${Math.random().toString(36).slice(2)}.${extension}`;
      const storagePath = `${this.STORAGE_PATH}/${userId}/${filename}`;
      const storageRef = ref(storage, storagePath);

      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, uploadData, { contentType });

        const timeoutId = setTimeout(() => {
          uploadTask.cancel();
          reject(new ServerException('Upload timed out. Please check your connection.', 'storage/timeout'));
        }, 60000);

        uploadTask.on(
          'state_changed',
          () => { clearTimeout(timeoutId); },
          (error) => {
            clearTimeout(timeoutId);
            reject(new ServerException(error.message || 'Upload failed', error.code));
          },
          async () => {
            clearTimeout(timeoutId);
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (err: unknown) {
              const e = err as { message?: string; code?: string };
              reject(new ServerException(e.message ?? 'Failed to get download URL', e.code));
            }
          },
        );
      });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const e = error as { message?: string; code?: string };
      throw new ServerException(e.message ?? 'Failed to upload image', e.code);
    }
  }
}
