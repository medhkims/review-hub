import { BusinessRepository } from '../repositories/businessRepository';
import { BusinessEntity } from '../entities/businessEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class FuzzySearchBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(
    query: string,
    categoryId?: string | null,
  ): Promise<Either<Failure, BusinessEntity | null>> {
    return this.businessRepository.fuzzySearchBusiness(query, categoryId);
  }
}
