import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class ToggleFavoriteUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(businessId: string, userId: string): Promise<Either<Failure, boolean>> {
    return this.businessRepository.toggleFavorite(businessId, userId);
  }
}
