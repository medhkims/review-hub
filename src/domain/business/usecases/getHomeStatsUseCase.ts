import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface HomeStats {
  totalBusinesses: number;
  totalReviews: number;
}

export class GetHomeStatsUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(): Promise<Either<Failure, HomeStats>> {
    return this.businessRepository.getHomeStats();
  }
}
