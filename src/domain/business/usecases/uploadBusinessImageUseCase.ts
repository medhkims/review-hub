import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UploadBusinessImageUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(businessId: string, imageUri: string, type: 'cover' | 'logo' | 'menu' | 'gallery'): Promise<Either<Failure, string>> {
    return this.businessRepository.uploadBusinessImage(businessId, imageUri, type);
  }
}
