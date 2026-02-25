import { ProfileEntity } from '../entities/profileEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface ProfileRepository {
  getProfile(userId: string): Promise<Either<Failure, ProfileEntity>>;
  updateProfile(userId: string, updates: Partial<ProfileEntity>): Promise<Either<Failure, ProfileEntity>>;
  updateEmail(userId: string, newEmail: string): Promise<Either<Failure, void>>;
  uploadAvatar(
    userId: string,
    imageUri: string,
    mimeType?: string,
    onProgress?: UploadProgressCallback,
  ): Promise<Either<Failure, string>>;
}
