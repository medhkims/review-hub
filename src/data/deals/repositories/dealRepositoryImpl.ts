import { DealRepository } from '@/domain/deals/repositories/dealRepository';
import { DealEntity } from '@/domain/deals/entities/dealEntity';
import { DealRemoteDataSource } from '../datasources/dealRemoteDataSource';
import { DealMapper } from '../mappers/dealMapper';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';

export class DealRepositoryImpl implements DealRepository {
  constructor(private readonly remote: DealRemoteDataSource) {}

  async getActiveDeals(): Promise<Either<Failure, DealEntity[]>> {
    try {
      const models = await this.remote.getActiveDeals();
      return right(models.map(DealMapper.toEntity));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load deals';
      return left(new ServerFailure(message));
    }
  }
}
