import { BusinessRepository } from '../repositories/businessRepository';
import { ReviewEntity } from '../entities/reviewEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetBusinessReviewsUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(businessId: string): Promise<Either<Failure, ReviewEntity[]>> {
    return this.businessRepository.getBusinessReviews(businessId);
  }
}
