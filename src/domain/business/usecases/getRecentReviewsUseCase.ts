import { BusinessRepository } from '../repositories/businessRepository';
import { RecentReviewEntity } from '../entities/recentReviewEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetRecentReviewsUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(count: number = 10): Promise<Either<Failure, RecentReviewEntity[]>> {
    return this.businessRepository.getRecentReviews(count);
  }
}
