import { BusinessRepository } from '../repositories/businessRepository';
import { BusinessEntity } from '../entities/businessEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetFeaturedBusinessesUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(): Promise<Either<Failure, BusinessEntity[]>> {
    return this.businessRepository.getFeaturedBusinesses();
  }
}
