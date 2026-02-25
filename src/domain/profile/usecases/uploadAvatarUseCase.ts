import { ProfileRepository, UploadProgressCallback } from '../repositories/profileRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UploadAvatarUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(
    userId: string,
    imageUri: string,
    mimeType?: string,
    onProgress?: UploadProgressCallback,
  ): Promise<Either<Failure, string>> {
    return this.profileRepository.uploadAvatar(userId, imageUri, mimeType, onProgress);
  }
}
