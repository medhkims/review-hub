import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SyncCriterionRemovedUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(categoryId: string, criterionLabel: string): Promise<Either<Failure, void>> {
    return this.businessRepository.syncCriterionRemovedFromBusinesses(categoryId, criterionLabel);
  }
}
