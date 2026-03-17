import { BusinessRepository, DuplicateCheckResult } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class CheckBusinessDuplicateUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(name: string, categoryId: string): Promise<Either<Failure, DuplicateCheckResult>> {
    return this.businessRepository.checkBusinessDuplicate(name, categoryId);
  }
}
