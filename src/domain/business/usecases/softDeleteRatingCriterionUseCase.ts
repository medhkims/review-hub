import { CategoryRepository } from '../repositories/categoryRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SoftDeleteRatingCriterionUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(categoryId: string, criterionKey: string): Promise<Either<Failure, void>> {
    return this.categoryRepository.softDeleteRatingCriterion(categoryId, criterionKey);
  }
}
