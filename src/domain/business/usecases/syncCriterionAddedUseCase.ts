import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SyncCriterionAddedUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(categoryId: string, criterion: { name: string; icon: string }): Promise<Either<Failure, void>> {
    return this.businessRepository.syncCriterionAddedToBusinesses(categoryId, criterion);
  }
}
