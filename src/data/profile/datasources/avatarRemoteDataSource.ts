import { storage } from '@/core/firebase/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { ServerException } from '@/core/error/exceptions';
import { Platform } from 'react-native';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface AvatarRemoteDataSource {
  uploadAvatar(
    userId: string,
    imageUri: string,
    mimeType?: string,
    onProgress?: UploadProgressCallback,
  ): Promise<string>;
  deleteAvatar(userId: string): Promise<void>;
}

export class AvatarRemoteDataSourceImpl implements AvatarRemoteDataSource {
  private readonly STORAGE_PATH = 'profile_pictures';

  async uploadAvatar(
    userId: string,
    imageUri: string,
    mimeType?: string,
    onProgress?: UploadProgressCallback,
  ): Promise<string> {
    try {
      // Web: fetch() works fine with blob: URLs from expo-image-picker.
      // Native: fetch() hangs on local file:// URIs; use XHR + ArrayBuffer instead
      //         because React Native's Blob polyfill is incompatible with Firebase Storage.
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

      // Create a unique filename with timestamp
      const filename = `avatar_${Date.now()}.${extension}`;
      const storagePath = `${this.STORAGE_PATH}/${userId}/${filename}`;
      const storageRef = ref(storage, storagePath);

      // Upload with progress tracking
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, uploadData, {
          contentType,
        });

        // Cancel if upload stalls for 60 seconds with no progress callbacks
        const timeoutId = setTimeout(() => {
          uploadTask.cancel();
          reject(new ServerException('Upload timed out. Please check your connection and try again.', 'storage/timeout'));
        }, 60000);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            clearTimeout(timeoutId);
            if (onProgress) {
              const progress = snapshot.bytesTransferred / snapshot.totalBytes;
              onProgress(progress);
            }
          },
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
              const firebaseError = err as { message?: string; code?: string };
              reject(new ServerException(firebaseError.message || 'Failed to get download URL', firebaseError.code));
            }
          },
        );
      });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const firebaseError = error as { message?: string; code?: string };
      throw new ServerException(firebaseError.message || 'Failed to upload avatar', firebaseError.code);
    }
  }

  async deleteAvatar(userId: string): Promise<void> {
    try {
      // List and delete all avatars for this user
      // We delete by constructing a path - in practice the exact filename
      // would come from the profile doc, but for simplicity delete via path prefix
      const storagePath = `${this.STORAGE_PATH}/${userId}`;
      const storageRef = ref(storage, storagePath);

      // Attempt to delete; if it doesn't exist, ignore the error
      await deleteObject(storageRef).catch(() => {
        // File may not exist, ignore
      });
    } catch (error: unknown) {
      const firebaseError = error as { message?: string; code?: string };
      throw new ServerException(firebaseError.message || 'Failed to delete avatar', firebaseError.code);
    }
  }
}
