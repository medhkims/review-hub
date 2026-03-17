import { BusinessRepository } from '../repositories/businessRepository';
import { BusinessDetailEntity } from '../entities/businessDetailEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetApprovedBusinessesUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(): Promise<Either<Failure, BusinessDetailEntity[]>> {
    return this.businessRepository.getApprovedBusinesses();
  }
}
