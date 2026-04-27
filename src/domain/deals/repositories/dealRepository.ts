import { DealEntity } from '../entities/dealEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface DealRepository {
  getActiveDeals(): Promise<Either<Failure, DealEntity[]>>;
}
