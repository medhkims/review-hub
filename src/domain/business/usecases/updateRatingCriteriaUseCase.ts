import { CategoryRepository } from '../repositories/categoryRepository';
import { RatingCriterionEntity } from '../entities/ratingCriterionEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UpdateRatingCriteriaUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    categoryId: string,
    criteria: RatingCriterionEntity[],
  ): Promise<Either<Failure, void>> {
    return this.categoryRepository.updateRatingCriteria(categoryId, criteria);
  }
}
