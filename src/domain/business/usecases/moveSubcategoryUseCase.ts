import { CategoryRepository } from '../repositories/categoryRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class MoveSubcategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    fromCategoryId: string,
    subcategoryId: string,
    toCategoryId: string,
  ): Promise<Either<Failure, void>> {
    return this.categoryRepository.moveSubcategory(fromCategoryId, subcategoryId, toCategoryId);
  }
}
