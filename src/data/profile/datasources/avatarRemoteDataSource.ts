import { storage } from '@/core/firebase/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { ServerException } from '@/core/error/exceptions';

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
      // Fetch the image as a blob
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new ServerException('Failed to read image file');
      }

      const blob = await response.blob();
      const contentType = mimeType || blob.type || 'image/jpeg';
      const extension = contentType.split('/')[1] || 'jpg';

      // Create a unique filename with timestamp
      const filename = `avatar_${Date.now()}.${extension}`;
      const storagePath = `${this.STORAGE_PATH}/${userId}/${filename}`;
      const storageRef = ref(storage, storagePath);

      // Upload with progress tracking
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, blob, {
          contentType,
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (onProgress) {
              const progress = snapshot.bytesTransferred / snapshot.totalBytes;
              onProgress(progress);
            }
          },
          (error) => {
            reject(new ServerException(error.message || 'Upload failed', error.code));
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
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
