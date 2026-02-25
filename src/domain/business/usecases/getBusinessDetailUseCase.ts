import { BusinessRepository } from '../repositories/businessRepository';
import { BusinessDetailEntity } from '../entities/businessDetailEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetBusinessDetailUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(businessId: string): Promise<Either<Failure, BusinessDetailEntity>> {
    return this.businessRepository.getBusinessDetail(businessId);
  }
}
