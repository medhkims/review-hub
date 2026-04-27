import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetBusinessCategoryStatsUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  execute(): Promise<Either<Failure, Record<string, { total: number; bySubcategory: Record<string, number> }>>> {
    return this.businessRepository.getBusinessCategoryStats();
  }
}
