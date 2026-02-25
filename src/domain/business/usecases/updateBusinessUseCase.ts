import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UpdateBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(businessId: string, data: Record<string, unknown>): Promise<Either<Failure, void>> {
    return this.businessRepository.updateBusiness(businessId, data);
  }
}
