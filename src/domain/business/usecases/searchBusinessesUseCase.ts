import { BusinessRepository } from '../repositories/businessRepository';
import { BusinessEntity } from '../entities/businessEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SearchBusinessesUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(query: string): Promise<Either<Failure, BusinessEntity[]>> {
    return this.businessRepository.searchBusinesses(query);
  }
}
