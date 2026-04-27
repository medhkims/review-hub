import { DealRepository } from '../repositories/dealRepository';
import { DealEntity } from '../entities/dealEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetActiveDealsUseCase {
  constructor(private readonly dealRepository: DealRepository) {}

  async execute(): Promise<Either<Failure, DealEntity[]>> {
    return this.dealRepository.getActiveDeals();
  }
}
