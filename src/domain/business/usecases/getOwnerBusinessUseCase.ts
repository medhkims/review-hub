import { BusinessRepository } from '../repositories/businessRepository';
import { BusinessDetailEntity } from '../entities/businessDetailEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetOwnerBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(userId: string): Promise<Either<Failure, BusinessDetailEntity | null>> {
    return this.businessRepository.getBusinessByOwnerId(userId);
  }
}
