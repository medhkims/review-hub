import { BusinessRepository } from '../repositories/businessRepository';
import { BusinessEntity } from '../entities/businessEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetBusinessesByCategoryUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(categoryId: string): Promise<Either<Failure, BusinessEntity[]>> {
    return this.businessRepository.getBusinessesByCategory(categoryId);
  }
}
