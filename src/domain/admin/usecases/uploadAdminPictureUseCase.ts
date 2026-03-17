import { AdminInfoRepository } from '../repositories/adminInfoRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UploadAdminPictureUseCase {
  constructor(private readonly repository: AdminInfoRepository) {}

  async execute(uri: string, mimeType?: string): Promise<Either<Failure, string>> {
    return this.repository.uploadAdminPicture(uri, mimeType);
  }
}
